"""Independent Chatterbox client with immutable, resumable evidence.

Reads the existing service configuration in memory. Never creates an application
task, changes settings, invokes the application's TTS pipeline, or uses FFmpeg.
Use --trial for the audition; normal input is content/narration.json.
"""

from __future__ import annotations

import argparse
import array
import difflib
import hashlib
import io
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
import wave

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = "/Volumes/TP-1TB/WorspacePlus/IslaProject/FrontierTechSN"
TRIAL_TEXTS = {
    "en": "First time in Singapore? Leave some room in the plan. Give three days to three routes.",
    "zh": "第一次来新加坡，别急着把景点塞满。把三天交给三条路线。",
}


def digest(value):
    raw = value if isinstance(value, bytes) else json.dumps(
        value, sort_keys=True, ensure_ascii=False, separators=(",", ":")
    ).encode()
    return hashlib.sha256(raw).hexdigest()


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(path)


def read_wav(raw):
    with wave.open(io.BytesIO(raw)) as wav:
        channels, rate, width = wav.getnchannels(), wav.getframerate(), wav.getsampwidth()
        count = wav.getnframes()
        pcm = wav.readframes(count)
    if (channels, rate, width) != (1, 24000, 2):
        raise ValueError(f"Unexpected provider WAV format: {(channels, rate, width)}")
    samples = array.array("h", pcm)
    if sys.byteorder != "little":
        samples.byteswap()
    if not count or len(samples) != count:
        raise ValueError("Empty or truncated WAV")
    peak = max(abs(x) for x in samples) / 32768
    rms = (sum((x / 32768) ** 2 for x in samples) / count) ** 0.5
    return {"sample_rate": rate, "channels": channels, "sample_width": width,
            "frames": count, "duration": count / rate, "peak": peak, "rms": rms,
            "clipped_samples": sum(abs(x) >= 32767 for x in samples)}, samples


def normalized_text(text):
    return re.sub(r"[^\w\u3400-\u9fff]", "", text.lower())


def trim_delivery_tail(args):
    """Create an explicit source-bound delivery derivative; retain provider PCM."""
    if args.cutoff is None or not args.review_note:
        raise ValueError("Tail repair requires an explicit cutoff and evidence-based review note")
    out = ROOT / "media/audio"
    review = ROOT / "review/asr"
    if args.candidate:
        out = out / "candidates" / args.candidate
        review = review / "candidates" / args.candidate
    manifest_path = out / "manifest.json"
    rows = json.loads(manifest_path.read_text())
    row = next(x for x in rows if x["id"] == args.trim_tail)
    original = ROOT / row.get("provider_path", row["path"])
    raw = original.read_bytes()
    expected_hash = row.get("provider_audio_sha256", row["audio_sha256"])
    if digest(raw) != expected_hash:
        raise ValueError("Provider WAV changed before tail repair")
    metadata, samples = read_wav(raw)
    asr = json.loads((ROOT / row["asr"]).read_text())
    words = [word for segment in asr["segments"] for word in segment.get("words", [])]
    last_word_end = max(word["end"] for word in words)
    if args.cutoff < last_word_end + 0.08 or args.cutoff > metadata["duration"] - 0.3:
        raise ValueError("Tail boundary must preserve the complete final word and remove a meaningful tail")
    end_frame = round(args.cutoff * metadata["sample_rate"])
    neighborhood = samples[max(0, end_frame - 720):end_frame + 720]
    rms = (sum((value / 32768) ** 2 for value in neighborhood) / len(neighborhood)) ** 0.5
    peak = max(abs(value) for value in neighborhood) / 32768
    if rms > 0.012 or peak > 0.08:
        raise ValueError("Proposed tail boundary is not in a quiet waveform interval")
    retained = samples[:end_frame]
    if sys.byteorder != "little":
        retained.byteswap()
    destination = out / "delivery" / f"{row['id']}-{expected_hash[:12]}-tail-{end_frame}.wav"
    destination.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(destination), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(metadata["sample_rate"])
        wav.writeframes(retained.tobytes())
    delivered = destination.read_bytes()
    new_metadata, _ = read_wav(delivered)
    evidence = {
        "operation": "Retain an exact prefix of original provider PCM; remove only the reviewed post-source tail",
        "provider_audio_sha256": expected_hash, "delivery_audio_sha256": digest(delivered),
        "source_sha256": row["source_sha256"], "cutoff_frame": end_frame,
        "cutoff_seconds": end_frame / metadata["sample_rate"], "last_asr_word_end": last_word_end,
        "boundary_rms": rms, "boundary_peak": peak, "review_note": args.review_note,
        "provider_retained": str(original.relative_to(ROOT)), "speed": 1.0,
        "listening": "No subjective listening claim; source coverage and waveform boundary were reviewed",
    }
    save(review / f"{row['id']}-tail-repair-{expected_hash[:12]}.json", evidence)
    asr_path = review / f"{row['id']}-delivery-{digest(delivered)[:12]}.json"
    result = transcribe(destination, row["text"], asr_path, row["language"])
    updated = {**row, **new_metadata, "provider_path": str(original.relative_to(ROOT)),
               "provider_audio_sha256": expected_hash, "path": str(destination.relative_to(ROOT)),
               "audio_sha256": digest(delivered), "delivery_derivative": evidence,
               "asr": str(asr_path.relative_to(ROOT)), "asr_differences": result["differences"],
               "word_timestamps": [word for segment in result["segments"] for word in segment.get("words", [])]}
    lines = json.loads(args.script.read_text())
    update_manifest(manifest_path, updated, lines["lines"] if isinstance(lines, dict) else lines)
    print(row["id"], "tail derivative", new_metadata["duration"], "seconds", flush=True)


