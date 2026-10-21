#!/usr/bin/env python3
"""Build the public showcase from source and checksum-verified Release assets."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

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
    files = [(STUDIO / name, name) for name in source_files]
    manifest = json.loads((ROOT / "styles/whiteboard/demo-assets.json").read_text())
    for edition, entry in manifest["editions"].items():
        prefix = "editions/long/" if edition == "long" else ""
        for name in ["timeline.json", "poster.jpg", "captions.vtt", entry["video"]["name"]]:
            relative = f"{prefix}media/{name}"
            files.append((demo_root / relative, relative))
    for source, _ in files:
        if not source.is_file():
            raise FileNotFoundError(source)
    # Refuse to overwrite a folder supplied by the caller.
    output.mkdir(parents=True, exist_ok=False)
    for source, relative in files:
        destination = output / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
    (output / ".nojekyll").touch()
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
