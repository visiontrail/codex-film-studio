# Footage provenance and review

Checked on 22 October 2026. The production uses two YouTube-hosted video excerpts. Discovery reused FrontierTechSN's standalone `search_youtube` function and yt-dlp configuration. No project Task, database row, Gemini review job or old rendering pipeline was created. No `ffmpeg` process was started by this acquisition/review subtask.

## Selected sources

| ID | Source and creator | Actual reviewed imagery | Selected source interval |
| --- | --- | --- | --- |
| `bay` | [Marina Bay and Garden By the Bay Aerial View in Singapore Wheel Free Stock Video](https://www.youtube.com/watch?v=nCQai7lfwwY), Free Stock Videos / Dheeraj Sahu | Top-down dusk aerial of Gardens by the Bay's Supertree Grove, slowly rising and rotating. The title is broad: the clip does **not** show Marina Bay Sands or the Singapore Flyer. | `[0,14)` seconds |
| `jewel` | [The Rain Vortex waterfall at Jewel Changi Airport](https://www.youtube.com/watch?v=mNLqks3eiHk), dod5 | Rain Vortex, Forest Valley, public walkways and moving visitors at Jewel; a bridge and roof remain spatially consistent throughout the reviewed samples. | `[0,8)` seconds |

For both sources, yt-dlp returned the platform license string **Creative Commons Attribution license (reuse allowed)**. The original JSON and a compact metadata record are retained beside each source. This establishes the uploader/platform license assertion; it does not independently establish the uploader's original ownership. The first uploader's description inconsistently says both attribution requested and unnecessary, so this production retains full attribution. YouTube's [license documentation](https://support.google.com/youtube/answer/2797468?hl=en) describes CC BY reuse and attribution; the extractor did not return a version-specific license URI.

Suggested credits, with the film or its accompanying description:

- “Marina Bay and Garden By the Bay Aerial View in Singapore Wheel Free Stock Video” — Free Stock Videos / Dheeraj Sahu, [YouTube source](https://www.youtube.com/watch?v=nCQai7lfwwY), CC BY as designated on YouTube. Excerpted, resized, frame-rate converted and incorporated into the briefing composition.
- “The Rain Vortex waterfall at the Jewel Changi Airport in Singapore” — dod5, [YouTube source](https://www.youtube.com/watch?v=mNLqks3eiHk), CC BY as designated on YouTube. Excerpted, resized, frame-rate converted and incorporated into the briefing composition.

## Acquisition and delivered image sequences

The initial yt-dlp native single-stream transfers were slow and timed out. The same video-only H.264 media streams were then fetched with HTTP byte ranges using system curl; each range and the assembled total length were checked. No audio merge, transcode or ffmpeg invocation was used. Superseded partial downloads were removed after acquisition completed.

| Source file | Stream | Complete decode | SHA-256 |
| --- | --- | --- | --- |
| `assets/footage/marina-bay.mp4` | 1920 × 1080, 24000/1001 fps, 34.117417 s, 9,999,515 bytes | 818 decoded frames | `ab225ed88cdae0d590e19a1e4060dfa316c623d5820c2a53637f8e0e5c6b438c` |
| `assets/footage/jewel-source.mp4` | 1920 × 1080, 60 fps, 15.383333 s, 10,309,349 bytes | 923 decoded frames | `47f78e6e5f89c8b0d3537e77030fc346fb64cc86892f3b89ac1434ad4885b94d` |

macOS AVFoundation `AVAssetReader` decoded every source frame to uncompressed BGRA. The delivery excerpts are JPEG sequences at **960 × 540 and 24 fps**, selected by nearest source frame at each target timestamp:

- `assets/footage/bay-frames/00000.jpg` through `00335.jpg`: **336 frames / 14 seconds**.
- `assets/footage/jewel-frames/00000.jpg` through `00191.jpg`: **192 frames / 8 seconds**.

The renderer contract is `content/footage.json` → `render.bay` and `render.jewel`. The sequences contain original source colours; compositing treatments belong to the new film.

The bay container's `AVAsset.duration` was incorrectly reported as twice the actual stream duration. `ffprobe`, the decoded frame count and presentation timestamps agreed on 34.117417 seconds. Sampling was corrected to the actual stream duration, and the final excerpts use verified frame rate plus source indices. The corrected 20-sample contact sheets contain no repeated end-frame padding.

## Scope of review

- **Automated full-frame coverage:** 818/818 bay frames and 923/923 Jewel frames decoded successfully. Presentation timestamps increase; no frame met the sampled-luminance nearly-black condition. Per-frame metrics are in `assets/footage/bay-frames-all-frames.json` and `jewel-frames-all-frames.json`.
- **Visual review:** the agent inspected 20 evenly distributed actual frames from each complete source, then inspected delivered sequence endpoints. Contact sheets: `assets/footage/bay-native-preview/contact-sheet.jpg` and `jewel-native-preview/contact-sheet.jpg`.
- **Finding:** both clips are suitable for the identified landmarks. No obvious generated geometry, implausible spatial layout, abrupt scene replacement, titles or overlaid watermarks appeared in the reviewed images. Confidence is high for landmark identity and suitability. Sample review is not a claim of manual inspection of all 1,741 source frames.
- **Audio:** only video streams were acquired; original audio is not used. This report makes no listening claim.
- **Final composition:** this report covers source footage and extracted frames. Full rendered-film review remains a separate delivery check.

## Preserved but unused source

`assets/footage/night.mp4` is the project's existing 15-second 4K clip from [On Top of Marina Bay Sands Singapore | Singapore Skyline](https://www.youtube.com/watch?v=yXwGjpJdnww), Travelling Tips By Sunny, source interval 204–219 seconds. An existing evidence frame shows a plausible real night view toward Suntec/Flyer. Its manifest says rights unverified; it is preserved as requested but excluded from the current renderer.

The existing ambient “Singapore Marina Bay Balcony View” clip (`YcksrEV3kwU`) was rejected after a visual check found incompatible landmark placement and a likely constructed/generated scene. No pixels from it are used.

## Reproduction

From this production directory, with the retained source files:

```sh
swift assets/footage/extract-native.swift assets/footage/marina-bay.mp4 assets/footage/bay-frames 23.976023976023978 14
swift assets/footage/extract-native.swift assets/footage/jewel-source.mp4 assets/footage/jewel-frames 60 8
swift assets/footage/preview-native.swift assets/footage/marina-bay.mp4 assets/footage/bay-native-preview 34.117417
swift assets/footage/preview-native.swift assets/footage/jewel-source.mp4 assets/footage/jewel-native-preview 15.383333
```

An OpenCV equivalent (`assets/footage/review_footage.py`) is retained, but it was not the decoder used for this review because the OpenCV dependency download was still in progress. Native scripts emitted deprecation warnings on this macOS SDK and completed successfully.
