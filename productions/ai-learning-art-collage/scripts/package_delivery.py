"""Mux verified picture and complete PCM; supply optional English captions as SRT."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import wave

import av

ROOT = Path(__file__).resolve().parents[1]
NAME = "Does-AI-Help-You-Learn-or-Just-Finish"


def digest(path):
    result = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            result.update(block)
    return result.hexdigest()


def packet_digest(path):
    result = hashlib.sha256()
    with av.open(str(path)) as container:
        for packet in container.demux(container.streams.video[0]):
            if packet.size:
                result.update(bytes(packet))
    return result.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--picture", type=Path, default=ROOT / "media/picture-final.mp4")
    parser.add_argument("--directory", type=Path, default=ROOT / "delivery")
    args = parser.parse_args()
    timeline_path = ROOT / "media/timeline.json"
    timeline = json.loads(timeline_path.read_text())
    clock_hash = digest(timeline_path)
    if timeline.get("draft") is not False or len(timeline["shots"]) != 46:
        raise ValueError("Only a complete, non-draft clock may be delivered")
    mix = ROOT / "media/mix.wav"
    mix_report = json.loads((ROOT / "media/mix-report.json").read_text())
    captions = ROOT / "media/captions.srt"
    subtitle_report = json.loads((ROOT / "media/subtitle-report.json").read_text())
    if (mix_report["preview"] or mix_report["timeline_sha256"] != clock_hash
            or mix_report["mix_sha256"] != digest(mix)):
        raise ValueError("Mixed audio is a preview, stale or changed")
    if (not subtitle_report["full_film"] or subtitle_report["preview"]
            or subtitle_report["timeline_sha256"] != clock_hash
            or subtitle_report["selected_shots"] != [shot["id"] for shot in timeline["shots"]]):
        raise ValueError("Captions do not cover the final clock")
    expected_srt = "\n\n".join(
        f"{cue['id']}\n{stamp(cue['start'])} --> {stamp(cue['end'])}\n{cue['display']}"
        for cue in subtitle_report["cues"]) + "\n"
    if captions.read_text() != expected_srt:
        raise ValueError("Caption file differs from its complete alignment report")
    with wave.open(str(mix), "rb") as wav:
        if (wav.getframerate() != 48000 or wav.getnchannels() != 2
                or wav.getsampwidth() != 2
                or wav.getnframes() != round(timeline["duration_seconds"] * 48000)):
            raise ValueError("PCM format or clock mismatch")
    with av.open(str(args.picture)) as picture:
        stream = picture.streams.video[0]
        if (stream.width != 1920 or stream.height != 1080
                or float(stream.average_rate) != 25
                or stream.frames != timeline["duration_frames"]):
            raise ValueError("Picture metadata differs from the final clock")
    inputs = {str(path.relative_to(ROOT)): digest(path)
              for path in [args.picture.resolve(), mix, captions, timeline_path]}
    args.directory.mkdir(parents=True, exist_ok=True)
    destination = args.directory / f"{NAME}.mp4"
    if destination.exists():
        raise FileExistsError("Retain existing delivery versions; select a new directory")
    temporary = destination.with_suffix(".partial.mp4")
    subprocess.run([
        sys.executable, str(ROOT / "scripts/ffmpeg_gate.py"), "-y", "-v", "warning",
        "-i", str(args.picture), "-i", str(mix),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
        "-metadata:s:a:0", "language=eng",
        "-metadata", "title=Does AI Help You Learn—or Just Finish?",
        "-movflags", "+faststart", str(temporary)], cwd=ROOT, check=True)
    for relative, expected in inputs.items():
        if digest(ROOT / relative) != expected:
            raise ValueError(f"Input changed during mux: {relative}")
    original_packets, delivered_packets = packet_digest(args.picture), packet_digest(temporary)
    if original_packets != delivered_packets:
        raise ValueError("Mux unexpectedly changed encoded picture packets")
    with av.open(str(temporary)) as result:
        video, audio = result.streams.video[0], result.streams.audio[0]
        streams = {
            "video": {"codec": video.codec_context.name, "frames": video.frames,
                      "width": video.width, "height": video.height, "fps": str(video.average_rate)},
            "audio": {"codec": audio.codec_context.name, "sample_rate": audio.codec_context.sample_rate,
                      "channels": audio.codec_context.channels},
            "subtitles": {"external_srt": True, "embedded_tracks": len(result.streams.subtitles),
                          "burned_in": False},
        }
        if result.streams.subtitles:
            raise ValueError("The clean picture delivery must not force subtitle overlays")
        if abs(result.duration / av.time_base - timeline["duration_seconds"]) > .05:
            raise ValueError("Muxed duration differs from the picture clock")
    temporary.replace(destination)
    external_captions = args.directory / f"{NAME}.en.srt"
    shutil.copyfile(captions, external_captions)
    report = {"file": str(destination.resolve()), "duration_seconds": timeline["duration_seconds"],
              "duration_frames": timeline["duration_frames"], "sha256": digest(destination),
              "size_bytes": destination.stat().st_size, "streams": streams,
              "input_sha256": inputs, "video_packet_sha256": delivered_packets,
              "picture_packets_unchanged": True, "captions_sha256": digest(external_captions),
              "visual_review": "separate final encoded-frame review required",
              "subjective_listening": "not established by this packaging check"}
    (args.directory / "delivery-manifest.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


def stamp(seconds):
    milliseconds = max(0, round(seconds * 1000))
    hours, milliseconds = divmod(milliseconds, 3600000)
    minutes, milliseconds = divmod(milliseconds, 60000)
    seconds, milliseconds = divmod(milliseconds, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"


if __name__ == "__main__":
    main()
