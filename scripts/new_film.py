#!/usr/bin/env python3
"""List film styles or create an independent production outside this library."""
import argparse
import json
from pathlib import Path
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
IGNORE = shutil.ignore_patterns(
    "node_modules", ".venv", "media", "review", "reference", "__pycache__", "*.pyc", ".DS_Store")


def destination_for(name, root, output=None):
    if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}", name):
        raise ValueError("Use 1–64 lowercase letters, digits and hyphens, starting with a letter.")
    root = root.resolve()
    raw = (Path(output).expanduser() if output is not None else
           root.parent / f"{root.name}-projects" / name)
    if raw.is_symlink():
        raise ValueError("The output itself must not be a symlink.")
    destination = raw.resolve()
    if destination == root or root in destination.parents:
        raise ValueError("Film content must be outside the style library.")
    if destination.exists():
        raise FileExistsError(f"Already exists; no files changed: {destination}")
    return destination


def project_text(text):
    """Make package documentation usable from its independent working copy."""
    return (text.replace("(starter/)", "(.)").replace("(starter/", "(")
            .replace("starter/content/", "content/").replace("starter/lib/", "lib/")
            .replace("../../scripts/frame_review", "tools/frame_review")
            .replace("../scripts/frame_review", "tools/frame_review")
            .replace("../../CONTRIBUTING.md",
                     "https://github.com/visiontrail/codex-film-studio/blob/main/CONTRIBUTING.md")
            .replace("../../LICENSE", "LICENSE"))


def create(name, style, root=ROOT, output=None):
    root = root.resolve()
    destination = destination_for(name, root, output)
    entries = json.loads((root / "styles.json").read_text())["styles"]
    entry = next((s for s in entries if s["id"] == style), None)
    if entry is None:
        raise ValueError(f"Unknown style: {style}. Use --list to see available styles.")
    style_root = (root / "styles" / style).resolve()
    if root not in style_root.parents:
        raise ValueError("Style package must be inside the library.")
    source = (root / entry["template"]).resolve()
    guide = (root / entry["guide"]).resolve()
    if (style_root not in source.parents or not source.is_dir() or
            style_root not in guide.parents or not guide.is_file()):
        raise ValueError("Style template and guide must exist inside their style package.")

    # Validate inputs before creating any output directories.
    copies = [(root / name, name) for name in ["DIRECTOR.md", "TECHNIQUE.md"]]
    copies.append((guide, "STYLE.md"))
    if (root / "LICENSE").is_file():
        copies.append((root / "LICENSE", "LICENSE"))
    for name in ["prompt.txt", "PROVENANCE.md", "UPSTREAM-LICENSE.txt"]:
        if (style_root / name).is_file():
            copies.append((style_root / name, name))
    blank = entry.get("template_kind") == "blank"
    if blank:
        copies.append((style_root / "README.md", "METHOD.md"))
        for name in ["WORKFLOW.md", "REVIEW.md"]:
            if not (source / name).exists():
                copies.append((root / "methods" / name, name))
        review_tools = root / "scripts/frame_review"
        if not (review_tools / "README.md").is_file():
            raise ValueError("Missing shared frame-review tools.")
    for path, _ in copies:
        if not path.is_file():
            raise ValueError(f"Incomplete style package: {path}")

    destination.parent.mkdir(parents=True, exist_ok=True)
    # copytree creates the leaf exclusively and refuses a concurrent creation.
    shutil.copytree(source, destination, ignore=IGNORE)
    for path, target in copies:
        if path.suffix == ".md":
            (destination / target).write_text(project_text(path.read_text()), encoding="utf-8")
        else:
            shutil.copy2(path, destination / target)
    if blank:
        shutil.copytree(review_tools, destination / "tools/frame_review", ignore=IGNORE)
    return destination


def create_method(name, method, root=ROOT, output=None):
    """Compatibility alias for callers that previously selected a style as a method."""
    return create(name, method, root=root, output=output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name", nargs="?")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--style", help="Style ID from styles.json (default: whiteboard)")
    mode.add_argument("--method", help="Deprecated alias for --style")
    parser.add_argument("--list", action="store_true", help="List all styles and completion status")
    parser.add_argument("--output", type=Path, help="New external project directory")
    args = parser.parse_args()
    if args.list:
        if args.name or args.style or args.method or args.output:
            parser.error("Use --list on its own.")
        catalog = json.loads((ROOT / "styles.json").read_text())
        for entry in catalog["styles"]:
            print(f"{entry['id']:22} {entry['status']:15} {entry['name_zh']} / {entry['name']}")
            print(f"  {entry['status_note_zh']}")
        return
    if not args.name:
        parser.error("Provide a project name, or use --list.")
    if args.method:
        print("--method is deprecated; all styles now use --style.", file=sys.stderr)
    style = args.style or args.method or "whiteboard"
    try:
        destination = create(args.name, style, output=args.output)
    except (ValueError, FileExistsError) as exc:
        parser.error(str(exc))
    print(f"Created {destination}\nOpen this folder in Codex and describe your film.")


if __name__ == "__main__":
    main()
