#!/usr/bin/env python3
"""Sync the style catalog and bilingual README galleries; --check detects drift."""
import argparse
from html import escape
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def render_summary(catalog, language):
    entries = catalog['styles']
    counts = {status: sum(e['status'] == status for e in entries)
              for status in catalog['statuses']}
    if language == 'zh':
        return (f"**{len(entries)} 种风格** · {counts['demo-ready']} 种已发布样片 · "
                f"{counts['starter-ready']} 种创作起步包 · {counts['toolkit-ready']} 种材质工具包")
    return (f"**{len(entries)} styles** · {counts['demo-ready']} published sample · "
            f"{counts['starter-ready']} authoring starters · {counts['toolkit-ready']} material toolkit")


def render_gallery(catalog, language='en', prefix=''):
    """GitHub-safe HTML: images and links work without CSS or JavaScript."""
    zh = language == 'zh'
    lines = ['<table>']
    for number, entry in enumerate(catalog['styles'], 1):
        name = entry['name_zh'] if zh else entry['name']
        other_name = entry['name'] if zh else entry['name_zh']
        description = entry.get('description_zh', entry['description']) if zh else entry['description']
        state = catalog['statuses'][entry['status']]['name_zh' if zh else 'name']
        guide = escape(prefix + entry['guide'], quote=True)
        preview = entry.get('preview', entry.get('poster'))
        if preview:
            kind = entry.get('preview_kind', 'schematic')
            label = ('风格示意' if zh else 'style sketch') if kind == 'schematic' else ('样片剧照' if zh else 'film frame')
            visual = (f'<a href="{guide}"><img src="{escape(prefix + preview, quote=True)}" '
                      f'alt="{escape(name)} — {label}" width="320"></a>')
        else:
            visual = '预览待补充' if zh else 'Preview to come'
        actions = [
            (entry['guide'], '风格说明' if zh else 'Style guide'),
            (entry['prompt'], '提示词' if zh else 'Prompt'),
            (entry['template'], '创作工程' if zh else 'Project files'),
        ]
        links = ' · '.join(f'<a href="{escape(prefix + path, quote=True)}">{label}</a>' for path, label in actions)
        local_pages = [p for p in entry.get('showcases', []) if p['access'] == 'local']
        if entry['capabilities']['published_demo']:
            availability = '<a href="https://visiontrail.github.io/codex-film-studio/">' + ('▶ 在线播放' if zh else '▶ Watch online') + '</a>'
        elif local_pages:
            availability = '<a href="' + escape(prefix + 'docs/pages.md#local-style-catalog', quote=True) + '">' + ('本地影片与审阅页' if zh else 'Local films & review pages') + '</a>'
        else:
            availability = '尚无样片' if zh else 'No sample yet'
        lines += [
            '<tr>',
            f'<td width="38%" valign="middle">{visual}</td>',
            '<td width="62%" valign="top">',
            f'<sub>{number:02d} / <code>{escape(entry["id"])}</code></sub>',
            f'<h3>{escape(name)}</h3>',
            f'<sub>{escape(other_name)}</sub>',
            f'<p>{escape(description)}</p>',
            f'<p><b>{escape(state)}</b> · {availability}</p>',
            f'<sub>{links}</sub>',
            '</td>', '</tr>',
        ]
    lines += ['</table>']
    return '\n'.join(lines)


def replace_block(document, name, content):
    start, end = f'<!-- {name}:start -->', f'<!-- {name}:end -->'
    if document.count(start) != 1 or document.count(end) != 1:
        raise ValueError(f'Expected exactly one {name} block')
    before, remainder = document.split(start)
    _, after = remainder.split(end)
    return f'{before}{start}\n\n{content}\n\n{end}{after}'


