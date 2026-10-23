#!/usr/bin/env python3
"""Decode every reference frame; metrics and numbered full-coverage atlases.

No ffmpeg executable is invoked. Atlas generation is not a claim of human inspection.
"""
import argparse
import csv
import hashlib
import json
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont

try:
    import cv2
except ImportError:
    cv2 = None


SWIFT_DECODER = r'''
import Foundation
import AVFoundation
import CoreVideo
let asset = AVURLAsset(url: URL(fileURLWithPath: CommandLine.arguments[1]))
let track = asset.tracks(withMediaType: .video)[0]
let reader = try AVAssetReader(asset: asset)
let output = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
output.alwaysCopiesSampleData = false
reader.add(output)
let stream = FileHandle.standardOutput
func emit(_ object: [String: Any]) {
    let json = try! JSONSerialization.data(withJSONObject: object, options: [.sortedKeys])
    stream.write(json); stream.write(Data([10]))
}
let duration = CMTimeGetSeconds(asset.duration)
let fps = Double(track.nominalFrameRate)
emit(["width": Int(track.naturalSize.width), "height": Int(track.naturalSize.height), "fps": fps,
      "metadata_frame_count": Int((duration * fps).rounded()), "duration_seconds": duration,
      "decoder": "macOS AVFoundation AVAssetReader / CoreVideo BGRA"])
guard reader.startReading() else { fatalError("AVAssetReader did not start") }
var count = 0
while let sample = output.copyNextSampleBuffer() {
    guard let pixel = CMSampleBufferGetImageBuffer(sample) else { fatalError("No image buffer") }
    CVPixelBufferLockBaseAddress(pixel, .readOnly)
    let stride = CVPixelBufferGetBytesPerRow(pixel)
    let height = CVPixelBufferGetHeight(pixel)
    let width = CVPixelBufferGetWidth(pixel)
    let size = stride * height
    emit(["frame": count, "pts": CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(sample)),
          "width": width, "height": height, "stride": stride, "bytes": size])
    stream.write(Data(bytes: CVPixelBufferGetBaseAddress(pixel)!, count: size))
    CVPixelBufferUnlockBaseAddress(pixel, .readOnly)
    count += 1
}
if reader.status == .failed { fatalError("AVAssetReader failed: \(String(describing: reader.error))") }
emit(["end": true, "count": count])
'''


def open_video(path, decoder, output_dir):
    if decoder == "opencv" or (decoder == "auto" and cv2 is not None):
        if cv2 is None:
            raise RuntimeError("OpenCV is unavailable")
        cap = cv2.VideoCapture(str(path))
        if not cap.isOpened():
            raise RuntimeError(f"Cannot open {path}")
        meta = {"fps": cap.get(cv2.CAP_PROP_FPS), "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
                "metadata_frame_count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
                "decoder": f"OpenCV {cv2.__version__}"}
        def frames():
            try:
                while True:
                    ok, bgr = cap.read()
                    if not ok:
                        break
                    yield Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)), cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
            finally:
                cap.release()
        return meta, frames()
    log = (output_dir / "avfoundation-decoder.log").open("wb")
    process = subprocess.Popen(["swift", "-", str(path.resolve())], stdin=subprocess.PIPE,
                               stdout=subprocess.PIPE, stderr=log)
    process.stdin.write(SWIFT_DECODER.encode())
    process.stdin.close()
    first = process.stdout.readline()
    if not first:
        process.wait(); log.close()
        raise RuntimeError("AVFoundation decoder failed; inspect avfoundation-decoder.log")
    meta = json.loads(first)
    def frames():
        try:
            while True:
                line = process.stdout.readline()
                if not line:
                    raise RuntimeError("AVFoundation output ended before its completion record")
                header = json.loads(line)
                if header.get("end"):
                    break
                payload = process.stdout.read(header["bytes"])
                if len(payload) != header["bytes"]:
                    raise RuntimeError("Truncated raw frame from AVFoundation")
                im = Image.frombytes("RGBA", (header["width"], header["height"]), payload,
                                     "raw", "BGRA", header["stride"], 1).convert("RGB")
                yield im, header["pts"]
            if process.wait() != 0:
                raise RuntimeError("AVFoundation decoder exited with an error")
        finally:
            if process.poll() is None:
                process.terminate()
                process.wait()
            log.close()
    return meta, frames()


KEY_TIMES = [0, .6, 1.2, 1.8, 3.4, 5.36, 5.7, 6.6, 7.8, 9.6, 10.8,
             11.7, 12.3, 13.2, 13.61, 14.7, 15.3, 16.5, 17.4, 18.6,
             19.5, 20.4, 21.9, 23.4, 23.7, 24, 24.6, 26.4, 28.8,
             30.6, 31.2, 34.2, 35, 37.5]


