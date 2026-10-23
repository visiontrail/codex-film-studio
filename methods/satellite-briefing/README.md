# Satellite Briefing — reusable production method

真实卫星影像、连续地理镜头、细白标注和单个暖色读数组成的地理简报方法。
它可以用于旅行路线、设施分布、环境变化或空间尺度解释。选题、地点、文案、
实拍素材和证据必须由每次新制作重新提供。

This package extracts a reusable method from reference analysis and independent
production experience. It includes a style prompt, production and footage rules,
review criteria, geographic math helpers, and an empty external-project starter.
It does not include a previous film's narration, coordinates, source clips,
brand drawings, voice, rendered video or acceptance verdict.

## Start a new subject

From the repository root:

```sh
python3 methods/satellite-briefing/new_project.py my-film
# Or choose a new external directory:
python3 methods/satellite-briefing/new_project.py my-film --output /path/to/my-film
```

The default destination is `../codex-film-studio-projects/my-film`. Existing
directories and paths inside this library, including symlink routes, are
rejected. Open that project in Codex, fill its brief, and provide the new subject.
No application Task, provider job, download or render is created by this command.

This is an **authoring starter**, not a ready-made text-to-video engine. It has
no scene renderer or default story. Codex must author the imagery renderer,
overlay choreography, sound and delivery scripts for the new brief. Geographic
helpers and the library's frame-review tools are supplied to avoid rebuilding
those generic pieces. Python 3.10+ and Node.js 20+ suffice for creation and helper
tests; rendering and media inspection need their own documented dependencies.

## Read in this order

| File | Reusable responsibility |
| --- | --- |
| [prompt.txt](prompt.txt) | A short invocation for a new subject |
| [STYLE.md](starter/STYLE.md) | Camera, imagery, map, annotation, type and sound grammar |
| [WORKFLOW.md](starter/WORKFLOW.md) | Brief → evidence → audio → timing → render → repair → deliver |
| [FOOTAGE.md](starter/FOOTAGE.md) | Search, source verification, rights record, acquisition, PTS and compositing |
| [INPUTS.md](starter/INPUTS.md) | Empty input contracts and coordinate/time conventions |
| [REVIEW.md](starter/REVIEW.md) | Separate machine, thumbnail, native-frame, playback and audio evidence |
| `starter/lib/geo.mjs` | Spherical camera, projection, ground-ray scale, distance and log interpolation |
| [PROVENANCE.md](PROVENANCE.md) | Upstream inspiration, independent additions and scope |

The creator copies these guides and the generic `scripts/frame_review/` tools
into the external project. The English and Chinese repository READMEs link here;
this package is a method, not a released sample entry in `styles.json`.

## What carries forward

Carry forward the relationship between camera and coordinates, local map masks,
measured readouts, source-bound audio timing, controlled real-footage reveals,
and evidence-bound revision. Re-select plates, dates, place identities, claims,
voices and assets. A previous film's successful decode or review cannot accept a
new film. Known source seams become acquisition/reframing decisions, not an
automatic pass. The finished result is evaluated against the new user's brief.

## Package verification

```sh
python3 -m unittest discover -s methods/satellite-briefing/tests -v
node --test methods/satellite-briefing/starter/tests/geo.test.mjs
```

These checks cover safe creation, empty inputs and geographic invariants. They
do not certify a future film's appearance, soundtrack or similarity to a reference.
