#!/usr/bin/env python3
"""Preview the unified style catalog and retained local showcase media."""
import argparse
import importlib.util
import io
import json
from pathlib import Path
from http.server import ThreadingHTTPServer
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
# Reuse the existing, range-aware player server without changing the sample.
spec = importlib.util.spec_from_file_location(
    'whiteboard_media_server', ROOT / 'styles/whiteboard/studio/scripts/serve.py')
media_server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(media_server)


def local_pages(catalog):
    return {page['id']: page for style in catalog['styles']
            for page in style.get('showcases', []) if page['access'] == 'local'}


def resolve_resource(url, root, catalog):
    """Resolve only catalog routes, keeping project symlinks inside their project."""
    route = unquote(urlsplit(url).path)
    parts = route.strip('/').split('/')
    if any(part.startswith('.') for part in parts):
        return None
    if len(parts) >= 3 and parts[0] == '_projects':
        page = local_pages(catalog).get(parts[1])
        if page is None:
            return None
        boundary = (root / page['project']).resolve()
        relative = '/'.join(parts[2:])
        path = (boundary / relative).resolve()
        # Retained projects can reference a specific video outside their directory.
        # Only explicitly listed file aliases may cross the project boundary.
        if relative in page.get('linked_files', []) and path.is_file():
            return path
    elif (parts[0] in ('styles', 'methods', 'catalog')
          or route.startswith('/docs/readme/')
          or route in ('/', '/index.html', '/styles.json', '/README.md', '/README.zh-CN.md')):
        boundary = root.resolve()
        path = (boundary / ('index.html' if route == '/' else route.lstrip('/'))).resolve()
    else:
        return None
    return path if boundary in path.parents and path.is_file() else None


def catalog_availability(root, catalog):
    """Report real file availability without exposing local project paths."""
    pages = {}
    for style in catalog['styles']:
        for page in style.get('showcases', []):
            if page['access'] == 'local':
                pages[page['id']] = (root / page['project'] / page['source_page']).is_file()
            else:
                studio = root / 'styles/whiteboard/studio'
                pages[page['id']] = all((studio / path).is_file() for path in [
                    'media/does-ai-help-you-learn-3min.mp4',
                    'editions/long/media/does-ai-help-you-learn-long.mp4',
                ])
    return {'mode': 'local', 'pages': pages}


def handler_for(root=ROOT):
    class Handler(media_server.MediaHandler):
        def send_head(self):
            self.catalog = json.loads((root / 'styles.json').read_text())
            if urlsplit(self.path).path == '/catalog-availability.json':
                body = json.dumps(catalog_availability(root, self.catalog)).encode('utf-8')
                self.byte_count = None
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                return io.BytesIO(body)
            self.resource = resolve_resource(self.path, root, self.catalog)
            if self.resource is None:
                self.send_error(404, 'Page or retained project asset is unavailable')
                return None
            return super().send_head()

        def translate_path(self, path):
            return str(self.resource)

        def log_message(self, *args):
            pass
    return Handler


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8249)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), handler_for())
    print(f'Style catalog: http://127.0.0.1:{server.server_port}/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
