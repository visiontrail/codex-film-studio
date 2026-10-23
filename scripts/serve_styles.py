#!/usr/bin/env python3
"""Preview the unified style catalog and retained local showcase media."""
import argparse
from html import escape
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
    elif parts[0] in ('styles', 'methods') or route in ('/styles.json', '/README.md', '/README.zh-CN.md'):
        boundary = root.resolve()
        path = (boundary / route.lstrip('/')).resolve()
    else:
        return None
    return path if boundary in path.parents and path.is_file() else None


def catalog_html(root, catalog):
    rows = []
    for style in catalog['styles']:
        pages = []
        for page in style.get('showcases', []):
            available = page['access'] != 'local' or (root / page['project']).is_dir()
            label = '' if available else ' <small>（原项目未在本机找到）</small>'
            pages.append(f'<a href="/{escape(page["page"], quote=True)}">{escape(page["title"])}</a>{label}')
        guide = style.get('readme', style['guide'])
        rows.append(f'<tr><td><strong>{escape(style["name_zh"])}</strong><br><code>{escape(style["id"])}</code></td>'
                    f'<td>{escape(catalog["statuses"][style["status"]]["name_zh"])}<br>'
                    f'<small>{escape(style["status_note_zh"])}</small></td>'
                    f'<td>{"<br>".join(pages) or "暂无展示网页"}<br>'
                    f'<a href="/{escape(guide, quote=True)}">使用说明</a></td></tr>')
    return ('''<!doctype html><html lang="zh-CN"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Codex Film Studio · 风格目录</title>
<style>body{max-width:1200px;margin:48px auto;padding:0 24px;font:16px/1.6 system-ui;background:#f6f3ed;color:#252b2b}h1{font-size:32px;margin-bottom:8px}table{border-collapse:collapse;width:100%;margin:28px 0}th,td{text-align:left;vertical-align:top;padding:18px 14px;border-bottom:1px solid #ccc8bc}th{font-size:14px}td:first-child{width:23%}td:nth-child(2){width:43%}small{color:#626a69}a{color:#12685e;text-underline-offset:3px}code{font-size:13px}pre{overflow:auto;background:#e9e5db;padding:16px} @media(max-width:700px){body{margin:24px auto;padding:0 12px}th,td{padding:12px 6px;font-size:14px}}</style>
<h1>Codex Film Studio</h1><p>统一风格目录 · 完成状态 · 已有影片网页</p>
<table><thead><tr><th>风格</th><th>可复用内容的完成状态</th><th>网页与说明</th></tr></thead><tbody>'''
            + ''.join(rows) + '''</tbody></table>
<pre>python3 scripts/new_film.py my-film --style &lt;id&gt;</pre>
<p>本地网页读取保留项目中的影片与审阅素材。新克隆需要另行提供这些项目；白板样片按 Release 下载说明准备。</p>
<p><a href="/styles/README.md">完整目录说明</a> · <a href="/methods/README.md">通用制作方法</a> · <a href="/styles.json">索引数据</a></p></html>''').encode('utf-8')


def handler_for(root=ROOT):
    class Handler(media_server.MediaHandler):
        def send_head(self):
            self.catalog = json.loads((root / 'styles.json').read_text())
            if urlsplit(self.path).path == '/':
                body = catalog_html(root, self.catalog)
                self.byte_count = None
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
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