def update_manifest(path, row, lines):
    import fcntl
    with path.with_suffix(".lock").open("w") as lock:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        current = {x["id"]: x for x in json.loads(path.read_text())} if path.exists() else {}
        current[row["id"]] = row
        save(path, [current[x["id"]] for x in lines if x["id"] in current])


def local_generation(args):
    """Reuse verified weights read-only in an isolated CPU process, without HTTP."""
    import fcntl
    import gc
    import importlib.metadata
    import random

    runtime = args.local_runtime.resolve()
    os.environ.update({"HF_HOME": str(runtime / "cache/huggingface"),
                       "PKUSEG_HOME": str(runtime / "cache/pkuseg"),
                       "HF_HUB_OFFLINE": "1", "PYTHONDONTWRITEBYTECODE": "1",
                       "TQDM_DISABLE": "1"})
    sys.path.insert(0, str(runtime))
    from prefetch_models import FILES, REVISION, valid_file
    from prefetch_reference import verify_reference
    from apply_space_alignment import verify_patch
    from service import Settings, _load_model, SOURCE_REVISION
    import numpy as np
    import soundfile as sf
    import torch

    out, provider = ROOT / "media/audio", ROOT / "media/provider"
    asr_root = ROOT / "review/asr"
    if args.candidate:
        if not re.fullmatch(r"[A-Za-z0-9_-]+", args.candidate):
            raise ValueError("Unsafe candidate label")
        out = out / "candidates" / args.candidate
        provider = provider / "candidates" / args.candidate
        asr_root = asr_root / "candidates" / args.candidate
    out.mkdir(parents=True, exist_ok=True)
    provider.mkdir(parents=True, exist_ok=True)
    lock = (provider / "local-cpu.lock").open("w")
    fcntl.flock(lock.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    snapshot = runtime / "cache/huggingface/hub/models--ResembleAI--chatterbox/snapshots" / REVISION
    for item in FILES:
        if not valid_file(snapshot / item["name"], item):
            raise ValueError("Unverified local model file: " + item["name"])
    if args.reference_audio:
        reference = args.reference_audio.resolve()
        reference_sha = digest(reference.read_bytes())
        if not args.reference_sha256 or reference_sha != args.reference_sha256:
            raise ValueError("Explicit voice reference does not match its pinned SHA256")
    else:
        reference = runtime / "voices/en_f1.flac"
        reference_sha = verify_reference(reference)
        if args.voice != "space-en-f1":
            raise ValueError("Supply a pinned explicit reference for another local voice")
    source = json.loads(importlib.metadata.distribution("chatterbox-tts").read_text("direct_url.json"))
    if source.get("vcs_info", {}).get("commit_id") != SOURCE_REVISION:
        raise ValueError("Local Chatterbox source revision mismatch")
    environment = {
        "provider": "Chatterbox Multilingual V2", "mode": "isolated_local_cpu",
        "source_revision": SOURCE_REVISION, "model_revision": REVISION,
        "model_files": FILES, "reference_sha256": reference_sha,
        "reference_voice": args.voice,
        "alignment": verify_patch(), "device": "cpu", "cpu_threads": 4,
        "service_loader_sha256": digest((runtime / "service.py").read_bytes()),
        "versions": {name: importlib.metadata.version(name) for name in
                     ("torch", "torchaudio", "numpy", "transformers", "chatterbox-tts", "resemble-perth")},
        "weights_reused_read_only": True,
    }
    environment["fingerprint"] = digest(environment)
    save(provider / "local-environment.json", environment)
    lines = json.loads(args.script.read_text())
    if isinstance(lines, dict):
        lines = lines["lines"]
    if args.only:
        lines = [row for row in lines if row["id"] in args.only]
    model = None
    asr_rows = []
    for old_line in lines:
        fresh = json.loads(args.script.read_text())
        if isinstance(fresh, dict):
            fresh = fresh["lines"]
        line = next(row for row in fresh if row["id"] == old_line["id"])
        ident, text = str(line["id"]), line["text"]
        if line.get("language", args.language) != args.language:
            raise ValueError(f"Narration {ident} language differs from --language")
        seed = json.loads(args.seed_map).get(ident, args.seed)
        if not re.fullmatch(r"[A-Za-z0-9_-]+", ident) or not 1 <= len(text) <= 250:
            raise ValueError("Invalid local line ID or source length")
        payload = {"text": text, "language_id": args.language, "voice": args.voice,
                   "seed": seed, "exaggeration": 0.5, "cfg_weight": 0.5,
                   "temperature": 0.8, "repetition_penalty": 2.0, "min_p": 0.05,
                   "top_p": 1.0, "speed": 1.0}
        binding = {"payload": payload, "environment": environment["fingerprint"]}
        if args.pcm_peak_limit is not None:
            if not 0 < args.pcm_peak_limit < 1:
                raise ValueError("PCM peak limit must be between zero and one")
            binding["pcm_peak_limit"] = args.pcm_peak_limit
        identity = digest(binding)
        stem = f"{ident}-{identity[:12]}"
        wav_path = out / f"{stem}.wav"
        job_path = provider / f"{stem}.local-job.json"
        state = json.loads(job_path.read_text()) if job_path.exists() else {
            "id": "local-cpu-" + identity, "identity": identity, "request": payload,
            "provider_mode": "isolated_local_cpu", "source_sha256": digest(text.encode()),
            "environment_fingerprint": environment["fingerprint"], "created_at": time.time(),
            "attempts": [],
        }
        if state["identity"] != identity or state["request"] != payload:
            raise ValueError("Local request identity changed")
        save(provider / f"{stem}.local-request.json", {"identity": identity, **binding})
        if not wav_path.exists() or state.get("status") != "completed":
            if len(state["attempts"]) >= 3:
                raise RuntimeError("Local bounded generation attempts exhausted")
            if model is None:
                started = time.monotonic()
                model = _load_model(Settings(api_key="", data_dir=provider, device="cpu", cpu_threads=4))
                print("local model ready", round(time.monotonic() - started, 2), "seconds", flush=True)
            random.seed(seed)
            np.random.seed(seed)
            torch.manual_seed(seed)
            state["status"] = "running"
            state["started_at"] = time.time()
            state["attempts"].append({"started_at": state["started_at"], "seed": seed})
            save(job_path, state)
            print(ident, "local CPU generating", flush=True)
            kwargs = {key: payload[key] for key in ("language_id", "exaggeration", "cfg_weight",
                      "temperature", "repetition_penalty", "min_p", "top_p")}
            try:
                with torch.inference_mode():
                    values = model.generate(text, audio_prompt_path=str(reference), **kwargs)
                values = values.detach().cpu().numpy().reshape(-1)
                if not len(values) or not np.isfinite(values).all() or len(values) / model.sr >= 38.7:
                    raise ValueError("Invalid local waveform or decoder ceiling")
                float_peak = float(np.max(np.abs(values)))
                gain = 1.0
                if args.pcm_peak_limit is not None:
                    float_path = out / "float" / f"{stem}.npy"
                    float_path.parent.mkdir(parents=True, exist_ok=True)
                    np.save(float_path, values)
                    gain = min(1.0, args.pcm_peak_limit / float_peak)
                    values = values * gain
                    state["pcm_conversion"] = {
                        "float_peak": float_peak, "gain": gain, "peak_limit": args.pcm_peak_limit,
                        "float_path": str(float_path.relative_to(ROOT)),
                        "float_sha256": digest(float_path.read_bytes()),
                        "operation": "Linear gain applied before PCM16 quantization; no time or pitch changes",
                    }
                sf.write(str(wav_path), values, model.sr, format="WAV", subtype="PCM_16")
                state.update(status="completed", finished_at=time.time(), audio_sha256=digest(wav_path.read_bytes()))
                save(job_path, state)
            except Exception as error:
                state.update(status="failed", finished_at=time.time(), error_type=type(error).__name__)
                save(job_path, state)
                raise
        if digest(wav_path.read_bytes()) != state["audio_sha256"]:
            raise ValueError("Local cached waveform hash changed")
        metadata, _ = read_wav(wav_path.read_bytes())
        row = {**line, "path": str(wav_path.relative_to(ROOT)), "identity": identity,
               "source_sha256": digest(text.encode()), "audio_sha256": state["audio_sha256"],
               "job_id": state["id"], "provider_mode": "isolated_local_cpu",
               "environment_fingerprint": environment["fingerprint"], "voice": args.voice,
               "language": args.language, "speech_speed": 1.0, **metadata,
               "listening": "Not established by container, waveform or ASR checks"}
        if state.get("pcm_conversion"):
            row["pcm_conversion"] = state["pcm_conversion"]
        selected_asr = asr_root / f"{stem}.json"
        if (out / "manifest.json").exists():
            previous = next((x for x in json.loads((out / "manifest.json").read_text())
                             if x["id"] == ident), {})
            if (previous.get("identity") == identity and previous.get("delivery_derivative")
                    and previous.get("provider_audio_sha256") == state["audio_sha256"]):
                delivery = ROOT / previous["path"]
                if digest(delivery.read_bytes()) != previous["audio_sha256"]:
                    raise ValueError("Previously selected delivery derivative changed")
                row = {**previous, **line}
                wav_path = delivery
                selected_asr = ROOT / previous["asr"]
        update_manifest(out / "manifest.json", row, fresh)
        asr_rows.append((row, wav_path, selected_asr))
        print(ident, "saved", round(metadata["duration"], 3), "seconds", flush=True)
    # Release the CPU model before loading a separate ASR model on a 16 GB Mac.
    del model
    gc.collect()
    if args.transcribe:
        for row, wav_path, asr_path in asr_rows:
            asr_env = dict(os.environ)
            asr_env.pop("HF_HOME", None)
            subprocess.run([str(Path(args.config_repo) / ".venv/bin/python"), str(Path(__file__).resolve()),
                            "--asr-input", str(wav_path), "--source-text", row["text"],
                            "--evidence-out", str(asr_path), "--language", row["language"]],
                           check=True, env=asr_env)
            result = json.loads(asr_path.read_text())
            row.update(asr=str(asr_path.relative_to(ROOT)), asr_differences=result["differences"])
            row["word_timestamps"] = [word for segment in result["segments"] for word in segment.get("words", [])]
            fresh = json.loads(args.script.read_text())
            update_manifest(out / "manifest.json", row, fresh["lines"] if isinstance(fresh, dict) else fresh)
    lock.close()


def transcribe(wav_path, expected, evidence_path, language):
    """Read PCM directly and pass ndarray to Whisper: no implicit FFmpeg."""
    raw = wav_path.read_bytes()
    if evidence_path.exists():
        cached = json.loads(evidence_path.read_text())
        if (cached.get("audio_sha256") == digest(raw)
                and cached.get("source_sha256") == digest(expected.encode())
                and cached.get("language", "zh") == language):
            print(json.dumps({"asr": cached["transcript"], "differences": cached["differences"],
                              "cache": True}, ensure_ascii=False), flush=True)
            return cached
    import numpy as np
    from scipy.signal import resample_poly
    import mlx_whisper

    _, samples = read_wav(raw)
    audio = resample_poly(np.asarray(samples, dtype=np.float32) / 32768, 2, 3)
    transcript = mlx_whisper.transcribe(
        audio, path_or_hf_repo="mlx-community/whisper-large-v3-turbo-q4",
        language=language, temperature=0, initial_prompt=None,
        condition_on_previous_text=False, word_timestamps=True, verbose=False,
    )
    expected_chars = normalized_text(expected)
    heard_chars = normalized_text(transcript["text"])
    changes = [
        {"kind": tag, "expected": expected_chars[i:j], "heard": heard_chars[k:l]}
        for tag, i, j, k, l in difflib.SequenceMatcher(
            None, expected_chars, heard_chars, autojunk=False
        ).get_opcodes() if tag != "equal"
    ]
    result = {
        "source": expected, "transcript": transcript["text"], "differences": changes,
        "source_sha256": digest(expected.encode()), "audio_sha256": digest(raw),
        "model": "mlx-community/whisper-large-v3-turbo-q4",
        "language": language, "initial_prompt": None,
        "segments": transcript["segments"], "ffmpeg_used": False,
        "listening": "ASR only; this does not establish listening or naturalness.",
    }
    save(evidence_path, result)
    print(json.dumps({"asr": transcript["text"], "differences": changes},
                     ensure_ascii=False), flush=True)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--trial", action="store_true")
    parser.add_argument("--script", type=Path, default=ROOT / "content/narration.json")
    parser.add_argument("--only", nargs="*")
    parser.add_argument("--voice", default="space-en-f1")
    parser.add_argument("--language", choices=("en", "zh"), default="en")
    parser.add_argument("--seed", type=int, default=83)
    parser.add_argument("--seed-map", default="{}")
    parser.add_argument("--pcm-peak-limit", type=float)
    parser.add_argument("--transcribe", action="store_true")
    parser.add_argument("--asr-only", action="store_true")
    parser.add_argument("--local-runtime", type=Path)
    parser.add_argument("--reference-audio", type=Path)
    parser.add_argument("--reference-sha256")
    parser.add_argument("--candidate")
    parser.add_argument("--trim-tail")
    parser.add_argument("--cutoff", type=float)
    parser.add_argument("--review-note")
    parser.add_argument("--asr-input", type=Path)
    parser.add_argument("--source-text")
    parser.add_argument("--evidence-out", type=Path)
    parser.add_argument("--config-repo", default=os.environ.get("CHATTERBOX_CONFIG_REPO", DEFAULT_CONFIG))
    args = parser.parse_args()

    if args.asr_input:
        if args.source_text is None or args.evidence_out is None:
            raise ValueError("Direct ASR requires source text and evidence output")
        transcribe(args.asr_input, args.source_text, args.evidence_out, args.language)
        return
    if args.trim_tail:
        trim_delivery_tail(args)
        return
    if args.local_runtime:
        local_generation(args)
        return

    sys.path.insert(0, args.config_repo)
    from backend import config
    base, api_key = config.CHATTERBOX_TTS_URL.rstrip("/"), config.CHATTERBOX_TTS_API_KEY
    if not api_key:
        raise ValueError("No configured Chatterbox credential")

    def request(path, payload=None, key=None, binary=False):
        headers = {"X-API-Key": api_key}
        if key:
            headers["Idempotency-Key"] = key
        if payload is not None:
            headers["Content-Type"] = "application/json"
        data = json.dumps(payload, ensure_ascii=False).encode() if payload is not None else None
        req = urllib.request.Request(base + path, data=data, headers=headers)
        for attempt in range(6):
            try:
                with urllib.request.urlopen(req, timeout=60) as response:
                    raw = response.read()
                return raw if binary else json.loads(raw)
            except urllib.error.HTTPError as error:
                if error.code not in (429, 502, 503, 504) or attempt == 5:
                    raise RuntimeError(f"Chatterbox HTTP {error.code} at {path}") from None
            except (OSError, TimeoutError):
                if attempt == 5:
                    raise RuntimeError(f"Chatterbox transport failed at {path}; preserve checkpoint") from None
            time.sleep(min(30, 3 * (attempt + 1)))

    cap = request("/v1/capabilities")
    if args.language not in cap["languages"]:
        raise ValueError("The deployed service does not support the requested language")
    if cap["fingerprint"] != config.CHATTERBOX_TTS_DEPLOYMENT_FINGERPRINT:
        raise ValueError("Configured deployment fingerprint differs from service")
    voice = next(v for v in cap["voices"] if v["id"] == args.voice)
    out = ROOT / "media" / ("audition" if args.trial else "audio")
    provider = out / "provider" if args.trial else ROOT / "media/provider"
    out.mkdir(parents=True, exist_ok=True)
    save(provider / "capabilities.json", cap)
    lines = [{"id": f"trial-{args.language}", "text": TRIAL_TEXTS[args.language]}] if args.trial else json.loads(args.script.read_text())
    if isinstance(lines, dict):
        lines = lines["lines"]
    if len({line["id"] for line in lines}) != len(lines):
        raise ValueError("Narration IDs must be unique")
    all_lines = lines
    if args.only:
        lines = [line for line in lines if line["id"] in args.only]
        if len(lines) != len(set(args.only)):
            raise ValueError("Unknown --only ID")
    manifest_path = out / "manifest.json"
    manifest = {r["id"]: r for r in json.loads(manifest_path.read_text())} if manifest_path.exists() else {}

    for line in lines:
        # Re-read unsent lines so a source correction during a long CPU run is
        # respected. A submitted request still resumes its immutable identity.
        if not args.trial:
            fresh = json.loads(args.script.read_text())
            if isinstance(fresh, dict):
                fresh = fresh["lines"]
            line = next(x for x in fresh if x["id"] == line["id"])
            all_lines = fresh
        ident, text = str(line["id"]), line["text"]
        if line.get("language", args.language) != args.language:
            raise ValueError(f"Narration {ident} language differs from --language")
        if not re.fullmatch(r"[A-Za-z0-9_-]+", ident):
            raise ValueError("Unsafe narration ID")
        if not 1 <= len(text) <= cap["max_chars"]:
            raise ValueError(f"Narration {ident} exceeds service character limit")
        payload = {"text": text, "language_id": args.language, "voice": args.voice,
                   "seed": args.seed, "exaggeration": 0.5, "cfg_weight": 0.5,
                   "temperature": 0.8, "repetition_penalty": 2.0, "min_p": 0.05,
                   "top_p": 1.0, "speed": 1.0}
        identity = digest({"payload": payload, "service": cap["fingerprint"],
                           "voice": voice["fingerprint"]})
        stem = f"{ident}-{identity[:12]}"
        checkpoint_path = provider / f"{stem}.request.json"
        wav_path = out / f"{stem}.wav"
        if not args.trial and not checkpoint_path.exists():
            audition = ROOT / "media/audition"
            audition_stem = f"trial-{args.language}-{identity[:12]}"
            audition_request = audition / "provider" / f"{audition_stem}.request.json"
            audition_wav = audition / f"{audition_stem}.wav"
            audition_job = audition / "provider" / f"{audition_stem}.job.json"
            if audition_request.exists() and audition_wav.exists() and audition_job.exists():
                prior = json.loads(audition_request.read_text())
                prior_job = json.loads(audition_job.read_text())
                if (prior["identity"] != identity or prior["payload"] != payload
                        or digest(audition_wav.read_bytes()) != prior_job["audio_sha256"]):
                    raise ValueError("Audition reuse identity or WAV changed")
                save(checkpoint_path, {**prior, "reused_from": str(audition_request.relative_to(ROOT))})
                shutil.copyfile(audition_wav, wav_path)
                asr_source = audition / "asr" / f"{audition_stem}.json"
                if asr_source.exists():
                    asr_destination = ROOT / "review/asr" / f"{stem}.json"
                    asr_destination.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(asr_source, asr_destination)
                print(ident, "reused exact audition WAV and provider checkpoint", flush=True)
        state = json.loads(checkpoint_path.read_text()) if checkpoint_path.exists() else {
            "identity": identity, "idempotency_key": "singapore-satellite-" + identity,
            "payload": payload, "source_sha256": digest(text.encode()),
            "deployment_fingerprint": cap["fingerprint"],
            "voice_fingerprint": voice["fingerprint"],
        }
        if state["identity"] != identity or state["payload"] != payload:
            raise ValueError("Checkpoint changed")
        save(checkpoint_path, state)
        if args.asr_only and not wav_path.is_file():
            raise ValueError(f"Missing WAV for {ident}")
        if not args.asr_only:
            if not state.get("job_id"):
                state["job_id"] = request("/v1/jobs", payload, state["idempotency_key"])["id"]
                save(checkpoint_path, state)
            previous = None
            deadline = time.monotonic() + 3600
            while True:
                job = request("/v1/jobs/" + state["job_id"])
                if job["status"] != previous:
                    print(ident, job["status"], state["job_id"], flush=True)
                    previous = job["status"]
                if job["status"] in ("completed", "failed"):
                    save(provider / f"{stem}.job.json", job)
                    break
                if job["status"] not in ("queued", "running") or time.monotonic() > deadline:
                    raise RuntimeError("Provider pending or unknown; resume the same checkpoint")
                time.sleep(5)
            if job["status"] == "failed":
                raise RuntimeError(f"Provider job failed: {job.get('error')}; evidence preserved")
            if (job["request"] != payload or job["fingerprint"] != cap["fingerprint"]
                    or job["voice_fingerprint"] != voice["fingerprint"]):
                raise ValueError("Completed job identity differs from request")
            if not wav_path.is_file():
                raw = request("/v1/jobs/" + state["job_id"] + "/audio", binary=True)
                if digest(raw) != job["audio_sha256"]:
                    raise ValueError("Provider WAV hash mismatch")
                metadata, _ = read_wav(raw)
                if metadata["duration"] >= cap["max_decoder_seconds"] - 0.1:
                    raise ValueError("Provider audio near decoder ceiling")
                wav_path.write_bytes(raw)
            if digest(wav_path.read_bytes()) != job["audio_sha256"]:
                raise ValueError("Local WAV hash changed")
        metadata, _ = read_wav(wav_path.read_bytes())
        row = {**line, "path": str(wav_path.relative_to(ROOT)), "identity": identity,
               "source_sha256": digest(text.encode()), "audio_sha256": digest(wav_path.read_bytes()),
               "job_id": state["job_id"], "voice": args.voice, "language": args.language,
               "speech_speed": 1.0, **metadata,
               "listening": "Not established by container, waveform or ASR checks"}
        if args.transcribe or args.asr_only:
            asr_path = (out / "asr" if args.trial else ROOT / "review/asr") / f"{stem}.json"
            asr = transcribe(wav_path, text, asr_path, args.language)
            row["asr"] = str(asr_path.relative_to(ROOT))
            row["asr_differences"] = asr["differences"]
            row["word_timestamps"] = [word for segment in asr["segments"] for word in segment.get("words", [])]
        update_manifest(manifest_path, row, all_lines)
        print(ident, "saved", round(metadata["duration"], 3), "seconds", flush=True)


if __name__ == "__main__":
    main()
