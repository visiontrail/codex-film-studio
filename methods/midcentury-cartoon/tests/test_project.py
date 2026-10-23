import importlib.util
import json
from pathlib import Path
import re
import subprocess
import tempfile
import unittest

METHOD = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("midcentury_project", METHOD / "new_project.py")
project = importlib.util.module_from_spec(spec)
spec.loader.exec_module(project)


class ProjectTests(unittest.TestCase):
    def test_empty_self_contained_project_runs_without_old_production(self):
        with tempfile.TemporaryDirectory() as folder:
            target = project.create("fresh-subject", Path(folder) / "film")
            for file, field in [("sources", "claims"), ("sources", "assets"),
                                ("narration", "lines"), ("shot-plan", "shots"),
                                ("voice-inputs", "recordings"), ("reference-map", "shots")]:
                self.assertEqual(json.loads((target / "content" / (file + ".json")).read_text())[field], [])
            self.assertIsNone(json.loads((target / "content/brief.json").read_text())["subject"])
            self.assertTrue(json.loads((target / "content/timeline.json").read_text())["draft"])
            review = json.loads((target / "content/review-record.json").read_text())
            self.assertIsNone(review["style_decision"])
            self.assertEqual(review["thumbnail_observations"], [])
            for file in ["STYLE.md", "WORKFLOW.md", "AUDIO.md", "REVIEW.md", "INPUTS.md",
                         "LICENSE", "UPSTREAM-LICENSE.txt", "PROVENANCE.md", "prompt.txt",
                         "tools/frame_review/compare_frames.py", "tools/frame_review/audit_frames.py",
                         "tools/frame_review/compare_decoded_versions.py", "tools/frame_review/ffmpeg_gate.py"]:
                self.assertTrue((target / file).is_file(), file)
            for extension in ["*.mp4", "*.wav", "*.ttf", "*.png"]:
                self.assertFalse(any(target.rglob(extension)), extension)
            # Imported helper tests run from the generated directory with no npm install.
            result = subprocess.run(["node", "--test", "tests/helpers.test.mjs"], cwd=target,
                                    text=True, capture_output=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            for guide in ["README.md", "METHOD.md", "PROVENANCE.md", "STYLE.md", "REVIEW.md"]:
                for link in re.findall(r"\]\(([^)]+)\)", (target / guide).read_text()):
                    if "://" not in link and not link.startswith("#"):
                        self.assertTrue((target / link.split("#")[0]).exists(), (guide, link))

    def test_existing_directory_is_preserved(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "film"
            target.mkdir()
            (target / "README.md").write_text("owned by user")
            with self.assertRaises(FileExistsError):
                project.create("film", target)
            self.assertEqual((target / "README.md").read_text(), "owned by user")
            self.assertEqual(len(list(target.iterdir())), 1)

    def test_invalid_name_and_repository_routes_are_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            alias = Path(folder) / "library"
            alias.symlink_to(project.LIBRARY, target_is_directory=True)
            for path in [project.LIBRARY, project.LIBRARY / "new-film", alias / "new-film"]:
                with self.subTest(path=path), self.assertRaises(ValueError):
                    project.create("film", path)
            dangling = Path(folder) / "dangling"
            dangling.symlink_to(Path(folder) / "missing")
            with self.assertRaises(ValueError):
                project.create("film", dangling)
            target = Path(folder) / "new-parent/film"
            with self.assertRaises(ValueError):
                project.create("../escape", target)
            self.assertFalse(target.parent.exists())


if __name__ == "__main__":
    unittest.main()
