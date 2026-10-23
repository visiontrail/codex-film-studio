import importlib.util
import json
from pathlib import Path
import re
import tempfile
import unittest

METHOD = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("satellite_project", METHOD / "new_project.py")
project = importlib.util.module_from_spec(spec)
spec.loader.exec_module(project)


class ProjectCreationTests(unittest.TestCase):
    def test_project_is_empty_self_contained_and_has_no_inherited_acceptance(self):
        with tempfile.TemporaryDirectory() as folder:
            result = project.create("new-subject", Path(folder) / "film")
            inputs = result / "content"
            self.assertEqual(json.loads((inputs / "imagery.json").read_text()),
                             {"places": [], "plates": [], "measures": []})
            self.assertEqual(json.loads((inputs / "footage.json").read_text()),
                             {"sources": [], "inserts": []})
            self.assertEqual(json.loads((inputs / "narration.json").read_text()), {"lines": []})
            self.assertTrue(json.loads((inputs / "timeline.json").read_text())["draft"])
            self.assertIsNone(json.loads((inputs / "review-record.json").read_text())["style_decision"])
            for item in ["STYLE.md", "WORKFLOW.md", "FOOTAGE.md", "INPUTS.md", "REVIEW.md",
                         "prompt.txt", "LICENSE", "PROVENANCE.md", "lib/geo.mjs",
                         "tools/frame_review/audit_frames.py", "tools/frame_review/compare_frames.py",
                         "tools/frame_review/compare_decoded_versions.py", "tools/frame_review/ffmpeg_gate.py"]:
                self.assertTrue((result / item).is_file(), item)
            for guide in [result / "METHOD.md", result / "PROVENANCE.md", result / "README.md"]:
                for target in re.findall(r"\]\(([^)]+)\)", guide.read_text()):
                    if not target.startswith(("https://", "http://", "#")):
                        self.assertTrue((guide.parent / target).exists(), str(guide) + ": " + target)
            self.assertFalse(any(result.rglob("*.mp4")))
            self.assertFalse(any(result.rglob("*.wav")))

    def test_existing_files_are_unchanged_on_rejection(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "film"
            target.mkdir()
            (target / "README.md").write_text("user-owned")
            with self.assertRaises(FileExistsError):
                project.create("film", target)
            self.assertEqual((target / "README.md").read_text(), "user-owned")
            self.assertEqual(len(list(target.iterdir())), 1)

    def test_library_and_symlink_routes_are_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            alias = Path(folder) / "alias"
            alias.symlink_to(project.LIBRARY, target_is_directory=True)
            for output in [project.LIBRARY, project.LIBRARY / "new-film", alias / "new-film"]:
                with self.subTest(output=output), self.assertRaises(ValueError):
                    project.create("film", output)
            dangling = Path(folder) / "dangling"
            dangling.symlink_to(Path(folder) / "missing")
            with self.assertRaises(ValueError):
                project.create("film", dangling)

    def test_invalid_name_creates_nothing(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "new-parent" / "film"
            with self.assertRaises(ValueError):
                project.create("../escape", target)
            self.assertFalse(target.parent.exists())


if __name__ == "__main__":
    unittest.main()
