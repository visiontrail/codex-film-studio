#!/usr/bin/env python3
"""Build bilingual README artwork from the retained, decoded film frames.

Requires Pillow and Latin/CJK fonts. Source films are not needed for this step;
the full-frame JPEGs and their source identities live in docs/readme/frames.json.
"""
import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'docs/readme'
PAPER, INK, MUTED, GOLD = '#f5f0e4', '#202a28', '#a7b0a5', '#dba16a'


def find_font(explicit, candidates):
    for candidate in ([explicit] if explicit else candidates):
        if candidate and Path(candidate).is_file():
            return str(candidate)
    raise SystemExit('Font unavailable; supply --latin-font, --display-font and --cjk-font paths.')


def fit_font(draw, text, path, size, width):
    while size > 12:
        font = ImageFont.truetype(path, size)
        if draw.textlength(text, font=font) <= width:
            return font
        size -= 1
    return font


def preview(source, entry, ordinal, language, fonts):
    image = Image.new('RGB', (1440, 910), PAPER)
    image.paste(source, (0, 0))
    draw = ImageDraw.Draw(image)
    draw.line((0, 811, 1440, 811), fill=GOLD, width=3)
    draw.text((28, 837), f'{ordinal:02d} /', font=ImageFont.truetype(fonts['latin'], 35), fill='#77756a')
    name = entry['name_zh'] if language == 'zh' else entry['name']
    font = fit_font(draw, name, fonts['cjk'] if language == 'zh' else fonts['latin'], 40, 1080)
    draw.text((138, 832), name, font=font, fill=INK)
    label = '影片截图' if language == 'zh' else 'FILM STILL'
    draw.text((1398, 849), label, font=ImageFont.truetype(fonts['cjk'] if language == 'zh' else fonts['latin'], 22), fill='#77756a', anchor='ra')
    return image


def cover(sources, language, fonts):
    image = Image.new('RGB', (1440, 450), INK)
    draw = ImageDraw.Draw(image)
    zh = language == 'zh'
    small = ImageFont.truetype(fonts['cjk'] if zh else fonts['latin'], 18)
    draw.line((52, 58, 1388, 58), fill='#53605a')
    draw.text((54, 22), 'CODEX FILM STUDIO', font=ImageFont.truetype(fonts['latin'], 17), fill='#c3ccc0')
    draw.text((1388, 22), '影片风格手册' if zh else 'THE STYLE LIBRARY', font=small, fill='#c3ccc0', anchor='ra')
    draw.text((54, 94), '用代码，赋予故事画面语言' if zh else 'A FIELD GUIDE TO FILMS MADE WITH CODE', font=small, fill=GOLD)
    display = ImageFont.truetype(fonts['cjk'] if zh else fonts['display'], 87 if zh else 94)
    for y, text in [(143, '让故事' if zh else 'Stories'), (244, '成为画面。' if zh else 'take shape.')]:
        draw.text((48, y), text, font=display, fill=PAPER)
    draw.line((56, 362, 116, 362), fill=GOLD, width=4)
    draw.text((135, 349), '绘画 / 导演 / 制作' if zh else 'DRAW / DIRECT / BUILD', font=small, fill='#c3ccc0')
    draw.rectangle((780, 94, 1388, 375), fill='#141c1a')
    for x in range(790, 1370, 32):
        for y in (106, 355):
            draw.rectangle((x, y, x+16, y+8), fill=MUTED)
    # Registry order is shared with the atlas. Preserve the entire source frame.
    for index, source in enumerate(sources):
        x, y = 790 + (index % 3)*198, 126 + (index // 3)*112
        thumbnail = source.resize((190, 107), Image.Resampling.LANCZOS)
        image.paste(thumbnail, (x, y))
    draw.line((52, 402, 1388, 402), fill='#53605a')
    draw.text((54, 414), '一个故事，多种画面语言' if zh else 'ONE STORY / MANY VISUAL LANGUAGES', font=small, fill=MUTED)
    draw.text((1388, 416), 'LEOGUOLABS', font=ImageFont.truetype(fonts['latin'], 16), fill=MUTED, anchor='ra')
    return image


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--latin-font', type=Path)
    parser.add_argument('--display-font', type=Path)
    parser.add_argument('--cjk-font', type=Path)
    args = parser.parse_args()
    fonts = {
        'latin': find_font(args.latin_font, [ROOT/'productions/ai-learning-midcentury/assets/fonts/Jost.ttf', '/System/Library/Fonts/Supplemental/Arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']),
        'display': find_font(args.display_font, ['/System/Library/Fonts/Supplemental/Georgia.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf']),
        'cjk': find_font(args.cjk_font, ['/System/Library/Fonts/Supplemental/Songti.ttc', '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc', 'C:/Windows/Fonts/msyh.ttc']),
    }
    catalog = json.loads((ROOT/'styles.json').read_text())['styles']
    if len(catalog) > 6:
        raise ValueError('Cover currently has six slots; update its layout before adding more styles.')
    records = {item['style']: item for item in json.loads((ART/'frames.json').read_text())['frames']}
    sources = []
    for ordinal, entry in enumerate(catalog, 1):
        record = records[entry['id']]
        with Image.open(ROOT/record['image']) as decoded:
            source = decoded.convert('RGB')
        if source.size != (1440, 810):
            raise ValueError(f"Unexpected source frame dimensions: {entry['id']}")
        sources.append(source)
        (ART/'previews').mkdir(exist_ok=True)
        for language in ('en', 'zh'):
            preview(source, entry, ordinal, language, fonts).save(ART/f'previews/{entry["id"]}.{language}.jpg', quality=94, subsampling=0)
    for language in ('en', 'zh'):
        cover(sources, language, fonts).save(ART/f'cover-{language}.png', optimize=True)
    print('Updated bilingual covers and film-frame previews.')


if __name__ == '__main__':
    main()
