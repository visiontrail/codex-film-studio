# Add or improve a film style

Every visual style belongs in `styles/<id>/`, regardless of completion status.
Register it in `styles.json`; this is the single catalog used by the project
creator, readable index and local showcase server. `methods/` is reserved for
workflows shared by multiple styles. Style-specific drawing and sound rules stay
with the style, including when they are described as a production method.

Both root READMEs also present every registered style in a visual atlas generated
from this catalog. Keep their summary and atlas blocks in sync with the readable index.

## Package structure

Provide `STYLE.md`, `README.md`, `prompt.txt` and a subject-empty `starter/` with
input contracts and reusable tools. Retain provenance and required licenses.
Existing sample-based `studio/` packages remain supported. A starter must work
without the author's old project, private service or absolute machine paths.
Document dependencies and recorded-audio alternatives for narration.

Set `guide`, `readme` where present, `prompt`, `template`, `template_kind`,
`status`, bilingual status notes and `capabilities` in `styles.json`.
Add `description_zh` for the Chinese atlas, plus `preview` and `preview_zh` for
the localized image paths. Set `preview_kind` to `frame` for a screenshot from
an actual generated film; this is independent of full-film publication. Record
the source file, exact frame/time and hashes in `docs/readme/frames.json`.
Only add production screenshots when requested by the user, with their source
credits. Missing previews remain listed with a placeholder. A generic style
sketch uses `schematic` and must be labelled accordingly. See
[README artwork notes](docs/readme/README.md).

| Status | Required meaning |
| --- | --- |
| `toolkit-ready` | Material tools and empty inputs; scene/audio/render pipelines still need authoring |
| `starter-ready` | Blank authoring project, usable workflow/review guides and reusable helpers; new scenes and renderer are still required |
| `demo-ready` | Editable renderer and a real published sample with documented, reproducible inputs |

A published demo is optional for catalog registration. Mark `scene_renderer` and
`published_demo` accurately. Check a clean checkout, short render and actual
public download links before claiming `demo-ready`; keep large published media
in Releases with hashes. Local showcase availability is a separate property.

## Existing showcase pages

Put retained HTML entrypoints in `styles/<id>/showcase/` and register each in
`showcases`. Existing whiteboard pages keep their `studio/` paths. For a local
page, record its retained `project` and `source_page`; use the catalog preview
server for project assets. Preserve original project files and sample identities.
Do not bundle local movies, provider jobs or private configuration into Git.
A local page does not grant publication or imply that its film passed new review.

## Shared methods and new productions

Return reusable rules, tools and blank inputs to the library. Keep a new film's
narration, claims, cast, portraits, brand assets, story-specific scene code and
review evidence in its external project. Existing demos and explicitly retained
showcase pages are legacy examples; preserve their sources and licenses.

## Validate

Run `python3 scripts/update_style_index.py` after changing the catalog to update
the detailed index and both README atlases. Check:

```sh
python3 scripts/update_style_index.py --check
python3 -B -m unittest discover -s scripts -p 'test_*.py'
```

Run each affected style's helper tests. Exercise project creation in a temporary
external directory, including preservation of an existing destination. For page
changes, check required resources, byte-range video seeking and browser playback.
Keep technical checks, visual review and listening claims separate. Publishing
a repository, Release or film requires the user's request.
