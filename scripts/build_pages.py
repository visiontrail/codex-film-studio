#!/usr/bin/env python3
"""Build the style library and checksum-verified public sample previews."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from urllib.parse import urlencode
from fetch_demo import sha, unpack

ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT / "styles/whiteboard/studio"


def fetch_showcase_bundle(manifest, destination, asset_dir=None):
    """Install a pinned public preview archive, separate from production sources."""
    asset = manifest['archive']
    destination.mkdir(parents=True, exist_ok=False)
    archive = destination.parent / asset['name']
    if asset_dir:
        shutil.copyfile(asset_dir / asset['name'], archive)
    else:
        request = urllib.request.Request(asset['url'], headers={'User-Agent': 'codex-film-studio'})
        with urllib.request.urlopen(request, timeout=120) as response, archive.open('wb') as handle:
            shutil.copyfileobj(response, handle)
    if archive.stat().st_size != asset['bytes'] or sha(archive) != asset['sha256']:
        raise ValueError(f"Release checksum mismatch: {asset['name']}")
    unpack(archive, destination)
    actual = {str(p.relative_to(destination)) for p in destination.rglob('*') if p.is_file()}
    if actual != set(manifest['files']):
        raise ValueError('Public preview archive differs from the approved file list')
    return destination


def build_site(demo_root, output, revision="", published_roots=None):
    """Copy only the files needed by the public player, never a whole studio."""
    if output.exists():
        raise FileExistsError(output)
    published_roots = published_roots or {}
    source_files = [
        "index.html", "showcase.css", "showcase.mjs", "showcase-i18n.mjs",
        "fonts/ArchitectsDaughter-Regular.ttf", "src/comparison.mjs",
        "content/comparison.json", "content/sources.json",
        "editions/long/content/comparison.json", "editions/long/content/sources.json",
    ]
    player_prefix = "styles/whiteboard/studio/"
    files = [(STUDIO / name, player_prefix + name) for name in source_files]
    # Keep the portal independent of the retained local productions. Only generic
    # library artwork and approved Release samples enter the Pages artifact.
    files.extend((ROOT / name, name) for name in [
        "index.html", "catalog/studio.css", "catalog/studio.mjs",
        "catalog/hero.svg", "catalog/mark.svg",
    ])
    catalog = json.loads((ROOT / "styles.json").read_text())
    for style in catalog["styles"]:
        if style.get('public_assets'):
            bundle = json.loads((ROOT / style['public_assets']).read_text())
            source = published_roots.get(style['id'])
            if source is None:
                raise FileNotFoundError(f"Verified public preview required: {style['id']}")
            files.extend((source / name, str(Path(style['landing']['page']).parent / name))
                         for name in bundle['files'])
        # A generic style landing page can ship independently of its local film.
        # Only these explicitly registered sources enter the public artifact.
        if landing := style.get("landing"):
            files.extend((ROOT / name, name) for name in [landing["page"], *landing["assets"]])
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
        for style in catalog["styles"]:
            if landing := style.get("landing"):
                page = output / landing["page"]
                html = page.read_text(encoding="utf-8")
                for asset in landing["assets"]:
                    if Path(asset).parent == Path(landing["page"]).parent:
                        html = html.replace(f'"{Path(asset).name}"', f'"{Path(asset).name}?{query}"')
                page.write_text(html, encoding="utf-8")
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
        "previews": {style['id']: json.loads((ROOT / style['public_assets']).read_text())['archive']
                     for style in catalog['styles'] if style.get('public_assets')},
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
        published_roots = {}
        for style in json.loads((ROOT / 'styles.json').read_text())['styles']:
            if style.get('public_assets'):
                bundle = json.loads((ROOT / style['public_assets']).read_text())
                print(f"Downloading verified {style['id']} preview…", flush=True)
                published_roots[style['id']] = fetch_showcase_bundle(
                    bundle, Path(temporary) / style['id'], args.asset_dir)
        build_site(demo_root, args.output.resolve(), args.revision, published_roots)


if __name__ == "__main__":
    main()
