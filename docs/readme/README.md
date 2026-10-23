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

The cover layout and copy are original. The thumbnail images now come from
this project's generated films, as requested; no reference-film frames are used.

## Frame sources

All six images were decoded from the existing MP4s. Each 1920×1080 frame was
resized as a complete composition to 1440×810. The English and Chinese preview
cards add their own labels below that picture; the source image itself retains
its original text. Both covers use these same six frames in registry order.

| Style | Generated film | Selected time |
| --- | --- | --- |
| Whiteboard Explainer | Does AI Help You Learn—or Just Finish? | 01:45 |
| Art Collage | Does AI Help You Learn—or Just Finish? · V11 | 00:06 |
| Crayon Picture Book | Leo the Farmer · V11 | 01:06 |
| Mid-century Cartoon | Does AI Help You Learn—or Just Finish? | 00:13 |
| Satellite Briefing | Singapore · Three Days, Three Routes | 00:06 |
| Sci-Fi Sitcom Toon | The House Gets Coffee · Pocket V9 | 00:20 |

[frames.json](frames.json) records each source filename, video SHA-256, exact
frame/time, native dimensions and retained image SHA-256. Source movies and
production files remain in their independent local projects. Showing a frame
does not imply that the complete film is published or alter the reusable
package's completion status.

Credits retained from the production records:

- Original generated artwork and compositions: LeoGuoLabs / Codex Film Studio.
  The whiteboard sample and its frames use [CC BY 4.0](../../MEDIA-LICENSE.md).
- Art Collage V11 uses the production's newly generated fictional character and
  original paper composition. Its ChatGPT mark identifies the story's subject.
- Crayon artwork is an independently drawn, unofficial adaptation of **Leo the
  Farmer**, credited in its production to **Play with Gyuri / Gyuri and Friends**.
  Character and story attribution is retained; no official episode frame is used.
- The Singapore frame contains NASA Blue Marble / NASA GIBS imagery and
  EOxCloudless 2016 by EOX IT Services GmbH, containing modified Copernicus
  Sentinel data 2016, CC BY 4.0. Grading, map treatment and annotations are
  production modifications. This selected frame contains no footage insert.
- Mid-century, crayon, satellite and sci-fi visual grammar was studied from
  LemoLab's [lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar), by
  [@lemomo_ai](https://x.com/lemomo_ai). These are the new productions' frames.

Code, documentation and layout use MIT. The screenshots retain the source
materials' credits above; this does not relicense third-party marks, characters
or imagery. Font files are not included in these rendered images.

## Maintenance

Set `preview`, `preview_zh`, `preview_kind` and `description_zh` in `styles.json`.
An actual generated film screenshot uses `frame`, whether the full film is
published or retained locally. A style without a preview remains listed.

The repository retains the six decoded source JPEGs in `frames/`, so rebuilding
the image layouts needs no original MP4, private project or service credential.
Install Pillow in your Python environment, then run from the repository root:

```sh
python3 scripts/build_readme_artwork.py
python3 scripts/update_style_index.py
python3 scripts/update_style_index.py --check
```

The artwork builder discovers common local Latin and CJK fonts; alternatively
provide `--latin-font /path/body.ttf --display-font /path/display.ttf
--cjk-font /path/chinese.ttf`. Fonts affect text metrics, so inspect regenerated
images. The current cover has six slots; adding more styles requires extending
that layout. English and Chinese covers are PNGs, with the Chinese title and
labels rendered directly into the image. Preview labels are likewise separate
English and Chinese image files.

The index command regenerates the marked atlas and summary blocks in both root
READMEs and the detailed `styles/README.md`. Edit surrounding prose normally.
New styles must meet [the contribution requirements](../../CONTRIBUTING.md).
