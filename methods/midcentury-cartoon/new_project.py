#!/usr/bin/env python3
"""Create an external, subject-empty Mid-century Cartoon authoring project."""
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
    source, review = METHOD / "starter", LIBRARY / "scripts/frame_review"
    required = [source / "README.md", source / "lib/print.mjs", source / "lib/timeline.mjs",
                METHOD / "README.md", METHOD / "PROVENANCE.md", METHOD / "prompt.txt",
                METHOD / "UPSTREAM-LICENSE.txt", LIBRARY / "LICENSE", LIBRARY / "DIRECTOR.md",
                LIBRARY / "TECHNIQUE.md", review / "README.md", review / "audit_frames.py",
                review / "compare_frames.py", review / "compare_decoded_versions.py",
                review / "ffmpeg_gate.py"]
    for path in required:
        if not path.is_file():
            raise ValueError("Incomplete method package: " + str(path))
    ignore = shutil.ignore_patterns("node_modules", ".venv", "media", "review", "reference",
                                   "__pycache__", "*.pyc", ".DS_Store")
    destination.parent.mkdir(parents=True, exist_ok=True)
    # copytree exclusively creates the leaf directory and refuses concurrent creation.
    shutil.copytree(source, destination, ignore=ignore)
    shutil.copytree(review, destination / "tools/frame_review", ignore=ignore)
    for name in ["LICENSE", "DIRECTOR.md", "TECHNIQUE.md"]:
        shutil.copy2(LIBRARY / name, destination / name)
    for name in ["prompt.txt", "UPSTREAM-LICENSE.txt"]:
        shutil.copy2(METHOD / name, destination / name)
    method = (METHOD / "README.md").read_text(encoding="utf-8")
    method = method.replace("(starter/", "(").replace(
        "../../CONTRIBUTING.md",
        "https://github.com/visiontrail/codex-film-studio/blob/main/CONTRIBUTING.md")
    (destination / "METHOD.md").write_text(method, encoding="utf-8")
    provenance = (METHOD / "PROVENANCE.md").read_text(encoding="utf-8")
    (destination / "PROVENANCE.md").write_text(
        provenance.replace("../../LICENSE", "LICENSE"), encoding="utf-8")
    return destination


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name")
    parser.add_argument("--output", type=Path, help="External destination; must not exist")
    args = parser.parse_args()
    try:
        destination = create(args.name, args.output)
    except (ValueError, FileExistsError) as exc:
        parser.error(str(exc))
    print("Created " + str(destination))
    print("Read README.md, fill the empty inputs, and author your film.")


if __name__ == "__main__":
    main()
