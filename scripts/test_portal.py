"""Check the portal's deployment boundary and local availability reporting."""
import json
from pathlib import Path
import tempfile
import unittest

from build_pages import ROOT, build_site, fetch_showcase_bundle
from fetch_demo import sha
from serve_styles import catalog_availability, resolve_resource


class PortalTests(unittest.TestCase):
    def test_public_build_keeps_player_and_excludes_local_productions(self):
        with tempfile.TemporaryDirectory() as temporary:
            demo = Path(temporary) / 'verified-demo'
            catalog = json.loads((ROOT / 'styles.json').read_text())
            manifest = json.loads((ROOT / 'styles/whiteboard/demo-assets.json').read_text())
            for edition, entry in manifest['editions'].items():
                directory = demo / ('editions/long/media' if edition == 'long' else 'media')
                directory.mkdir(parents=True)
                for name in ['timeline.json', 'poster.jpg', 'captions.vtt', entry['video']['name']]:
                    (directory / name).write_bytes(b'verified fixture')
            output = Path(temporary) / 'public-site'
            published_roots = {}
            preview_movies = 0
            for style in catalog['styles']:
                if style.get('public_assets'):
                    bundle = json.loads((ROOT / style['public_assets']).read_text())
                    source = Path(temporary) / style['id']
                    for name in bundle['files']:
                        p = source / name
                        p.parent.mkdir(parents=True, exist_ok=True)
                        p.write_bytes(b'public preview fixture')
                        preview_movies += name.endswith('.mp4')
                    published_roots[style['id']] = source
            build_site(demo, output, 'portal-test', published_roots)
            homepage = (output / 'index.html').read_text()
            for asset in ['catalog/studio.mjs', 'catalog/studio.css', 'catalog/hero.svg', 'catalog/mark.svg']:
                self.assertIn(f'{asset}?v=portal-test', homepage)
            self.assertIn('showcase.mjs', (output / 'styles/whiteboard/studio/index.html').read_text())
            self.assertTrue((output / 'styles/whiteboard/studio/editions/long/media/captions.vtt').is_file())
            self.assertEqual(len(list(output.rglob('*.mp4'))), len(manifest['editions']) + preview_movies)
            self.assertTrue((output / 'styles/caption-news/showcase/media/film.mp4').is_file())
            self.assertTrue((output / 'styles/caption-news/showcase/media/manifest.json').is_file())
            public_catalog = json.loads((output / 'styles.json').read_text())
            self.assertEqual([s['id'] for s in catalog['styles']], [s['id'] for s in public_catalog['styles']])
            availability = json.loads((output / 'catalog-availability.json').read_text())
            self.assertEqual(availability['mode'], 'public')
            for style in public_catalog['styles']:
                if landing := style.get('landing'):
                    for name in [landing['page'], *landing['assets']]:
                        self.assertTrue((output / name).is_file(), name)
                for key in ['preview', 'preview_zh', 'poster']:
                    if style.get(key):
                        self.assertTrue((output / style[key]).is_file())
                for page in style.get('showcases', []):
                    for private_key in ['project', 'source_page', 'linked_files']:
                        self.assertNotIn(private_key, page)
                    self.assertEqual(availability['pages'][page['id']], page['access'] == 'release')
                    if page['access'] == 'local':
                        # A generic style page may ship without its local media.
                        self.assertEqual((output / page['page']).exists(),
                                         page['page'] == style.get('landing', {}).get('page'))
            caption = output / 'styles/caption-news/showcase/index.html'
            self.assertIn('showcase.mjs?v=portal-test', caption.read_text())
            self.assertFalse((output / '_projects').exists())
            self.assertFalse((output / 'productions').exists())
            self.assertFalse(list(output.rglob('combined-delivery-manifest.json')))
            for frame in json.loads((output / 'docs/readme/frames.json').read_text())['frames']:
                self.assertTrue((output / frame['image']).is_file())
                self.assertEqual(set(frame), {'style', 'image'})
            with self.assertRaises(FileExistsError):
                build_site(demo, output)

    def test_preview_download_verifies_checksum_and_approved_contents(self):
        import io
        import tarfile
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            assets = root / 'assets'; assets.mkdir()
            archive = assets / 'preview.tar.gz'
            with tarfile.open(archive, 'w:gz') as tar:
                entry = tarfile.TarInfo('media/film.mp4'); entry.size = 4
                tar.addfile(entry, io.BytesIO(b'film'))
            manifest = {'archive': {'name': archive.name, 'bytes': archive.stat().st_size,
                                    'sha256': sha(archive)}, 'files': ['media/film.mp4']}
            stage = fetch_showcase_bundle(manifest, root / 'verified', assets)
            self.assertEqual((stage / 'media/film.mp4').read_bytes(), b'film')
            manifest['archive']['sha256'] = '0' * 64
            with self.assertRaisesRegex(ValueError, 'checksum'):
                fetch_showcase_bundle(manifest, root / 'bad', assets)
            self.assertFalse((root / 'bad/media/film.mp4').exists())

    def test_local_availability_checks_entry_file_and_routes_portal_assets(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'catalog').mkdir()
            (root / 'index.html').write_text('portal')
            (root / 'catalog/studio.css').write_text('body{}')
            (root / 'project').mkdir()
            catalog = {'styles': [{'showcases': [{'id': 'film', 'access': 'local',
                                                  'project': 'project', 'source_page': 'watch.html'}]}]}
            self.assertFalse(catalog_availability(root, catalog)['pages']['film'])
            (root / 'project/watch.html').write_text('player')
            self.assertTrue(catalog_availability(root, catalog)['pages']['film'])
            self.assertEqual(resolve_resource('/', root, catalog), (root / 'index.html').resolve())
            self.assertEqual(resolve_resource('/catalog/studio.css', root, catalog), (root / 'catalog/studio.css').resolve())
            (root / 'private.txt').write_text('private')
            self.assertIsNone(resolve_resource('/catalog/../private.txt', root, catalog))
            self.assertIsNone(resolve_resource('/private.txt', root, catalog))


if __name__ == '__main__':
    unittest.main()
