# Singapore film — delivery review

Final English film: `media/final.mp4`, **1920 × 1080, 24 fps, 2,609 frames, 108.708333 seconds**, H.264 video and 48 kHz stereo AAC audio. File size: **194,300,549 bytes**.

SHA-256: `75a0dc70c35e71e04e250b6aeafd3cd4942afca01335a743a8dcfee35bda70cb`.

The film, subtitles, editable source, retained media and review material are together in this independent production folder. It was built with a newly written geographic renderer and local scripts; no FrontierTechSN Task was created. Every FFmpeg invocation used the shared encoder gate and waited for existing FFmpeg processes.

## Frame evidence

The reference is LemoLab's *The Map Still Says Sea*, `satellite-briefing.mp4`, SHA-256 `fd24907bfb8fe5b7366274ac2fb358294a9fc5c602b44d5aa48de1ae7c8eb617`. It contains 907 frames, at the same resolution and frame rate, lasting 37.791667 seconds.

- Reference: all 907 frames were included in 19 atlases that were actually opened and inspected in frame order; 34 additional native-resolution frames were inspected.
- Final: all 2,609 encoded frames were decoded, measured, and mapped to reference frames by corresponding visual operation. The review package contains 55 atlases, 39 representative side-by-side pairs, and a CSV row for every final frame.
- Automated checks found no black frames, no exact consecutive duplicate frames, no nonmonotonic presentation timestamps, no visible text outside the frame, and no Han-script labels. The adjacent camera state is exactly continuous at all 12 scene boundaries.
- Visual review records cover **0–863, 864–1727 and 1728–2608**, with no gap or overlap: all 2,609 thumbnails and all 39 representative pairs. The opening reviewer reopened all 18 current-version atlases, 13 pairs and eight native final frames. The middle reviewer inspected 18 atlases, 12 pairs and 12 native final frames, then verified all 42 review assets byte-identical in the final revision. The ending reviewer reopened all 19 current-version atlases and 12 pairs; the primary agent completed the last two pairs and independently checked native frame 2417. The consolidated record is `review/final-acceptance.json`.

Atlas inspection means every frame was seen at thumbnail scale; it does **not** mean every frame was inspected at native 1920 × 1080. Representative JPEG pairs are 3840 × 1150 files, but some viewing tools reduce them on display. The individual review records distinguish those cases. Extracting an image, measuring it, or comparing its hash was never counted as a new visual inspection.

Open `review/comparison.html` through the local server for the paired frame scrubber. The browser test jumped to final F114 / reference F79 and reported their actual submitted frame timestamps. Mapping follows the same type of shot or graphic action; it is not a claim that different subjects should have matching pixels. Per-frame metrics describe luminance, chroma, edges and motion, without an invented aggregate similarity percentage.

## Repairs incorporated in this version

| Observed issue | Final correction |
|---|---|
| A full-screen paper map lost the reference's local map-on-photography relationship | Paper is clipped to the actual Singapore main-island polygon; photography remains visible outside it and a soft scan reveals the ground beneath |
| The arrival panel used an itinerary priority number rather than a geographic measurement | A projected Changi–Marina Bay range line and amber counter grow together to 18 km; the explicit label is “Straight-line distance” |
| The high-resolution island appeared as a pasted rectangle at intermediate altitude | Regional, metropolitan and city imagery now blend by camera distance; the metropolitan layer's transition was adjusted after reviewing the encoded descent |
| Orbital ground was too dark and lacked the blue atmospheric limb | Added a soft atmospheric rim and a restrained orbital exposure/gamma adjustment |
| Camera transitions and the final climb could jump | Each scene starts from the preceding rendered frame's actual camera; all 12 boundaries pass the exact continuity check |
| Footage reveal could expose a black rectangle before imagery | The background and imagery now share the same reveal clip; brackets, leaders and titles follow the reveal alpha |
| Cards, flags and the ending frame disappeared or appeared abruptly | Applied parent fades, delayed flag entry and continuous reticle-to-title-frame expansion |
| The transit marker wrapped to its starting point | Replaced the loop with one smooth forward movement |
| Font fallback and subtitle sizing weakened the reference hierarchy | Preloaded the required fonts and ASCII glyphs; retained a large condensed amber readout, thin leaders and a measured lower-left English subtitle band |
| Earlier speech and subtitles were Chinese | Regenerated all 12 narration lines in English and rebuilt 27 English captions from the final source and word timings |

