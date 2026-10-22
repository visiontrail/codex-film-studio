#!/usr/bin/env python3
"""Standalone, resumable Chatterbox narration; no task database or FFmpeg.

Example: python scripts/speech.py content/narration.json --frontier-root PATH
Read-only probe: python scripts/speech.py --frontier-root PATH --check

Provider WAVs, requests and failure evidence stay under media/audio/provider.
Identity/waveform checks do not certify words, pronunciation or listening.
"""
from __future__ import annotations

import argparse
import array
import fcntl
import hashlib
import json
import math
import os
from pathlib import Path
import re
import sys
import time
import urllib.error
import urllib.request
import uuid
import wave

ROOT = Path(__file__).resolve().parents[1]
PIN_DEFAULTS = {
    "CHATTERBOX_TTS_URL": "http://10.60.11.3:8092",
    "CHATTERBOX_TTS_SOURCE_REVISION": "5de7a54aa4e5e2baadb0182dde554908b48b85c2",
    "CHATTERBOX_TTS_MODEL_REVISION": "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18",
    "CHATTERBOX_TTS_MODEL_VARIANT": "v2",
}
RETRYABLE_FAILURES = {
    "service_restarted", "service_stopping", "generation_timeout",
    "model_process_exited", "generation_failed", "decoder_duration_limit",
}
SYNTHESIS_DEFAULTS = {
    "exaggeration": 0.5, "cfg_weight": 0.5, "temperature": 0.8,
    "repetition_penalty": 2.0, "min_p": 0.05, "top_p": 1.0, "speed": 1.0,
}


def digest(value):
    raw = value if isinstance(value, bytes) else json.dumps(
        value, sort_keys=True, ensure_ascii=False, separators=(",", ":")
    ).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temp.replace(path)


def read_json(path, default=None):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


def configuration(args):
    values = dict(PIN_DEFAULTS)
    if args.frontier_root:
        dotenv = args.frontier_root / ".env"
        if dotenv.exists():
            for line in dotenv.read_text(encoding="utf-8").splitlines():
                match = re.match(r"^\s*(?:export\s+)?(CHATTERBOX_[A-Z0-9_]+)\s*=\s*(.*?)\s*$", line)
                if match:
                    value = match[2]
                    if value[:1] in {"'", '"'} and value[-1:] == value[:1]:
                        value = value[1:-1]
                    values[match[1]] = value
        settings = read_json(args.frontier_root / "data/settings.json", {})
        values.update({k: v for k, v in settings.get("values", settings).items()
                       if k.startswith("CHATTERBOX_")})
    values.update({k: v for k, v in os.environ.items() if k.startswith("CHATTERBOX_")})
    for required in ("CHATTERBOX_TTS_API_KEY", "CHATTERBOX_TTS_DEPLOYMENT_FINGERPRINT"):
        if not values.get(required):
            raise RuntimeError(f"Missing configured {required}; no request submitted")
    return values


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class Client:
    def __init__(self, values):
        self.base = str(values["CHATTERBOX_TTS_URL"]).rstrip("/")
        self.key = values["CHATTERBOX_TTS_API_KEY"]
        self.opener = urllib.request.build_opener(NoRedirect())

    def request(self, method, path, payload=None, idem=None, binary=False):
        headers = {"X-API-Key": self.key}
        if payload is not None:
            headers["Content-Type"] = "application/json"
        if idem:
            headers["Idempotency-Key"] = idem
        data = None if payload is None else json.dumps(payload).encode("utf-8")
        for attempt in range(6):
            try:
                req = urllib.request.Request(self.base + path, data=data, headers=headers, method=method)
                with self.opener.open(req, timeout=45) as response:
                    raw = response.read()
                return raw if binary else json.loads(raw)
            except urllib.error.HTTPError as error:
                if error.code not in {429, 500, 502, 503, 504} or attempt == 5:
                    raise RuntimeError(f"Chatterbox HTTP {error.code}; original checkpoint retained") from None
            except (urllib.error.URLError, TimeoutError, OSError):
                if attempt == 5:
                    raise RuntimeError("Chatterbox transport unavailable; original checkpoint retained") from None
            time.sleep(min(20, 2 ** attempt))


