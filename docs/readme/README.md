# README artwork and layout

The README is designed as a film-style field guide: an editorial cover, a
numbered image-and-text atlas, a screening room and a three-step authoring path.
Detailed replay and deployment instructions live in native Markdown disclosure
blocks. The layout uses GitHub-supported HTML tables, links and images; it needs
no custom CSS, JavaScript, remote fonts or badge service.

## Reference study

These project READMEs were reviewed for information architecture:

| Reference | Principle studied |
| --- | --- |
| [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar) | Make the complete style collection discoverable visually |
| [Motion Canvas](https://github.com/motion-canvas/motion-canvas) | Separate first use from library development |
| [Excalidraw](https://github.com/excalidraw/excalidraw) | Express the product visually and keep primary navigation direct |
| [D2](https://github.com/d2lang/d2) | Put concrete examples near the introduction and layer detailed documentation |
| [Manim](https://github.com/3b1b/manim) | Connect a minimal working command to examples and deeper usage |

The cover, illustrations, copy and composition here are original. No reference
project's logo, screenshot, illustration or README markup was copied.

## Artwork

`cover.svg` and the five style sketches are subject-independent documentation
assets under the repository's MIT license. They illustrate materials, line,
layering and composition with generic shapes. They are not demo frames, actual
satellite imagery, measurement evidence or claims of a completed production.
The whiteboard image remains the existing released sample poster under
[CC BY 4.0](../../MEDIA-LICENSE.md).

## Maintenance

Set `preview`, `preview_kind` (`frame` or `schematic`) and `description_zh` in
`styles.json`. A style without a preview remains listed with a placeholder label.
Run from the repository root:

```sh
python3 scripts/update_style_index.py
python3 scripts/update_style_index.py --check
```

This regenerates the marked atlas and summary blocks in both root READMEs and
the detailed `styles/README.md`. Edit surrounding prose normally. New styles
must also meet [the contribution requirements](../../CONTRIBUTING.md).
