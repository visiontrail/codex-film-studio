#!/usr/bin/env python3
"""Create an external, subject-empty sci-fi sitcom project; never overwrite work."""
import argparse
from pathlib import Path
import re
import shutil

METHOD = Path(__file__).resolve().parent
LIBRARY = METHOD.parents[1]


def create(name, output=None):
    if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}", name):
        raise ValueError("Use 1–64 lowercase letters, digits and hyphens, starting with a letter.")
    raw_destination = (Path(output).expanduser() if output is not None else
                       LIBRARY.parent / (LIBRARY.name + "-projects") / name)
    if raw_destination.is_symlink():
        raise ValueError("The output itself must not be a symlink.")
    destination = raw_destination.resolve()
    if destination == LIBRARY or LIBRARY in destination.parents:
        raise ValueError("Create the production outside the methodology repository.")
    if destination.exists():
        raise FileExistsError("Already exists; no files changed: " + str(destination))
    source = METHOD / "starter"
    review_tools = LIBRARY / "scripts/frame_review"
    for required in [source / "README.md", review_tools / "README.md",
                     METHOD / "prompt.txt", METHOD / "PROVENANCE.md", LIBRARY / "LICENSE"]:
        if not required.is_file():
            raise ValueError("Method package is incomplete: " + str(required))
    ignore = shutil.ignore_patterns("node_modules", ".venv", "media", "review",
                                   "reference", "__pycache__", "*.pyc", ".DS_Store")
    destination.parent.mkdir(parents=True, exist_ok=True)
    # copytree creates the destination exclusively; an intervening creation fails.
    shutil.copytree(source, destination, ignore=ignore)
    shutil.copytree(review_tools, destination / "tools/frame_review", ignore=ignore)
    shutil.copy2(METHOD / "prompt.txt", destination / "prompt.txt")
    shutil.copy2(LIBRARY / "LICENSE", destination / "LICENSE")
    text = (METHOD / "README.md").read_text(encoding="utf-8")
    text = text.replace("(starter/)", "(.)").replace("(starter/", "(")
    text = text.replace("../../CONTRIBUTING.md",
                        "https://github.com/visiontrail/codex-film-studio/blob/main/CONTRIBUTING.md")
    (destination / "METHOD.md").write_text(text, encoding="utf-8")
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
    print("Open README.md, fill the empty inputs, and author the new film.")


if __name__ == "__main__":
    main()
