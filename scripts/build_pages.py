#!/usr/bin/env python3
"""Build the style library homepage and verified public whiteboard showcase."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT / "styles/whiteboard/studio"


def build_site(demo_root, output, revision=""):
    """Copy only the files needed by the public player, never a whole studio."""
    source_files = [
        "index.html", "showcase.css", "showcase.mjs", "showcase-i18n.mjs",
        "fonts/ArchitectsDaughter-Regular.ttf", "src/comparison.mjs",
        "content/comparison.json", "content/sources.json",
        "editions/long/content/comparison.json", "editions/long/content/sources.json",
    ]
    player_prefix = "styles/whiteboard/studio/"
    files = [(STUDIO / name, player_prefix + name) for name in source_files]
    # Keep the portal independent of the retained local productions. Only generic
    # library artwork and the existing public sample enter the Pages artifact.
    files.extend((ROOT / name, name) for name in [
        "index.html", "catalog/studio.css", "catalog/studio.mjs",
        "catalog/hero.svg", "catalog/mark.svg",
    ])
    catalog = json.loads((ROOT / "styles.json").read_text())
    for style in catalog["styles"]:
        for key in ["preview", "preview_zh", "poster"]:
            if style.get(key):
                files.append((ROOT / style[key], style[key]))
        for page in style.get("showcases", []):
            for private_key in ["project", "source_page", "linked_files"]:
                page.pop(private_key, None)
    frame_manifest = ROOT / "docs/readme/frames.json"
    frames = json.loads(frame_manifest.read_text()).get("frames", []) if frame_manifest.exists() else []
    for frame in frames:
        files.append((ROOT / frame["image"], frame["image"]))
    files = list(dict.fromkeys(files))
    manifest = json.loads((ROOT / "styles/whiteboard/demo-assets.json").read_text())
    for edition, entry in manifest["editions"].items():
        prefix = "editions/long/" if edition == "long" else ""
        for name in ["timeline.json", "poster.jpg", "captions.vtt", entry["video"]["name"]]:
            relative = f"{prefix}media/{name}"
            files.append((demo_root / relative, player_prefix + relative))
    for source, _ in files:
        if not source.is_file():
            raise FileNotFoundError(source)
    # Refuse to overwrite a folder supplied by the caller.
    output.mkdir(parents=True, exist_ok=False)
    for source, relative in files:
        destination = output / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
    if revision:
        # Pages caches static assets for ten minutes. A new HTML document must
        # request the scripts and styles belonging to this deployment.
        homepage = output / "index.html"
        html = homepage.read_text(encoding="utf-8")
        query = urlencode({"v": revision})
        for asset in ["catalog/studio.css", "catalog/studio.mjs", "catalog/hero.svg", "catalog/mark.svg"]:
            html = html.replace(f'"{asset}"', f'"{asset}?{query}"')
        homepage.write_text(html, encoding="utf-8")
    (output / ".nojekyll").touch()
    (output / "styles.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
    (output / "docs/readme").mkdir(parents=True, exist_ok=True)
    (output / "docs/readme/frames.json").write_text(json.dumps({
        "frames": [{"style": frame["style"], "image": frame["image"]} for frame in frames],
    }, indent=2) + "\n")
    (output / "catalog-availability.json").write_text(json.dumps({
        "mode": "public",
        "pages": {page["id"]: page["access"] == "release"
                  for style in catalog["styles"] for page in style.get("showcases", [])},
    }, indent=2) + "\n")
    (output / "build-info.json").write_text(json.dumps({
        "revision": revision,
        "release": manifest["release"],
        "videos": {edition: entry["video"] for edition, entry in manifest["editions"].items()},
    }, indent=2) + "\n")
    print(f"Built {len(files)} public assets in {output}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / ".site")
    parser.add_argument("--asset-dir", type=Path, help="Use locally downloaded Release files.")
    parser.add_argument("--revision", default="", help="Source commit recorded in build-info.json.")
    args = parser.parse_args()
    if args.output.exists():
        raise FileExistsError(f"Output already exists; choose a new directory: {args.output}")
    with tempfile.TemporaryDirectory(prefix="codex-film-pages-") as temporary:
        demo_root = Path(temporary) / "demo"
        command = [sys.executable, str(ROOT / "scripts/fetch_demo.py"),
                   "--edition", "all", "--target", str(demo_root)]
        if args.asset_dir:
            command.extend(["--asset-dir", str(args.asset_dir.resolve())])
        subprocess.run(command, check=True)
        build_site(demo_root, args.output.resolve(), args.revision)


if __name__ == "__main__":
    main()
