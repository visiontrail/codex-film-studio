"""Behavior checks for isolated film creation and safe demo installation."""
import io
import json
from pathlib import Path
import tarfile
import tempfile
import unittest
from fetch_demo import unpack, install
from new_film import create


class PackagingTests(unittest.TestCase):
    def test_new_film_excludes_rendered_media_and_preserves_existing_work(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            template = root / "styles/whiteboard/studio"
            (template / "media").mkdir(parents=True)
            (template / "media/film.mp4").write_bytes(b"private-development")
            (template / "film.mjs").write_text("export const film = true")
            for name in ["DIRECTOR.md", "TECHNIQUE.md"]:
                (root / name).write_text(name)
            (root / "styles/whiteboard/STYLE.md").write_text("Whiteboard")
            (root / "styles.json").write_text(json.dumps({"styles": [{
                "id": "whiteboard", "template": "styles/whiteboard/studio",
                "guide": "styles/whiteboard/STYLE.md"}]}))
            dest = create("test-film", "whiteboard", root)
            self.assertTrue((dest / "film.mjs").exists())
            self.assertFalse((dest / "media").exists())
            (dest / "film.mjs").write_text("user edit")
            with self.assertRaises(FileExistsError):
                create("test-film", "whiteboard", root)
            self.assertEqual((dest / "film.mjs").read_text(), "user edit")
            with self.assertRaises(ValueError):
                create("../../outside", "whiteboard", root)

    def test_changed_file_prevents_partial_install(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            stage, dest = root / "stage", root / "dest"
            stage.mkdir(); dest.mkdir()
            (stage / "a.txt").write_text("new")
            (stage / "z.txt").write_text("release")
            (dest / "z.txt").write_text("user")
            with self.assertRaises(FileExistsError):
                install(stage, dest)
            self.assertFalse((dest / "a.txt").exists())
            self.assertEqual((dest / "z.txt").read_text(), "user")

    def test_archive_rejects_traversal_and_links(self):
        for name, link in [("media/../../escape", False), ("media/link", True)]:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as temp:
                root = Path(temp); archive = root / "bad.tar.gz"
                with tarfile.open(archive, "w:gz") as tar:
                    entry = tarfile.TarInfo(name)
                    if link:
                        entry.type = tarfile.SYMTYPE; entry.linkname = "/tmp/outside"
                        tar.addfile(entry)
                    else:
                        entry.size = 1; tar.addfile(entry, io.BytesIO(b"x"))
                with self.assertRaises(ValueError):
                    unpack(archive, root / "stage")


if __name__ == "__main__":
    unittest.main()