def sha256(path):
    h = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def main():
    parser = argparse.ArgumentParser()
    root = Path(__file__).resolve().parents[1]
    parser.add_argument("--input", type=Path, default=root / "reference/satellite-briefing.mp4")
    parser.add_argument("--output", type=Path, default=root / "review/reference")
    parser.add_argument("--columns", type=int, default=6)
    parser.add_argument("--rows", type=int, default=8)
    parser.add_argument("--decoder", choices=["auto", "opencv", "avfoundation"], default="auto")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / "keyframes").mkdir(exist_ok=True)
    metadata, frames = open_video(args.input, args.decoder, args.output)
    fps = metadata["fps"]
    metadata_count = metadata["metadata_frame_count"]
    width, height = metadata["width"], metadata["height"]
    key_frames = {round(t * fps): t for t in KEY_TIMES}
    thumb_w, thumb_h, label_h = 320, 180, 26
    per_sheet = args.columns * args.rows
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 14)
    except OSError:
        font = ImageFont.load_default()
    sheet = None
    atlases, metrics, keys = [], [], []
    previous = None
    index = 0
    for im, pts in frames:
        small = im.resize((480, 270), Image.Resampling.BOX)
        gray = np.array(small.convert("L"))
        hsv = np.array(small.convert("HSV"))
        gray_float = gray.astype(np.float32)
        gradient = np.hypot(np.diff(gray_float, axis=1, append=gray_float[:, -1:]),
                            np.diff(gray_float, axis=0, append=gray_float[-1:, :]))
        motion = float(np.abs(gray.astype(np.float32) - previous).mean()) if previous is not None else 0.
        previous = gray.astype(np.float32)
        row = {"frame": index, "time_seconds": round(index / fps, 6), "presentation_time_seconds": round(pts, 9),
               "luma_mean": round(float(gray.mean()), 5),
               "luma_p05": round(float(np.percentile(gray, 5)), 4),
               "luma_p50": round(float(np.percentile(gray, 50)), 4),
               "luma_p95": round(float(np.percentile(gray, 95)), 4),
               "saturation_mean": round(float(hsv[:, :, 1].mean()), 5),
               "white_fraction": round(float((gray >= 230).mean()), 7),
               "dark_fraction": round(float((gray < 20).mean()), 7),
               "edge_fraction": round(float((gradient > 24).mean()), 7),
               "luma_mad_from_previous": round(motion, 6),
               "decoded_width": im.width, "decoded_height": im.height}
        metrics.append(row)
        offset = index % per_sheet
        if offset == 0:
            sheet = Image.new("RGB", (args.columns * thumb_w, args.rows * (thumb_h + label_h)), "#10151b")
        x = (offset % args.columns) * thumb_w
        y = (offset // args.columns) * (thumb_h + label_h)
        sheet.paste(im.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS), (x, y))
        draw = ImageDraw.Draw(sheet)
        draw.text((x + 7, y + thumb_h + 5), f"F{index:04d}  {index / fps:07.3f}s", font=font, fill="#e9edf2")
        if index in key_frames:
            path = args.output / "keyframes" / f"f{index:04d}_{index/fps:07.3f}s.jpg"
            im.save(path, quality=96, subsampling=0)
            keys.append({"frame": index, "time_seconds": index / fps, "path": str(path.relative_to(args.output))})
        if offset == per_sheet - 1:
            start = index - per_sheet + 1
            path = args.output / f"atlas_{len(atlases)+1:03d}_f{start:04d}-{index:04d}.jpg"
            sheet.save(path, quality=94, subsampling=0)
            atlases.append({"path": path.name, "first_frame": start, "last_frame": index, "frame_count": per_sheet})
            print(f"Decoded {index+1}/{metadata_count}; saved {path.name}", flush=True)
            sheet = None
        index += 1
    if sheet is not None:
        start = index - (index % per_sheet)
        path = args.output / f"atlas_{len(atlases)+1:03d}_f{start:04d}-{index-1:04d}.jpg"
        sheet.save(path, quality=94, subsampling=0)
        atlases.append({"path": path.name, "first_frame": start, "last_frame": index-1, "frame_count": index-start})
    if not metrics:
        raise SystemExit("No decoded frames")
    with (args.output / "frame_metrics.csv").open("w", newline="") as dest:
        writer = csv.DictWriter(dest, fieldnames=list(metrics[0]))
        writer.writeheader()
        writer.writerows(metrics)
    data = {"input": str(args.input.resolve()), "sha256": sha256(args.input),
            "decoder": metadata["decoder"], "fps": fps,
            "width": width, "height": height, "metadata_frame_count": metadata_count,
            "decoded_frame_count": index, "duration_seconds": index / fps,
            "all_frames_decoded": index == metadata_count,
            "pts_monotonic": all(b["presentation_time_seconds"] > a["presentation_time_seconds"] for a, b in zip(metrics, metrics[1:])),
            "metrics_method": "Pillow BOX resize 480x270; L and HSV conversions; finite-difference gradient >24; same method for either decoder",
            "every_decoded_frame_in_atlas": sum(a["frame_count"] for a in atlases) == index,
            "atlases": atlases, "keyframes": keys,
            "visual_review": {"status": "pending", "note": "Rendering atlases does not constitute visual review."}}
    (args.output / "manifest.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({k: data[k] for k in ["decoded_frame_count", "fps", "duration_seconds", "all_frames_decoded"]}), flush=True)


if __name__ == "__main__":
    main()