def validate_capabilities(cap, values, requested_voice):
    pins = {
        "source_revision": "CHATTERBOX_TTS_SOURCE_REVISION",
        "model_revision": "CHATTERBOX_TTS_MODEL_REVISION",
        "model_variant": "CHATTERBOX_TTS_MODEL_VARIANT",
        "fingerprint": "CHATTERBOX_TTS_DEPLOYMENT_FINGERPRINT",
    }
    for field, setting in pins.items():
        if cap.get(field) != values[setting]:
            raise RuntimeError(f"Configured Chatterbox {field} differs from deployed service")
    voices = {voice["id"]: voice for voice in cap.get("voices", [])}
    preferred = requested_voice or values.get("CHATTERBOX_VOICE") or values.get("CHATTERBOX_TTS_VOICE") or "space-en-f1"
    if preferred not in voices or not voices[preferred].get("fingerprint"):
        raise RuntimeError(f"Requested voice {preferred!r} lacks an installed fingerprint")
    if not isinstance(cap.get("max_chars"), int) or cap["max_chars"] < 1:
        raise RuntimeError("Invalid provider max_chars")
    return voices[preferred]


def split_text(text, limit):
    """Losslessly split whitespace-normalized source at sentences then words."""
    text = " ".join(text.split())
    if not text:
        raise ValueError("Empty narration")
    chunks, pending = [], ""
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        units = [sentence] if len(sentence) <= limit else sentence.split()
        for unit in units:
            if len(unit) > limit:
                raise ValueError("A narration token exceeds provider max_chars")
            candidate = f"{pending} {unit}".strip()
            if len(candidate) > limit:
                chunks.append(pending)
                pending = unit
            else:
                pending = candidate
    if pending:
        chunks.append(pending)
    if " ".join(chunks) != text or any(not chunk or len(chunk) > limit for chunk in chunks):
        raise RuntimeError("Lossless narration split invariant failed")
    return chunks


def validate_terminal(job, job_id, payload, cap, voice):
    expected = {
        "id": job_id, "request": payload, "text_sha256": digest(payload["text"].encode()),
        "fingerprint": cap["fingerprint"], "voice_fingerprint": voice["fingerprint"],
        **{key: cap[key] for key in ("source_revision", "model_revision", "model_variant")},
    }
    for field, value in expected.items():
        if job.get(field) != value:
            raise RuntimeError(f"Provider terminal identity mismatch: {field}")


def inspect_wav(path, bounded=True):
    with wave.open(str(path), "rb") as wav:
        rate, channels, width, frames = wav.getframerate(), wav.getnchannels(), wav.getsampwidth(), wav.getnframes()
        data = wav.readframes(frames)
    if (rate, channels, width) != (24000, 1, 2) or len(data) != frames * 2:
        raise RuntimeError("Provider WAV is not complete 24 kHz mono PCM16")
    duration = frames / rate
    if duration <= 0.15 or (bounded and duration >= 38.8):
        raise RuntimeError("Provider duration invalid or reaches decoder ceiling")
    samples = array.array("h", data)
    if sys.byteorder != "little":
        samples.byteswap()
    peak = max(abs(sample) for sample in samples) / 32768
    rms = math.sqrt(sum(sample * sample for sample in samples) / len(samples)) / 32768
    if peak < 0.001 or rms < 0.0001:
        raise RuntimeError("Provider WAV is effectively silent")
    return {"duration": duration, "frames": frames, "sample_rate": rate,
            "channels": channels, "sample_width": width, "peak": peak,
            "rms": rms, "audio_sha256": digest(path.read_bytes())}


