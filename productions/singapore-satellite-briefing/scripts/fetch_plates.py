#!/usr/bin/env python3
"""Fetch georeferenced real satellite imagery; preserve requests, hashes and licences.

EOX layer `s2cloudless` is the 2016 mosaic (not the later NC mosaics).
WMS 1.1.1 uses lon/lat bbox order; NASA WMS 1.3.0 uses lat/lon.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
import hashlib
from io import BytesIO
import json
from pathlib import Path
import time
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
GIBS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"
EOX = "https://tiles.maps.eox.at/wms"
PLATES = {
    "world": {"bbox": [-180, -90, 180, 90], "width": 4096, "height": 2048,
              "provider": "NASA GIBS", "layer": "BlueMarble_NextGeneration", "year": 2004,
              "imagery_period": "Blue Marble Next Generation 2004 monthly-composite product",
              "role": "Orbit context; not current observation", "license": "NASA imagery use policy",
              "credit": "NASA Blue Marble / NASA GIBS"},
    "region": {"bbox": [90, -10, 120, 20], "width": 4096, "height": 4096,
                       "provider": "NASA GIBS", "layer": "BlueMarble_NextGeneration", "year": 2004,
                       "imagery_period": "Blue Marble Next Generation 2004 monthly-composite product",
                       "role": "Regional context; not current observation", "license": "NASA imagery use policy",
                       "credit": "NASA Blue Marble / NASA GIBS"},
    "metro": {"bbox": [102, 0, 105, 3], "width": 4096, "height": 4096,
                       "provider": "EOX", "layer": "s2cloudless", "year": 2016, "imagery_period": "2016 mosaic",
                       "role": "Historical metropolitan-region basemap for continuous orbit-to-city scale transition; not a current observation",
                       "license": "CC BY 4.0", "license_url": "https://creativecommons.org/licenses/by/4.0/",
                       "credit": "Sentinel-2 cloudless 2016 by EOX / Contains modified Copernicus Sentinel data 2016"},
    "singapore": {"bbox": [103.55, 1.15, 104.1, 1.50], "width": 6000, "height": 3818,
                       "provider": "EOX", "layer": "s2cloudless", "year": 2016, "imagery_period": "2016 mosaic",
                       "role": "Historical geographic basemap, not a 2026 observation or current construction map",
                       "license": "CC BY 4.0", "license_url": "https://creativecommons.org/licenses/by/4.0/",
                       "credit": "Sentinel-2 cloudless 2016 by EOX / Contains modified Copernicus Sentinel data 2016"},
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def get(url, timeout=70):
    last_error = None
    for attempt in range(4):
        try:
            req = Request(url, headers={"User-Agent": "CodexFilmStudio-Singapore/1.0"})
            with urlopen(req, timeout=timeout) as response:
                data = response.read()
                return data, response.headers.get("Content-Type", "")
        except Exception as exc:
            last_error = exc
            if attempt < 3:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Cannot fetch {url}: {last_error}")


def make_url(spec, bbox, width, height):
    west, south, east, north = bbox
    common = {"SERVICE": "WMS", "REQUEST": "GetMap", "LAYERS": spec["layer"],
              "STYLES": "", "WIDTH": width, "HEIGHT": height, "FORMAT": "image/jpeg"}
    if spec["provider"] == "NASA GIBS":
        common.update(VERSION="1.3.0", CRS="EPSG:4326",
                      BBOX=",".join(f"{v:.10f}" for v in [south, west, north, east]))
        return GIBS + "?" + urlencode(common)
    common.update(VERSION="1.1.1", SRS="EPSG:4326",
                  BBOX=",".join(f"{v:.10f}" for v in bbox))
    return EOX + "?" + urlencode(common)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=list(PLATES), nargs="+")
    parser.add_argument("--workers", type=int, default=5)
    args = parser.parse_args()
    raw = ROOT / "assets/raw"
    out = ROOT / "assets/plates"
    raw.mkdir(parents=True, exist_ok=True)
    out.mkdir(parents=True, exist_ok=True)
    records = []
    existing = ROOT / "content/imagery.json"
    if existing.exists():
        manifest = json.loads(existing.read_text())
    else:
        manifest = {"coordinate_reference_system": "EPSG:4326", "bbox_order": "west,south,east,north",
                    "ground_truth_note": "Basemaps show the stated imagery period; travel advice is researched separately.",
                    "plates": []}
    for name in args.only or PLATES:
        spec = PLATES[name]
        target = raw / name
        target.mkdir(exist_ok=True)
        west, south, east, north = spec["bbox"]
        width, height = spec["width"], spec["height"]
        dx, dy = (east - west) / width, (north - south) / height
        jobs = []
        for y in range(0, height, 1000):
            for x in range(0, width, 1000):
                tw, th = min(1000, width-x), min(1000, height-y)
                box = [west+x*dx, north-(y+th)*dy, west+(x+tw)*dx, north-y*dy]
                jobs.append((x, y, tw, th, box))
        canvas = Image.new("RGB", (width, height))

        def fetch(job):
            x, y, tw, th, box = job
            url = make_url(spec, box, tw, th)
            path = target / f"x{x:04d}_y{y:04d}.jpg"
            if path.exists():
                data, content_type, cached = path.read_bytes(), "image/jpeg", True
            else:
                data, content_type = get(url)
                cached = False
            if not content_type.startswith("image/"):
                raise ValueError(f"Non-image response {content_type}: {data[:200]!r}")
            im = Image.open(BytesIO(data))
            im.load()
            if im.size != (tw, th):
                raise ValueError(f"Wrong tile dimensions {im.size}; expected {(tw, th)}")
            if not cached:
                path.write_bytes(data)
            rec = {"plate": name, "x": x, "y": y, "width": tw, "height": th, "bbox": box,
                   "url": url, "cache_reused": cached, "bytes": len(data), "sha256": digest(data),
                   "checked_at_utc": datetime.now(timezone.utc).isoformat(),
                   "source_file": str(path.relative_to(ROOT))}
            return im.convert("RGB"), rec

        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures = [pool.submit(fetch, job) for job in jobs]
            for i, future in enumerate(as_completed(futures)):
                im, rec = future.result()
                canvas.paste(im, (rec["x"], rec["y"]))
                records.append(rec)
                print(f"{name}: {i+1}/{len(jobs)} tiles", flush=True)
        destination = out / f"{name}.jpg"
        canvas.save(destination, quality=96, subsampling=0)
        p = dict(spec)
        p.update(id=name, source=spec["provider"], file=str(destination.relative_to(ROOT)), sha256=digest(destination.read_bytes()),
                 assembled_at_utc=datetime.now(timezone.utc).isoformat(),
                 modifications="EPSG:4326 WMS reprojection, tile stitching, JPEG encoding; film grading is separate")
        manifest["plates"] = [a for a in manifest["plates"] if a["id"] != name] + [p]
        existing.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
        with (raw / "imagery-requests.jsonl").open("a") as log:
            for rec in [r for r in records if r["plate"] == name]:
                log.write(json.dumps(rec, ensure_ascii=False) + "\n")
        print(f"Saved {destination} ({width} x {height})", flush=True)


if __name__ == "__main__":
    main()
