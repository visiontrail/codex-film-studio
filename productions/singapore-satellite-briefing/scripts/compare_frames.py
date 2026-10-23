#!/usr/bin/env python3
"""Decode every frame, measure observable features, and prepare a human review.

This program does not run an ffmpeg executable. OpenCV's bundled decoder is used.
All frames appear in numbered 48-frame atlases. Metrics are feature measurements,
not a percentage of aesthetic similarity or evidence of human visual inspection.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import math
import os
from pathlib import Path
import time

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
REFERENCE_INTERVALS = {
    "orbit": (0, 6.6), "arrival": (14.1, 17.4), "bay": (17.4, 23.4),
    "gardens": (24, 28.8), "chinatown": (15.3, 17.4),
    "districts": (7.8, 13.2), "transit": (17.4, 23.4),
    "sentosa": (23.4, 28.8), "island": (24, 28.8), "card": (13.2, 15.3),
    "weather": (7.8, 13.2), "return": (28.8, 34.2), "endcard": (34.2, None),
}
FEATURES = ["luma_mean", "luma_p05", "luma_p50", "luma_p95", "chroma_mean",
            "saturation_mean", "white_ratio", "white_line_ratio", "amber_ratio",
            "edge_ratio", "dark_ratio", "frame_difference"]
try:
    FONT = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 13)
    TITLE_FONT = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 20)
except OSError:
    FONT = TITLE_FONT = ImageFont.load_default()


def digest(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as source:
        for block in iter(lambda: source.read(2 ** 20), b""):
            h.update(block)
    return h.hexdigest()


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")


def write_csv(path, rows):
    if not rows:
        return
    with path.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def video_info(path):
    cap = cv2.VideoCapture(str(path))
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video: {path}")
    meta = {"path": str(path.resolve()), "sha256": digest(path),
            "size_bytes": path.stat().st_size, "fps": cap.get(cv2.CAP_PROP_FPS),
            "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            "metadata_frame_count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
            "decoder": f"OpenCV {cv2.__version__} / {cap.getBackendName()}"}
    cap.release()
    if not math.isfinite(meta["fps"]) or meta["fps"] <= 0:
        raise RuntimeError(f"Invalid frame rate: {meta}")
    return meta


def contiguous_ranges(indices):
    result = []
    for index in indices:
        if result and result[-1][1] + 1 == index:
            result[-1][1] = index
        else:
            result.append([index, index])
    return result


def measure(bgr, previous, previous_digest):
    small = cv2.resize(bgr, (480, 270), interpolation=cv2.INTER_AREA)
    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(small, cv2.COLOR_BGR2LAB).astype(np.float32)
    edges = cv2.Canny(gray, 45, 120) > 0
    near_edges = cv2.dilate(edges.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    white = (hsv[:, :, 2] >= 205) & (hsv[:, :, 1] <= 55)
    amber = ((hsv[:, :, 0] >= 12) & (hsv[:, :, 0] <= 37)
             & (hsv[:, :, 1] >= 90) & (hsv[:, :, 2] >= 115))
    difference = (float(cv2.absdiff(gray, previous).mean())
                  if previous is not None else 0.0)
    frame_digest = hashlib.sha256(memoryview(bgr)).hexdigest()
    quantiles = np.percentile(gray, [5, 50, 95])
    row = {"luma_mean": float(gray.mean()), "luma_p05": float(quantiles[0]),
           "luma_p50": float(quantiles[1]), "luma_p95": float(quantiles[2]),
           "chroma_mean": float(np.hypot(lab[:, :, 1] - 128, lab[:, :, 2] - 128).mean()),
           "saturation_mean": float(hsv[:, :, 1].mean()),
           "white_ratio": float(white.mean()),
           "white_line_ratio": float((white & near_edges).mean()),
           "amber_ratio": float(amber.mean()), "edge_ratio": float(edges.mean()),
           "dark_ratio": float((gray < 20).mean()), "frame_difference": difference,
           "black_frame": int(float(gray.mean()) < 4 and float((gray < 10).mean()) > .995),
           "exact_duplicate": int(previous_digest == frame_digest),
           "near_duplicate_candidate": int(previous is not None and difference < .15),
           "decoded_pixels_sha256": frame_digest}
    row = {key: round(value, 8) if isinstance(value, float) else value for key, value in row.items()}
    return row, gray, frame_digest


def representative_frames(timeline):
    frames = {}
    for shot in timeline["shots"]:
        length = shot["end"] - shot["start"]
        for part, progress in enumerate((.2, .5, .8), start=1):
            index = shot["start"] + round((length - 1) * progress)
            frames[index] = {"scene": shot["scene"], "sample": part, "progress": progress}
    return frames


def analyze(path, output, label, selected=None):
    output.mkdir(parents=True, exist_ok=True)
    (output / "atlas").mkdir(exist_ok=True)
    (output / "representatives").mkdir(exist_ok=True)
    selected = selected or {}
    meta = video_info(path)
    # Only remove this tool's previous generated images in its dedicated folder.
    for directory, pattern in ((output / "atlas", "atlas-*.jpg"),
                               (output / "representatives", "f*.jpg")):
        for stale in directory.glob(pattern):
            stale.unlink()
    cap = cv2.VideoCapture(str(path))
    rows, atlases, representative = [], [], {}
    previous, previous_digest, last_pts = None, None, None
    sheet = None
    started = time.monotonic()
    while True:
        ok, bgr = cap.read()
        if not ok:
            break
        index = len(rows)
        pts = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
        row, previous, previous_digest = measure(bgr, previous, previous_digest)
        row = {"frame": index, "nominal_seconds": round(index / meta["fps"], 9),
               "reported_pts_seconds": round(pts, 9),
               "pts_delta_seconds": round(pts - last_pts, 9) if last_pts is not None else "",
               "pts_nonmonotonic": int(last_pts is not None and pts <= last_pts),
               "decoded_width": bgr.shape[1], "decoded_height": bgr.shape[0], **row}
        rows.append(row)
        last_pts = pts
        offset = index % 48
        if offset == 0:
            sheet = Image.new("RGB", (1920, 1008), "#10151b")
            ImageDraw.Draw(sheet).text((15, 12), f"{label} / ALL DECODED FRAMES / {index:05d} onward",
                                       font=TITLE_FONT, fill="#e9eff3")
        x, y = (offset % 8) * 240, 48 + (offset // 8) * 160
        thumb = cv2.resize(bgr, (240, 135), interpolation=cv2.INTER_AREA)
        sheet.paste(Image.fromarray(cv2.cvtColor(thumb, cv2.COLOR_BGR2RGB)), (x, y))
        flags = (" BLACK" if row["black_frame"] else "") + (" DUP" if row["exact_duplicate"] else "")
        ImageDraw.Draw(sheet).text((x + 5, y + 139), f"F{index:05d} {pts:07.3f}s{flags}",
                                   font=FONT, fill="#ffbc62" if flags else "#e9eff3")
        if index in selected:
            target = output / "representatives" / f"f{index:05d}.jpg"
            cv2.imwrite(str(target), bgr, [cv2.IMWRITE_JPEG_QUALITY, 97])
            representative[index] = target
        if offset == 47:
            target = output / "atlas" / f"atlas-{index // 48:03d}-f{index-47:05d}-{index:05d}.jpg"
            sheet.save(target, quality=94, subsampling=0)
            atlases.append({"file": str(target.relative_to(ROOT)), "first_frame": index - 47,
                            "last_frame": index, "count": 48})
            sheet = None
            if index % 240 == 239:
                print(f"{label}: decoded {index+1}/{meta['metadata_frame_count']}", flush=True)
    cap.release()
    if sheet is not None:
        start = len(rows) - len(rows) % 48
        target = output / "atlas" / f"atlas-{start // 48:03d}-f{start:05d}-{len(rows)-1:05d}.jpg"
        sheet.save(target, quality=94, subsampling=0)
        atlases.append({"file": str(target.relative_to(ROOT)), "first_frame": start,
                        "last_frame": len(rows) - 1, "count": len(rows) - start})
    if not rows:
        raise RuntimeError(f"No decoded frames: {path}")
    meta.update(decoded_frame_count=len(rows), elapsed_seconds=round(time.monotonic() - started, 2),
                duration_seconds=len(rows) / meta["fps"],
                metadata_count_matches=len(rows) == meta["metadata_frame_count"],
                atlas_frame_coverage=sum(item["count"] for item in atlases), atlases=atlases,
                black_frame_ranges=contiguous_ranges([r["frame"] for r in rows if r["black_frame"]]),
                exact_duplicate_ranges=contiguous_ranges([r["frame"] for r in rows if r["exact_duplicate"]]),
                near_duplicate_candidate_ranges=contiguous_ranges([r["frame"] for r in rows if r["near_duplicate_candidate"]]),
                nonmonotonic_pts_frames=[r["frame"] for r in rows if r["pts_nonmonotonic"]],
                representatives={str(k): str(v.relative_to(ROOT)) for k, v in representative.items()})
    meta["feature_medians"] = {key: round(float(np.median([r[key] for r in rows])), 8) for key in FEATURES}
    write_csv(output / "frame-metrics.csv", rows)
    write_json(output / "manifest.json", meta)
    return meta, rows, representative


def load_reference(path, output, force=False):
    manifest_path = output / "manifest.json"
    if not force and manifest_path.exists():
        meta = json.loads(manifest_path.read_text())
        if meta["sha256"] == digest(path):
            with (output / "frame-metrics.csv").open() as file:
                rows = list(csv.DictReader(file))
            for row in rows:
                for key, value in row.items():
                    if key != "decoded_pixels_sha256" and value != "":
                        row[key] = float(value) if "." in value or "e" in value.lower() else int(value)
            if len(rows) == meta["decoded_frame_count"] and all((ROOT / a["file"]).exists() for a in meta["atlases"]):
                print(f"Reusing hash-bound complete reference decode: {len(rows)} frames", flush=True)
                return meta, rows
    meta, rows, _ = analyze(path, output, "REFERENCE")
    return meta, rows


def build_pairs(timeline, final_rows, reference_meta, reference_rows):
    pairs = []
    ref_fps, ref_count = reference_meta["fps"], reference_meta["decoded_frame_count"]
    for shot in timeline["shots"]:
        scene = shot["scene"]
        start_s, end_s = REFERENCE_INTERVALS[scene]
        first_ref = max(0, min(ref_count - 1, math.ceil(start_s * ref_fps - 1e-7)))
        last_ref = ref_count - 1 if end_s is None else min(ref_count - 1, math.ceil(end_s * ref_fps - 1e-7) - 1)
        if last_ref < first_ref:
            raise ValueError(f"Empty reference interval for {scene}")
        for index in range(shot["start"], shot["end"]):
            if index >= len(final_rows):
                break
            progress = (index - shot["start"]) / max(1, shot["end"] - shot["start"] - 1)
            ref_index = first_ref + round(progress * (last_ref - first_ref))
            row = {"final_frame": index, "final_seconds": round(index / timeline["fps"], 9),
                   "final_pts_seconds": final_rows[index].get("reported_pts_seconds", ""),
                   "scene": scene, "scene_progress": round(progress, 9),
                   "reference_frame": ref_index, "reference_seconds": round(ref_index / ref_fps, 9),
                   "reference_pts_seconds": reference_rows[ref_index]["reported_pts_seconds"],
                   "reference_interval_start": start_s,
                   "reference_interval_end_exclusive": end_s or reference_meta["duration_seconds"]}
            for key in FEATURES:
                if key in final_rows[index]:
                    row[f"final_{key}"] = final_rows[index][key]
                    row[f"reference_{key}"] = reference_rows[ref_index][key]
                    row[f"delta_{key}"] = round(final_rows[index][key] - reference_rows[ref_index][key], 8)
            pairs.append(row)
    if [p["final_frame"] for p in pairs] != list(range(len(final_rows))):
        raise ValueError("Timeline does not cover every decoded final frame exactly once")
    return pairs


def make_representative_pairs(reference, selected, pairs, final_images, output):
    output.mkdir(parents=True, exist_ok=True)
    wanted = {pairs[index]["reference_frame"] for index in selected}
    reference_images = {}
    cap = cv2.VideoCapture(str(reference))
    index = 0
    # Sequential decoding avoids keyframe-seek uncertainty for the full-size evidence.
    while wanted:
        ok, bgr = cap.read()
        if not ok:
            raise RuntimeError("Reference ended while extracting representative pairs")
        if index in wanted:
            file = output / f"reference-f{index:05d}.jpg"
            cv2.imwrite(str(file), bgr, [cv2.IMWRITE_JPEG_QUALITY, 97])
            reference_images[index] = file
            wanted.remove(index)
        index += 1
    cap.release()
    records = []
    for final_index, details in selected.items():
        row = pairs[final_index]
        ref_index = row["reference_frame"]
        with Image.open(reference_images[ref_index]) as original, Image.open(final_images[final_index]) as final:
            # Preserve both native image dimensions; no resizing of the comparison images.
            image = Image.new("RGB", (original.width + final.width, max(original.height, final.height) + 70), "#10151b")
            image.paste(original, (0, 70)); image.paste(final, (original.width, 70))
            draw = ImageDraw.Draw(image)
            draw.text((18, 12), f"REFERENCE F{ref_index:05d} / {row['reference_seconds']:.3f}s", font=TITLE_FONT, fill="#f1f5f8")
            draw.text((original.width + 18, 12), f"FINAL F{final_index:05d} / {details['scene']} / {row['final_seconds']:.3f}s", font=TITLE_FONT, fill="#ffbd60")
            draw.text((18, 43), "Editorial correspondence; different geography and narration. No pixel-identity claim.", font=FONT, fill="#acb9c5")
            file = output / f"pair-{details['scene']}-{details['sample']}-f{final_index:05d}-r{ref_index:05d}.jpg"
            image.save(file, quality=96, subsampling=0)
        records.append({**details, "final_frame": final_index, "reference_frame": ref_index,
                        "file": str(file.relative_to(ROOT)), "native_side_by_side": True})
    return records


def write_html(path, final_path, reference_path, timeline, reference_meta, pairs, prepared=False):
    data = {"finalFps": timeline["fps"], "referenceFps": reference_meta["fps"],
            "preparedOnly": prepared, "pairs": [
                {k: row[k] for k in ("final_frame", "final_seconds", "reference_frame", "reference_seconds", "scene")}
                for row in pairs]}
    payload = json.dumps(data, separators=(",", ":")).replace("<", "\\u003c")
    final_url = html.escape(os.path.relpath(final_path, path.parent), quote=True)
    reference_url = html.escape(os.path.relpath(reference_path, path.parent), quote=True)
    template = r'''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Satellite briefing · 逐帧配对审阅</title><style>
:root{color-scheme:dark;font:15px system-ui;background:#0b1016;color:#edf1f5}body{max-width:1900px;margin:24px auto;padding:0 22px}h1{font-size:22px;font-weight:500}p{color:#aebbc6;line-height:1.65}.videos{display:grid;grid-template-columns:1fr 1fr;gap:16px}video{display:block;width:100%;background:#030507;aspect-ratio:16/9}article{min-width:0}h2{font:16px ui-monospace,monospace}button,select,input[type=number]{padding:10px;background:#19232e;color:inherit;border:1px solid #405365;border-radius:5px}button{cursor:pointer}button:hover{border-color:#ffbd60}.controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:20px 0}input[type=range]{width:100%;accent-color:#ffbd60}output{font-family:ui-monospace,monospace}#status{min-height:1.5em;color:#ffbd60}.help{font-size:13px}a{color:#93caff}#frame{width:90px}@media(max-width:800px){.videos{grid-template-columns:1fr}}
</style><h1>Satellite briefing · 逐帧配对审阅</h1>
<p>按镜头类型归一化映射参考时间；左右题材和地理内容不同。每一帧都有配对记录，指标描述亮度、色度、线条和运动，不能证明风格“100% 一致”。</p>
<div class="videos"><article><h2 id="refLabel">参考片</h2><video id="ref" muted playsinline preload="auto" src="__REFERENCE__"></video></article><article><h2 id="finalLabel">新加坡成片</h2><video id="final" muted playsinline preload="auto" src="__FINAL__"></video></article></div>
<div class="controls"><button id="prev">← 上一帧</button><button id="next">下一帧 →</button><button id="play">按配对顺序播放</button><select id="scene"></select><label>成片帧 <input id="frame" type="number" min="0" step="1"></label><button id="jump">跳转</button><output id="pair"></output></div>
<input id="slider" type="range" min="0" value="0" step="1"><p id="status"></p>
<p class="help">方向键逐帧；Shift + 方向键跳 24 帧。浏览器使用帧内时间 seek，并在支持时显示实际提交的视频帧时间；完整解码与原生尺寸静帧证据见 CSV 和配对 JPG。此页面需要与项目目录一起保留；若浏览器限制本地视频，使用项目的本地 HTTP 预览。</p>
<p><a href="comparison-pairs.csv">逐帧配对 CSV</a> · <a href="final-analysis/frame-metrics.csv">成片全部帧指标</a> · <a href="comparison-reference/frame-metrics.csv">参考片全部帧指标</a> · <a href="comparison-report.md">审阅记录</a></p>
<script type="application/json" id="mapping">__DATA__</script><script>
const data=JSON.parse(document.querySelector('#mapping').textContent),$=s=>document.querySelector(s),ref=$('#ref'),final=$('#final'),slider=$('#slider'),input=$('#frame');let current=0,busy=false,pending=null,playing=false,timer=null;
slider.max=input.max=data.pairs.length-1;
const scenes=[...new Set(data.pairs.map(p=>p.scene))];for(const scene of scenes){const o=document.createElement('option');o.value=scene;o.textContent=scene;$('#scene').append(o)}
function ready(video){const failure=()=>Error('视频无法载入：'+video.getAttribute('src')+' · '+(video.error?.message||'文件尚未生成或浏览器不支持此编码'));if(video.error)return Promise.reject(failure());return video.readyState>=1?Promise.resolve():new Promise((resolve,reject)=>{const clean=()=>{video.removeEventListener('loadedmetadata',loaded);video.removeEventListener('error',failed)};const loaded=()=>{clean();resolve()},failed=()=>{clean();reject(failure())};video.addEventListener('loadedmetadata',loaded,{once:true});video.addEventListener('error',failed,{once:true})})}
async function seek(video,index,fps){await ready(video);video.pause();const target=Math.min((index+.25)/fps,Math.max(0,video.duration-.001));return await new Promise(resolve=>{let done=false,callback=null;const finish=value=>{if(done)return;done=true;clearTimeout(timeout);if(callback!==null&&video.cancelVideoFrameCallback)video.cancelVideoFrameCallback(callback);video.removeEventListener('seeked',fallback);resolve(value)};const fallback=()=>{if(!video.requestVideoFrameCallback)finish({mediaTime:video.currentTime,verified:false})};const timeout=setTimeout(()=>finish({mediaTime:video.currentTime,verified:false}),1200);if(video.requestVideoFrameCallback)callback=video.requestVideoFrameCallback((now,meta)=>finish({mediaTime:meta.mediaTime,verified:true}));video.addEventListener('seeked',fallback,{once:true});video.currentTime=target})}
async function show(index){pending=Math.max(0,Math.min(data.pairs.length-1,Math.round(index)));if(busy)return;busy=true;while(pending!==null){current=pending;pending=null;const row=data.pairs[current];slider.value=input.value=current;$('#scene').value=row.scene;$('#refLabel').textContent=`参考片 · F${row.reference_frame} · ${row.reference_seconds.toFixed(3)}s`;$('#finalLabel').textContent=`新加坡 · F${current} · ${row.final_seconds.toFixed(3)}s · ${row.scene}`;$('#pair').textContent=`F${current} ↔ R${row.reference_frame}`;try{const observed=await Promise.all([seek(ref,row.reference_frame,data.referenceFps),seek(final,current,data.finalFps)]);$('#status').textContent=observed.map((o,i)=>`${i?'成片':'参考'} ${o.verified?'提交帧':'seek 时间'} ${o.mediaTime.toFixed(6)}s / F${Math.round(o.mediaTime*(i?data.finalFps:data.referenceFps))}`).join('　|　')}catch(error){$('#status').textContent=error.message;stop()}}busy=false}
function stop(){playing=false;clearTimeout(timer);$('#play').textContent='按配对顺序播放'}
async function tick(){if(!playing)return;await show(current+1);if(current>=data.pairs.length-1){stop();return}timer=setTimeout(tick,1000/data.finalFps)}
$('#prev').onclick=()=>{stop();show(current-1)};$('#next').onclick=()=>{stop();show(current+1)};slider.oninput=()=>{stop();show(+slider.value)};$('#jump').onclick=()=>{stop();show(+input.value)};input.onchange=()=>{stop();show(+input.value)};$('#scene').onchange=()=>{stop();show(data.pairs.findIndex(p=>p.scene===$('#scene').value))};$('#play').onclick=()=>{if(playing)stop();else{playing=true;$('#play').textContent='暂停';tick()}};document.addEventListener('keydown',event=>{if(['INPUT','SELECT'].includes(event.target.tagName))return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();stop();show(current+(event.key==='ArrowRight'?1:-1)*(event.shiftKey?24:1))}});show(0);
</script></html>'''
    path.write_text(template.replace("__REFERENCE__", reference_url).replace("__FINAL__", final_url).replace("__DATA__", payload))


def report(path, summary):
    ref, final = summary["reference"], summary["final"]
    lines = ["# 逐帧检测与风格配对证据", "",
             "此报告记录机器解码和可测画面特征。自动指标不能证明风格、效果或审美达到 100% 一致；人工审阅需要单独记录。", "",
             f"- 参考片：{ref['decoded_frame_count']} 帧，{ref['fps']:.6f} fps，SHA-256 `{ref['sha256']}`。",
             f"- 成片：{final['decoded_frame_count']} 帧，{final['fps']:.6f} fps，SHA-256 `{final['sha256']}`。",
             f"- 成片全部帧配对：{summary['pair_count']}；atlas 覆盖：{final['atlas_frame_coverage']} 帧。",
             f"- 黑帧范围：{final['black_frame_ranges']}；完全重复帧范围：{final['exact_duplicate_ranges']}。",
             f"- PTS 非递增帧：{final['nonmonotonic_pts_frames']}；元数据帧数与实际解码一致：{final['metadata_count_matches']}。", "",
             "## 方法与限制", "",
             "每帧以 OpenCV 解码，完整像素计算 SHA-256；画面特征在 480×270 AREA 缩放图上计算。亮度为 OpenCV 灰度，色度为 Lab a/b 到中性的距离，白色线条是亮且低饱和像素与扩张边缘的交集，琥珀色是 HSV 色相 12–37、饱和度≥90、明度≥115。颜色阈值也可能命中地物，不能直接等同于界面元素。", "",
             "帧差是相邻缩放灰度图的平均绝对差。近重复候选阈值小于 0.15，静态停顿也会命中，不自动视为故障。黑帧要求均值小于 4 且 99.5% 像素低于 10。PTS 为解码器返回值，另列名义帧时间；此工具未自行调用 ffmpeg 进程。", "",
             "映射按镜头类型将成片镜头起止归一化到指定参考区间，不代表同一地理内容或语义逐像素匹配。原生尺寸左右图按每镜头 20%、50%、80% 三处生成。atlas 每张 48 帧，按行从左到右覆盖连续全部帧。", "",
             "## 同类镜头的中位特征", "",
             "| 镜头 | 帧数 | 亮度 成片/参考 | 色度 成片/参考 | 白线比例 成片/参考 | 琥珀比例 成片/参考 | 帧差 成片/参考 |",
             "|---|---:|---:|---:|---:|---:|---:|"]
    for scene, values in summary["scenes"].items():
        def paired(key):
            return f"{values['final'][key]:.4f} / {values['reference'][key]:.4f}"
        lines.append(f"| {scene} | {values['count']} | {paired('luma_mean')} | {paired('chroma_mean')} | {paired('white_line_ratio')} | {paired('amber_ratio')} | {paired('frame_difference')} |")
    lines += ["", "## 人工审阅状态", "", "本脚本不自动填写人工已审阅、风格通过或 100% 一致。视觉发现请记录在独立人工审阅文件中。", ""]
    path.write_text("\n".join(lines))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=ROOT / "media/final.mp4")
    parser.add_argument("--reference", type=Path, default=ROOT / "reference/satellite-briefing.mp4")
    parser.add_argument("--timeline", type=Path, default=ROOT / "content/timeline.json")
    parser.add_argument("--prepare-only", action="store_true", help="Decode reference and build a planned mapping while final render is pending")
    parser.add_argument("--force-reference", action="store_true")
    args = parser.parse_args()
    review = ROOT / "review"
    review.mkdir(exist_ok=True)
    timeline = json.loads(args.timeline.read_text())
    reference_meta, reference_rows = load_reference(args.reference, review / "comparison-reference", args.force_reference)
    if args.prepare_only:
        planned = [{} for _ in range(timeline["duration_frames"])]
        pairs = build_pairs(timeline, planned, reference_meta, reference_rows)
        write_csv(review / "comparison-planned-pairs.csv", pairs)
        write_html(review / "comparison.html", args.input, args.reference, timeline, reference_meta, pairs, prepared=True)
        write_json(review / "comparison-prepared.json", {"status": "reference decoded; final render pending",
                   "reference_sha256": reference_meta["sha256"], "reference_frames": len(reference_rows),
                   "planned_final_frames": len(pairs), "timeline_sha256": digest(args.timeline)})
        print(f"Prepared reference and {len(pairs)} planned frame pairs; final video not analyzed.", flush=True)
        return
    if not args.input.exists():
        raise FileNotFoundError(f"Final input missing: {args.input}. Use --prepare-only while rendering.")
    selected = representative_frames(timeline)
    final_meta, final_rows, final_images = analyze(args.input, review / "final-analysis", "FINAL", selected)
    if abs(final_meta["fps"] - timeline["fps"]) > .001:
        raise ValueError("Final video FPS differs from timeline; mapping is unsafe")
    if final_meta["decoded_frame_count"] != timeline["duration_frames"]:
        raise ValueError("Final decoded count differs from timeline; review final-analysis before pairing")
    pairs = build_pairs(timeline, final_rows, reference_meta, reference_rows)
    write_csv(review / "comparison-pairs.csv", pairs)
    pair_images = make_representative_pairs(args.reference, selected, pairs, final_images, review / "comparison-pairs")
    scenes = {}
    for scene in dict.fromkeys(row["scene"] for row in pairs):
        matching = [row for row in pairs if row["scene"] == scene]
        scenes[scene] = {"count": len(matching)}
        for kind in ("final", "reference", "delta"):
            scenes[scene][kind] = {key: round(float(np.median([row[f"{kind}_{key}"] for row in matching])), 8) for key in FEATURES}
    summary = {"status": "complete machine decode; human visual review separate", "input_is_final_mp4": args.input.name == "final.mp4",
               "timeline_sha256": digest(args.timeline), "reference": reference_meta, "final": final_meta,
               "pair_count": len(pairs), "mapping": REFERENCE_INTERVALS, "representative_pairs": pair_images,
               "scenes": scenes, "no_aggregate_similarity_percentage": True}
    write_json(review / "comparison-summary.json", summary)
    write_html(review / "comparison.html", args.input, args.reference, timeline, reference_meta, pairs)
    report(review / "comparison-report.md", summary)
    print(json.dumps({"final_frames": len(final_rows), "reference_frames": len(reference_rows),
                      "pair_count": len(pairs), "representative_pairs": len(pair_images),
                      "black_ranges": final_meta["black_frame_ranges"], "duplicate_ranges": final_meta["exact_duplicate_ranges"],
                      "html": str(review / "comparison.html")}, indent=2), flush=True)


if __name__ == "__main__":
    main()
