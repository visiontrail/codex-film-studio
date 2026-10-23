#!/usr/bin/env python3
"""Create an external production from a registered style or a blank method."""
import argparse
import json
from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]


def destination_for(name, root, output=None):
    if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}", name):
        raise ValueError("Use 1–64 lowercase letters, digits and hyphens, starting with a letter.")
    root = root.resolve()
    destination = (Path(output).expanduser() if output else
                   root.parent / f"{root.name}-projects" / name).resolve()
    if destination == root or root in destination.parents:
        raise ValueError("Film content must be outside the methodology repository.")
    if destination.exists():
        raise FileExistsError(f"Already exists; no files changed: {destination}")
    return destination


def create(name, style, root=ROOT, output=None):
    destination = destination_for(name, root, output)
    entries = json.loads((root / "styles.json").read_text())["styles"]
    entry = next((s for s in entries if s["id"] == style), None)
    if entry is None:
        raise ValueError(f"Unknown style: {style}")
    source = (root / entry["template"]).resolve()
    if root.resolve() not in source.parents or not source.is_dir():
        raise ValueError("Style template must be a directory inside the repository.")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, destination, ignore=shutil.ignore_patterns(
        "node_modules", ".venv", "media", "review", "reference", "__pycache__", "*.pyc"))
    for guide in ["DIRECTOR.md", "TECHNIQUE.md"]:
        shutil.copy2(root / guide, destination / guide)
    shutil.copy2(root / entry["guide"], destination / "STYLE.md")
    return destination


def create_method(name, method, root=ROOT, output=None):
    destination = destination_for(name, root, output)
    if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}", method):
        raise ValueError("Invalid method ID")
    method_root = (root / "methods" / method).resolve()
    source, guide = (method_root / "starter").resolve(), method_root / "README.md"
    if (root.resolve() not in method_root.parents or method_root not in source.parents
            or not source.is_dir() or not guide.is_file()):
        raise ValueError(f"Unknown method: {method}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, destination, ignore=shutil.ignore_patterns(
        "node_modules", ".venv", "media", "review", "reference", "__pycache__", "*.pyc"))
    method_text = guide.read_text().replace("../../scripts/frame_review/README.md", "tools/frame_review/README.md")
    method_text = method_text.replace("starter/content/", "content/").replace("starter/lib/", "lib/")
    (destination / "METHOD.md").write_text(method_text)
    review_tools = root / "scripts/frame_review"
    if review_tools.is_dir():
        shutil.copytree(review_tools, destination / "tools/frame_review",
                        ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
    return destination


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--style", help="Registered editable style")
    mode.add_argument("--method", help="Subject-independent blank production method")
    parser.add_argument("--output", type=Path, help="External project directory; never inside this repository")
    args = parser.parse_args()
    try:
        destination = (create_method(args.name, args.method, output=args.output) if args.method
                       else create(args.name, args.style or "whiteboard", output=args.output))
    except (ValueError, FileExistsError) as exc:
        parser.error(str(exc))
    print(f"Created {destination}\nOpen this folder in Codex and describe your film.")


if __name__ == "__main__":
    main()
