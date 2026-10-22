# Reference review and revision evidence

The reference film is LemoLab's *The Map Still Says Sea* (`satellite-briefing.mp4`), obtained from the [films release](https://github.com/lemomo-ai/lemo-opuscar/releases/download/films/satellite-briefing.mp4). Its SHA-256 is `fd24907bfb8fe5b7366274ac2fb358294a9fc5c602b44d5aa48de1ae7c8eb617`.

macOS AVFoundation `AVAssetReader` decoded **907 of 907 frames**, at 1920 × 1080 and 24 fps, with continuous frame indices 0–906 and monotonic presentation timestamps 0–37.75 seconds. The encoded duration is 37.791667 seconds. This subtask did not invoke ffmpeg. Per-frame brightness, saturation, edge and adjacent-frame change measurements are in `review/reference/frame_metrics.csv`.

**All 19 numbered atlases were actually opened and visually inspected**, covering every reference frame exactly once at thumbnail scale. All **34 listed keyframe JPEGs** were additionally opened and inspected at 1920 × 1080. The exact coverage, decoder, timestamps, file list and observations are recorded in `review/reference/visual-review.json`; `review/reference/manifest.json` points to that record. Atlas generation is separate from this actual inspection. No audio-listening claim is made by this review.

The repeated visual rules are real photographic ground under one georeferenced perspective camera, continuous orbit-to-ground motion, a soft blue atmospheric limb, restrained grey analysis imagery, hairline white measurements, one amber readout on the right, bottom-left bilingual subtitles, and a moving Earth behind the serif closing title. Full timing, typography and camera specifications are in `review/reference/style-analysis.md`.

## Defects found in the Singapore work and corrections

| Observed defect | Concrete correction | Review state |
|---|---|---|
| High-resolution Singapore rectangle visibly pasted onto blurred NASA ground at intermediate altitude | Added real EOX 2016 metropolitan plate (102–105° E, 0–3° N, 4096²) and scale-dependent world/region/metro/city blending | New f144 inspected: rectangular high-detail sticker removed |
| No atmospheric rim and overly dark orbital land | Added soft blue limb and modest orbital exposure/gamma adjustment | New f0/f18/f48 inspected: rim visible, terrestrial texture readable; ocean remains dark |
| Persistent extra corner HUD and undersized targeting frame | Removed fixed title/timecode; moved coordinates near target and enlarged lock brackets | New f0/f18/f48 inspected: reference hierarchy restored |
| Typography and line weight differed | Chinese/English subtitles 38/33 px; readout 112 px; narrower halo; font loading repaired | Revised stills inspected: fine leaders and subtitle/readout hierarchy closer to reference |
| Readout underline and subtitle backing looked like broad panels | Parent applied 260 px underline and measured transcript-width backing | Applied by parent; final-film review is separate |
| Grey water too bright and blue | Parent applied low-luminance toe adjustment without broadly dimming land | Applied by parent; final-film review is separate |
| Image credit incorrectly included 2017 | Confirmed the fetched `s2cloudless` WMS layer explicitly states Copernicus Sentinel data **2016** | Source snapshot retained; parent corrected CREDITS and on-screen year |

The reference itself has a minor port-label/credit overlap near frame 562; this defect should not be reproduced. The Singapore film adds geographically linked real-footage windows to meet the travel brief. Those windows and the longer travel narrative are intentional content adaptations, so this review does not claim pixel identity or numerical “100% style similarity.” It records observable matches, differences and repairs. Final-frame inspection is recorded separately after the completed encode exists.

## English adaptation and middle-frame encoded review

The final requested language is English. The renderer uses one 40 px English subtitle row in place of the reference bilingual 38/33 px pair; the 112 px condensed amber readout is retained. Five English source stills were inspected at native resolution before encoding. The first English encode was then inspected across every frame 864–1727 (18 atlases), plus 12 native 1920 × 1080 representative frames and their editorial reference pairs. The earlier transit marker wrap was identified from the prior candidate and is fixed in that English encode. `review/final-visual-reference.json` records the exact candidate SHA, coverage, observations and asset hashes. The final opening/arrival revision was rebound to SHA `75a0dc70c35e71e04e250b6aeafd3cd4942afca01335a743a8dcfee35bda70cb` only after all 18 middle atlases, 12 native frame JPEGs and 12 reference-pair JPEGs were verified byte-identical to the visually inspected English predecessor.

## Final opening and measurement revision

The full-screen paper map was replaced by a geographically clipped Singapore main-island paper overlay, with the photographed terrain remaining visible outside the island. This restores the reference's local map-on-photography relationship. The preview was inspected at native resolution. The arrival panel now shows **18 km**, with the line joining Changi and the Merlion directly and the explicit label “Straight-line distance.” An independent haversine check of the authored coordinates gives **17.504207992 km** using radius 6371.0088 km. It does not imply a driving, rail or walking distance. The rendered arrival preview was inspected for the measurement line, readout, labels and footage-window spacing.
