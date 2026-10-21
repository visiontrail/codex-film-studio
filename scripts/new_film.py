#!/usr/bin/env python3
"""Copy a registered style into a new independent film directory."""
import argparse
import json
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]


def create(name, style, root=ROOT):
    if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}", name):
        raise ValueError("Use 1–64 lowercase letters, digits and hyphens, starting with a letter.")
    entries = json.loads((root / "styles.json").read_text())["styles"]
    entry = next((s for s in entries if s["id"] == style), None)
    if entry is None:
        raise ValueError(f"Unknown style: {style}")
    source = (root / entry["template"]).resolve()
    if root.resolve() not in source.parents or not source.is_dir():
        raise ValueError("Style template must be a directory inside the repository.")
    destination = root / "films" / name
    if destination.exists():
        raise FileExistsError(f"Already exists; no files changed: {destination}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, destination, ignore=shutil.ignore_patterns(
        "node_modules", ".venv", "media", "review", "reference", "__pycache__", "*.pyc"))
    for guide in ["DIRECTOR.md", "TECHNIQUE.md"]:
        shutil.copy2(root / guide, destination / guide)
    shutil.copy2(root / entry["guide"], destination / "STYLE.md")
    return destination


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name")
    parser.add_argument("--style", default="whiteboard")
    args = parser.parse_args()
    try:
        destination = create(args.name, args.style)
    except (ValueError, FileExistsError) as exc:
        parser.error(str(exc))
    print(f"Created {destination}\nOpen this folder in Codex and describe your film.")


if __name__ == "__main__":
    main()
