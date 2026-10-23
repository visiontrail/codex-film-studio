import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

METHOD = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("scifi_project", METHOD / "new_project.py")
project = importlib.util.module_from_spec(spec)
spec.loader.exec_module(project)


class ProjectCreationTests(unittest.TestCase):
    def test_created_project_is_empty_and_self_contained(self):
        with tempfile.TemporaryDirectory() as folder:
            result = project.create("new-subject", Path(folder) / "film")
            inputs = result / "content"
            self.assertEqual(json.loads((inputs / "characters.json").read_text()), {"characters": []})
            self.assertEqual(json.loads((inputs / "dialogue.json").read_text()), {"lines": []})
            self.assertEqual(json.loads((inputs / "sources.json").read_text()), {"claims": [], "assets": []})
            self.assertTrue(json.loads((inputs / "timeline.json").read_text())["draft"])
            self.assertIsNone(json.loads((inputs / "review-record.json").read_text())["style_decision"])
            for required in ["STYLE.md", "WORKFLOW.md", "REVIEW.md", "INPUTS.md", "LICENSE",
                             "lib/ink.mjs", "lib/timeline.mjs", "tools/frame_review/compare_frames.py",
                             "tools/frame_review/audit_frames.py", "tools/frame_review/compare_decoded_versions.py"]:
                self.assertTrue((result / required).is_file(), required)
            self.assertNotIn("(starter/", (result / "METHOD.md").read_text())
            self.assertFalse(any(result.rglob("*.mp4")))
            self.assertFalse(any(result.rglob("*.wav")))

    def test_existing_work_is_not_overwritten(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "film"
            target.mkdir()
            (target / "README.md").write_text("user-owned")
            with self.assertRaises(FileExistsError):
                project.create("film", target)
            self.assertEqual((target / "README.md").read_text(), "user-owned")
            self.assertEqual(len(list(target.iterdir())), 1)

    def test_repository_and_symlink_routes_are_rejected(self):
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

    def test_invalid_name_does_not_create_directories(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "new-parent" / "film"
            with self.assertRaises(ValueError):
                project.create("../escape", target)
            self.assertFalse(target.parent.exists())


if __name__ == "__main__":
    unittest.main()