The 18 km display is rounded from a haversine distance of **17.504207992 km**, using Changi `[1.3644, 103.9915]`, Merlion `[1.2868, 103.8545]` and Earth radius 6371.0088 km. It is not a road, walking or rail distance. Other route strokes express visit order, not navigation geometry.

## English audio and captions

The final film uses 12 English Chatterbox Multilingual V2 takes with the official `space-en-f1` reference, 229 words and 78.44 seconds of retained speech files. They play at natural speed. Source text, WAV hashes, durations and independent ASR records were checked before timeline construction. The final 27 caption chunks concatenate exactly to the source narration; 15 internal cue boundaries use matched word starts rather than character-proportional timing. The shortest cue is 1.833 seconds; maximum reading rate is approximately 19.26 characters per second.

The mix is 48 kHz stereo, measured at approximately **−17.10 LUFS**, with sample peak 0.84. Its SHA-256 is `9c5246fa58d06b265b65db7b538bf8f7841c1032ac1221796ffebc559900ae9d`. The music and effects are original procedural synthesis; the source videos' audio is not used.

Two unprompted ASR models checked both the individual takes and the complete final mix. All 12 phrase groups remain recoverable, with no confirmed mix-induced omission. Proper-name spelling differences and the L09 Give/Get disagreement remain documented. **This is transcription and waveform evidence, not a claim of subjective listening or perfect phoneme accuracy.** See `AUDIO-REVIEW.md` and `review/mix-asr/summary.md`.

## Actual playback and sources

The final MP4 was loaded afresh in the Codex in-app browser and played from time 0 to **108.708333**, with `ended=true`, `readyState=4`, and decoded video dimensions 1920 × 1080. Seeking to 5.601961 seconds produced the expected local paper-map image and returned to `readyState=4`. The end-state screenshot is `review/playback-ended.png`; the paired-browser screenshot is `review/comparison-browser.png`.

Two real YouTube sources supply Jewel's Rain Vortex and Supertree Grove. Their identities, licence assertions and modifications are retained in `sources-footage.md`. Satellite photography is explicitly historical NASA/EOX imagery, including modified Copernicus Sentinel data **2016**, rather than a claim about current construction or conditions. Geography and travel advice were checked against the official sources in `sources-travel.md`. Exact prices, schedules and entry requirements are not asserted in the film.

The Singapore flag retains its crescent and five stars. The Universal globe wordmark is a recognisable monochrome redraw within the map graphic. No public figure appears in this itinerary. All final narration, captions and authored on-screen labels are English.

## Assessment and limits

Confidence is high in the encoded format, English source/caption coverage, geographic placement, retained-source provenance and the documented frame checks. The final visual vocabulary follows the reference's orbital descent, local printed map, scanning reveal, grey analysis imagery, white geographic annotations, amber measurement, local colour restoration and moving-Earth closing title.

The new city, three-day itinerary, longer duration, English single-line captions and requested live-footage windows create visible differences. The Singapore source mosaic also retains some source-image tonal boundaries. No defensible measurement establishes literal “100% identical style/effect”; this review records the similarities, differences, repairs and inspection scope instead. Audio naturalness remains less certain than the technical checks because no subjective listening acceptance is claimed.

Generated media, reference frames, detailed review records and dependencies remain local and are excluded from Git. Source, content, credits and these audit summaries are versioned; prior candidates are retained under `media/iterations/` and `review/iterations/`.