def render(catalog):
    lines = [
        '# Film styles · 统一风格目录', '',
        'All visual styles live here. `styles.json` is the source of truth for paths,',
        'package completion and showcase availability. Shared workflows live in `methods/`.', '',
        '所有风格统一放在 `styles/<id>/`。完成状态描述仓库中的可复用内容；',
        '已有本地影片网页、公开样片与新影片验收分别记录。', '',
        render_summary(catalog, 'en'), '',
        '## Visual index / 风格一览', '',
        'Whiteboard uses a released film frame. Other previews are original schematic',
        'style sketches, not frames from completed films. 白板使用已发布剧照；其余为通用风格示意。', '',
        render_gallery(catalog, prefix='../'), '',
        '## Capabilities / 能力与网页', '',
        '| Style / 风格 | Package / 完成状态 | Renderer / 场景渲染工程 | Showcase / 网页 |',
        '| --- | --- | --- | --- |',
    ]
    for entry in catalog['styles']:
        relative = entry.get('readme', entry['guide']).removeprefix('styles/')
        state = catalog['statuses'][entry['status']]
        pages = ' · '.join(f"[{p['title']}]({p['page'].removeprefix('styles/')})" for p in entry.get('showcases', [])) or '—'
        renderer = 'Included / 已有' if entry['capabilities']['scene_renderer'] else 'Author per project / 需按选题编写'
        lines.append(f"| [{entry['name_zh']} / {entry['name']}]({relative}) | {state['name_zh']} (`{entry['status']}`) | {renderer} | {pages} |")
    lines += ['', '## What is complete / 已完成什么', '']
    for entry in catalog['styles']:
        lines.append(f"- **{entry['id']}** — {entry['status_note_zh']} {entry['status_note']}")
    lines += ['',
        '`demo-ready` includes a released sample and editable renderer. `starter-ready`',
        'provides blank authoring inputs, guides and helpers. `toolkit-ready` provides',
        'material tools and an input contract. All three support the same creation command;',
        'none describes the acceptance of a new production.', '',
        '## Use any style / 统一使用方式', '', '```sh',
        'python3 scripts/new_film.py --list',
        'python3 scripts/new_film.py my-film --style <id>',
        'python3 scripts/new_film.py my-film --style <id> --output /absolute/external/path',
        '```', '',
        'Commands run from the repository root. Open the resulting project in Codex',
        'and supply the topic, audience, language and duration. Existing output directories',
        'are preserved. New productions belong outside this library.', '',
        '## Open existing pages / 打开已有网页', '', '```sh',
        'python3 scripts/serve_styles.py --port 8249', '```', '',
        'Open http://127.0.0.1:8249/ for the catalog and its showcase links.',
        'The HTML entrypoints are in each style package. Local showcases read media,',
        'fonts and review data from the retained projects listed in `styles.json`.',
        'A fresh clone without those projects shows their missing-resource status.',
        'Whiteboard uses its existing Release download workflow. Local pages are not',
        'automatically published or copied into new-film starters.', '',
        '## Previous paths / 旧路径', '',
        'The five former `methods/<style>/` packages moved to `styles/<style>/`.',
        'Use `scripts/new_film.py --style <id>` for all of them. `--method <id>` remains',
        'a deprecated command-line alias. Existing external projects are independent',
        'copies and retain their original files. Shared methods now live in [methods/](../methods/README.md).', '',
        '<!-- Generated by scripts/update_style_index.py; edit styles.json for catalog entries. -->', '',
    ]
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    catalog = json.loads((ROOT / 'styles.json').read_text())
    outputs = {ROOT / 'styles/README.md': render(catalog)}
    for filename, language in [('README.md', 'en'), ('README.zh-CN.md', 'zh')]:
        target = ROOT / filename
        expected = replace_block(target.read_text(encoding='utf-8'), 'style-summary', render_summary(catalog, language))
        outputs[target] = replace_block(expected, 'style-atlas', render_gallery(catalog, language))
    stale = []
    for target, expected in outputs.items():
        if args.check:
            if not target.is_file() or target.read_text(encoding='utf-8') != expected:
                stale.append(str(target.relative_to(ROOT)))
        else:
            target.write_text(expected, encoding='utf-8')
            print(f'Updated {target.relative_to(ROOT)}')
    if stale:
        raise SystemExit(f'Style documentation is stale ({", ".join(stale)}). Run python3 scripts/update_style_index.py')
    if args.check:
        print('Style catalog and both README galleries match styles.json.')


if __name__ == '__main__':
    main()
