#!/usr/bin/env python3
"""Create a subject-empty Satellite Briefing project outside the method library."""
import argparse
from pathlib import Path
import re
import shutil

METHOD = Path(__file__).resolve().parent
LIBRARY = METHOD.parents[1]


def create(name, output=None):
    if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}", name):
        raise ValueError("Use 1–64 lowercase letters, digits and hyphens, starting with a letter.")
    raw = (Path(output).expanduser() if output is not None else
           LIBRARY.parent / (LIBRARY.name + "-projects") / name)
    if raw.is_symlink():
        raise ValueError("The output itself must not be a symlink.")
    destination = raw.resolve()
    if destination == LIBRARY or LIBRARY in destination.parents:
        raise ValueError("Create the production outside the methodology repository.")
    if destination.exists():
        raise FileExistsError("Already exists; no files changed: " + str(destination))
    source = METHOD / "starter"
    review_tools = LIBRARY / "scripts/frame_review"
    required = [source / "README.md", source / "lib/geo.mjs",
                review_tools / "README.md", review_tools / "audit_frames.py",
                review_tools / "compare_frames.py", review_tools / "compare_decoded_versions.py",
                review_tools / "ffmpeg_gate.py", METHOD / "prompt.txt",
                METHOD / "PROVENANCE.md", LIBRARY / "LICENSE"]
    for item in required:
        if not item.is_file():
            raise ValueError("Method package is incomplete: " + str(item))
    ignore = shutil.ignore_patterns("node_modules", ".venv", "media", "review",
                                   "reference", "__pycache__", "*.pyc", ".DS_Store")
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, destination, ignore=ignore)
    shutil.copytree(review_tools, destination / "tools/frame_review", ignore=ignore)
    shutil.copy2(METHOD / "prompt.txt", destination / "prompt.txt")
    shutil.copy2(LIBRARY / "LICENSE", destination / "LICENSE")
    text = (METHOD / "README.md").read_text(encoding="utf-8")
    (destination / "METHOD.md").write_text(text.replace("(starter/", "("), encoding="utf-8")
    text = (METHOD / "PROVENANCE.md").read_text(encoding="utf-8")
    (destination / "PROVENANCE.md").write_text(text.replace("../../LICENSE", "LICENSE"), encoding="utf-8")
    return destination


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name")
    parser.add_argument("--output", type=Path, help="New external project directory")
    args = parser.parse_args()
    try:
        result = create(args.name, args.output)
    except (ValueError, FileExistsError) as exc:
        parser.error(str(exc))
    print("Created " + str(result))
    print("Read README.md, fill the empty inputs, and author the new film.")


if __name__ == "__main__":
    main()