def acquire_part(client, cap, voice, text, source_hash, line_id, part_index, args):
    identity = digest({"source_sha256": source_hash, "text": text, "voice": voice,
                       "fingerprint": cap["fingerprint"], "seed": args.seed,
                       "parameters": SYNTHESIS_DEFAULTS})
    folder = args.output / "provider" / f"{line_id}-{identity[:16]}"
    folder.mkdir(parents=True, exist_ok=True)
    for attempt in range(args.attempts):
        payload = {"text": text, "language_id": "en", "voice": voice["id"],
                   "seed": (args.seed + attempt) % (2 ** 32), **SYNTHESIS_DEFAULTS}
        path = folder / f"part-{part_index:02d}.attempt-{attempt + 1:02d}.json"
        checkpoint = read_json(path)
        expected = digest({"identity": identity, "payload": payload})
        if checkpoint is None:
            checkpoint = {"identity": expected, "source_sha256": source_hash,
                          "payload": payload, "idempotency_key": uuid.uuid4().hex}
            save(path, checkpoint)
        elif checkpoint.get("identity") != expected:
            raise RuntimeError("Saved request identity changed; original evidence retained")
        if checkpoint.get("terminal_failure"):
            if checkpoint["terminal_failure"].get("error") not in RETRYABLE_FAILURES:
                raise RuntimeError("Non-retryable provider failure retained")
            continue
        if "job_id" not in checkpoint:
            response = client.request("POST", "/v1/jobs", payload, checkpoint["idempotency_key"])
            checkpoint["job_id"] = response["id"]
            save(path, checkpoint)
        job_id = checkpoint["job_id"]
        deadline, previous = time.monotonic() + args.timeout, None
        while True:
            job = client.request("GET", f"/v1/jobs/{job_id}")
            status = job.get("status")
            if status != previous:
                print(f"{line_id}/{part_index:02d} attempt {attempt + 1}: {status}", flush=True)
                previous = status
            if status in {"completed", "failed"}:
                validate_terminal(job, job_id, payload, cap, voice)
                checkpoint["terminal_job"] = job
                save(path, checkpoint)
                break
            if status not in {"queued", "running"} or time.monotonic() >= deadline:
                raise RuntimeError("Provider wait ended; resume retains exact job and idempotency key")
            time.sleep(args.poll)
        if status == "failed":
            checkpoint["terminal_failure"] = {"job_id": job_id, "error": job.get("error")}
            save(path, checkpoint)
            if job.get("error") not in RETRYABLE_FAILURES:
                raise RuntimeError("Non-retryable provider failure; evidence retained")
            continue
        wav_path = path.with_suffix(".wav")
        if not wav_path.exists():
            data = client.request("GET", f"/v1/jobs/{job_id}/audio", binary=True)
            if digest(data) != job.get("audio_sha256"):
                raise RuntimeError("Downloaded WAV differs from completed provider hash")
            wav_path.write_bytes(data)
        info = inspect_wav(wav_path)
        if info["audio_sha256"] != job.get("audio_sha256"):
            raise RuntimeError("Saved provider WAV changed; original checkpoint retained")
        return {"path": str(wav_path.relative_to(args.output)), "job_id": job_id,
                "text": text, "attempt": attempt + 1, **info}
    raise RuntimeError(f"{line_id}/{part_index:02d}: exhausted {args.attempts} preserved provider attempts")


def synthesize(args, client, cap, voice):
    data = json.loads(args.input.read_text(encoding="utf-8"))
    lines = data.get("lines", data.get("narration")) if isinstance(data, dict) else data
    if not isinstance(lines, list) or not lines:
        raise ValueError("Input must contain a nonempty array of narration lines")
    ids = [str(line["id"]) for line in lines]
    if len(ids) != len(set(ids)) or any(not re.fullmatch(r"[A-Za-z0-9_-]+", value) for value in ids):
        raise ValueError("Narration IDs must be unique safe filenames")
    selected = set(args.only.split(",")) if args.only else set(ids)
    if not selected <= set(ids):
        raise ValueError("Unknown --only narration ID")
    args.output.mkdir(parents=True, exist_ok=True)
    save(args.output / "capabilities.json", cap)
    manifest_path = args.output / "manifest.json"
    previous = {str(row["id"]): row for row in read_json(manifest_path, [])}
    for line in lines:
        line_id = str(line["id"])
        if line_id not in selected:
            continue
        source = " ".join(str(line["text"]).split())
        synthesis = " ".join(str(line.get("synthesis_text", source)).split())
        source_hash = digest(source.encode())
        parts = [acquire_part(client, cap, voice, text, source_hash, line_id, index, args)
                 for index, text in enumerate(split_text(synthesis, min(250, cap["max_chars"])), 1)]
        assembly = digest({"parts": [part["audio_sha256"] for part in parts], "gap": args.part_gap})
        final = args.output / f"{line_id}-{assembly[:12]}.wav"
        assembly_record = final.with_suffix(".assembly.json")
        if not final.exists():
            temporary = final.with_suffix(".tmp.wav")
            with wave.open(str(temporary), "wb") as stream:
                stream.setnchannels(1)
                stream.setsampwidth(2)
                stream.setframerate(24000)
                for index, part in enumerate(parts):
                    with wave.open(str(args.output / part["path"]), "rb") as original:
                        stream.writeframes(original.readframes(original.getnframes()))
                    if index < len(parts) - 1:
                        stream.writeframes(b"\0\0" * round(24000 * args.part_gap))
            temporary.replace(final)
        info = inspect_wav(final, bounded=False)
        saved_assembly = read_json(assembly_record)
        if saved_assembly is not None and (saved_assembly.get("identity") != assembly or
                                           saved_assembly.get("audio_sha256") != info["audio_sha256"]):
            raise RuntimeError("Assembled WAV differs from its saved identity; evidence retained")
        if saved_assembly is None:
            # Recover safely if execution stopped between WAV and metadata writes.
            expected_pcm = bytearray()
            for index, part in enumerate(parts):
                with wave.open(str(args.output / part["path"]), "rb") as original:
                    expected_pcm.extend(original.readframes(original.getnframes()))
                if index < len(parts) - 1:
                    expected_pcm.extend(b"\0\0" * round(24000 * args.part_gap))
            with wave.open(str(final), "rb") as assembled:
                actual_pcm = assembled.readframes(assembled.getnframes())
            if bytes(expected_pcm) != actual_pcm:
                raise RuntimeError("Unrecorded assembled WAV differs from preserved provider PCM")
            save(assembly_record, {"identity": assembly, "audio_sha256": info["audio_sha256"]})
        previous[line_id] = {**line, "id": line_id, "text": source, "synthesis_text": synthesis,
                             "source_sha256": source_hash, "synthesis_sha256": digest(synthesis.encode()),
                             "file": final.name, "path": os.path.relpath(final, ROOT),
                             "voice": voice["id"], "voice_fingerprint": voice["fingerprint"],
                             "deployment_fingerprint": cap["fingerprint"], "speed": 1.0,
                             "parts": parts, "verification": {
                                 "provider_identity": "verified", "pcm_waveform": "verified",
                                 "word_and_pronunciation": "pending independent review", "listening": "pending"},
                             **info}
        save(manifest_path, [previous[value] for value in ids if value in previous])
        print(f"{line_id}: saved {info['duration']:.3f}s, {len(parts)} provider parts", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", nargs="?", type=Path, default=ROOT / "content/narration.json")
    parser.add_argument("--frontier-root", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "media/audio")
    parser.add_argument("--voice")
    parser.add_argument("--seed", type=int, default=420)
    parser.add_argument("--poll", type=float, default=5)
    parser.add_argument("--timeout", type=float, default=7200)
    parser.add_argument("--part-gap", type=float, default=0.14)
    parser.add_argument("--attempts", type=int, choices=(1, 2, 3), default=3)
    parser.add_argument("--only", help="Comma-separated line IDs; other manifest rows retained")
    parser.add_argument("--check", action="store_true", help="Read capabilities only; submit no speech")
    args = parser.parse_args()
    args.output = args.output.resolve()
    if args.poll < 1 or args.timeout <= 0 or args.part_gap < 0:
        parser.error("Invalid polling, timeout or gap")
    values = configuration(args)
    client = Client(values)
    cap = client.request("GET", "/v1/capabilities")
    voice = validate_capabilities(cap, values, args.voice)
    if args.check:
        print(json.dumps({"available": True, "configured_pins_match": True,
                          "model_variant": cap["model_variant"], "max_chars": cap["max_chars"],
                          "selected_voice": voice["id"],
                          "available_voices": [item["id"] for item in cap["voices"]]}, indent=2))
        return
    args.output.mkdir(parents=True, exist_ok=True)
    with (args.output / ".speech.lock").open("a+") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise RuntimeError("Another speech client owns this output directory") from None
        synthesize(args, client, cap, voice)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError) as error:
        raise SystemExit(str(error)) from None
