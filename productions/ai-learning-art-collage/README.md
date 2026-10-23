# Does AI Help You Learn—or Just Finish?

独立制作的英语艺术拼贴解释视频：46 段旁白，1920 × 1080，25 fps。没有新建 FrontierTechSN Task，也没有沿用 lemo-opuscar 的代码或工作流；仅研究了它的制作经验。参考片是 101 academy 的[《拼拼貼貼成藝術》](https://www.youtube.com/watch?v=04UfoNpOQdw)，参考画面、图像与配乐不进入新片。

本文件说明输入、重建方法和证据边界，不是最终验收证书。当前46段旁白及7段局部修订已合并，共1657词；纯旁白554.86秒，完整时间轴586.48秒、14662帧。V7、V8完整MP4分别保留在 `delivery/` 和 `delivery/v8/`；V9保留新纸面材质，但编码检查发现未缩放贴图产生硬边，已拒绝；V10修复后正在重新渲染。版本状态以 `content/delivery-status.json` 为准。所有版本均未发布。`opening-v2-*`、`opening-v4-*` 和 `media/full-v5-draft-picture.mp4` 是历史试片或草稿。

## 文件与权威来源

| 路径 | 用途 |
| --- | --- |
| `content/narration.json` | 当前逐段旁白；ID 01–46 |
| `content/sources.json` | C01–C11 研究出处、研究类型与限制；E01–E03 原创情景、方法建议与代数例子 |
| `content/narration-draft.json` / `narration-repair*.json` | 历史原稿及局部修订输入；最终采用关系见下文和合并记录 |
| `src/*.mjs` | 实际画面、布局、动画与裁切实现的权威来源 |
| `content/shot-plan.json` | 前期分镜计划；部分文字已被后续实现替代 |
| `content/audio-cues.json` | 与已实现动作对应的明确音效提示；不从旧分镜描述推测音效 |
| `assets/generated/` | 5 张透明拼贴原料和 V9 纸张纤维材质；人物、课堂和教师均为示意图像 |
| `assets/source/` | 官方 OpenAI Blossom SVG、保留原路径的独立标志及来源/哈希记录 |
| `content/asset-provenance.json` | 图像尺寸、SHA-256、生成输出文件名、研究和声音来源 |
| `media/audio/manifest.json` | 旁白文本、WAV、提供方原始分段、声音身份和哈希的对应关系 |
| `media/timeline.json` | 画面、语音、字幕和音效共同使用的整数帧时钟 |
| `content/reference-map.json` | 按视觉功能匹配参考段落；并非同内容逐像素对齐 |
| `review/` | 自动分析、实际审看、修订和播放证据；必须分别解读 |

前5张生成图像的完整原始提示词没有持久保存，清单中的文字是摘要；V9纸张的完整提示词保存在 `content/paper-texture-v9-prompt.txt`。精确重建依赖现存 PNG、SVG 和 WAV 的原始字节，不能承诺重新调用生成模型会得到相同结果。旁白调用记录和旧修订证据应保留。

`assets/generated/`、`assets/source/`、`media/`、`review/`、`reference/` 和 `delivery/` 均被Git忽略，需要单独保留本地制作目录。仅克隆源码不能重建；尤其必须保存 `assets/source/openai-blossom-mark.svg`、全部生成PNG、已采用WAV和最终时间轴。渲染器缺少这些输入时应报错，不能用其他标志或重新生成的音频悄悄替代。

## 环境

所有命令从本制作目录运行。已观测环境：Node 24.15.0、npm 11.12.1、Python 3.11.9；`package-lock.json` 锁定 `@napi-rs/canvas` 0.1.100。Python 制作环境使用 PyAV 18.1.0、Pillow 13.0.0、NumPy 2.4.6、SciPy 1.17.1、requests 2.34.2 和 pyloudnorm 0.1.1。

```sh
npm ci
python3.11 -m venv .venv
.venv/bin/python -m pip install av==18.1.0 Pillow==13.0.0 numpy==2.4.6 scipy==1.17.1 requests==2.34.2 pyloudnorm==0.1.1
```

当前字体来自 macOS `/System/Library/Fonts/Supplemental/`：Arial Unicode、Arial Bold、Arial Narrow Bold、Georgia、Courier New、Bradley Hand Bold。字体没有打包；缺失或替换字体会改变断行和布局。视频编码依赖系统 FFmpeg，当前渲染器使用 macOS `h264_videotoolbox`；这不是未经修改即可跨平台运行的编码配置。

独立 ASR 实际复用了另一个已安装环境：

```sh
ASR_PYTHON=/Volumes/TP-1TB/WorspacePlus/IslaProject/FrontierTechSN/.venv/bin/python
```

该环境已核实为 `mlx==0.32.1`、`mlx-whisper==0.4.3`、NumPy 2.4.6、SciPy 1.17.1，使用本机 Hugging Face 缓存的 `whisper-large-v3-turbo-q4`、`whisper-medium-mlx`，部分复核使用 `whisper-small-mlx`。制作目录的 `.venv` 并未安装 MLX。`transcribe_audio.py --check` 只检查环境和模型；音频由 `wave` 和 SciPy 读取/重采样，无 FFmpeg 子进程，也不给识别器提供原文提示。

## 重建顺序

先备份已接受的素材、音频、时间轴和审看记录。以下是重建命令，不表示这些步骤已经完成验收。

1. 核对素材和 46 个内容 ID：

   ```sh
   .venv/bin/python scripts/validate_production.py --stage source
   ```

2. **仅初次合成或明确恢复已有检查点时**运行独立语音客户端。`--frontier-root` 只读取已配置的 Chatterbox 参数与凭据，不创建 Task；也可通过 `CHATTERBOX_*` 环境变量配置。不要把密钥写进仓库。

   ```sh
   .venv/bin/python scripts/speech.py --frontier-root /Volumes/TP-1TB/WorspacePlus/IslaProject/FrontierTechSN --check
   .venv/bin/python scripts/speech.py content/narration.json --frontier-root /Volumes/TP-1TB/WorspacePlus/IslaProject/FrontierTechSN --voice space-en-f1
   ```

   本次已采用7段局部修订：11、15、18、31来自 `media/audio-repairs-v1/`；26来自 `media/audio-repair26-v2/`；33来自 `media/audio-repair33-adopted/manifest.json`，保留原 `audio-repair33-v2` WAV；40来自 `media/audio-repair40-v1/`。精确候选表见 `review/audio-repairs-v1/merge-candidates.json`，事务与完成证据见 `review/audio-repairs-v1/merge-transaction/`、`review/audio-merged/completion.json`。主语音客户端退出后已同步合并 canonical 文本、manifest 和ASR证据；不要重新运行主 `speech.py` 覆盖已采用的局部输出。

   33把“the test included”明确编辑为“the tests included”，指学生的多份测验，不声明新增测验波次。这是只绑定33v2特定原文/WAV/四份ASR哈希的编辑决定，不是通用单复数豁免。`scripts/transcript_adoption.py` 校验该决定；原provider请求、synthesis文字、旧source hash、原ASR和未通过记录均保留。

3. 完整音频合并后，检查原文/音频身份，再建立非草稿时间轴：

   ```sh
   .venv/bin/python scripts/validate_production.py --stage audio
   .venv/bin/python scripts/timeline.py
   .venv/bin/python scripts/validate_production.py --stage timeline
   ```

   `timeline.py --draft` 允许尚无音频的段落估时，仅供预览。最终图片、音乐、混音、字幕和逐帧比较都必须基于同一份非草稿时间轴；修订语音后，旧派生产物均需重建。

4. 独立转写和有边界的词句/时间戳复核：

   ```sh
   "$ASR_PYTHON" scripts/transcribe_audio.py --check
   "$ASR_PYTHON" scripts/transcribe_audio.py
   "$ASR_PYTHON" scripts/audit_speech_batch.py --no-new-asr
   .venv/bin/python scripts/check_speech_gate.py --output review/audio-final-gate.json
   ```

   完整语音门必须实际接受46/46段且 `errors` 为空；需要检查所有ID覆盖、`needs_review` 和 `review_error`，不能只看退出码。后续局部复核使用 `review_speech.py` 等脚本并保留输入哈希；ASR 对上文字不等于已试听。字幕脚本会要求文本、音频和证据匹配，不能通过抹去不匹配记录绕过。

5. 生成原始音乐、纸张音效、混音和字幕，再渲染画面：

   ```sh
   .venv/bin/python scripts/soundtrack.py
   .venv/bin/python scripts/mix_audio.py
   .venv/bin/python scripts/measure_loudness.py media/mix.wav review/final-mix-loudness.json
   .venv/bin/python scripts/subtitles.py
   node scripts/render.mjs --frame 160 --width 1280 --out review/frame-160.png
   node scripts/phase_stills.mjs --timeline media/timeline.json --from 1 --to 46 --out review/final-phase-stills
   .venv/bin/python scripts/render_film.py --timeline media/timeline.json --work media/render-final-chunks --output media/picture-final.mp4 --chunk-frames 750
   ```

   `score.wav`、`foley.wav`、`mix.wav`、`captions.srt`及音频/字幕报告写入`media/`，响度报告在上述`review/`路径。最终混音已测得−17.1800 LUFS、4倍过采样峰值估计−2.1620 dBFS、0个满幅样本；这不构成试听结论。当前完整字幕199条，绑定最终时间轴。响度报告给出 BS.1770 综合 LUFS 和 4 倍多相过采样峰值估计；后者不是认证真峰值测量，数值也不能替代试听。静帧命令不启动编码器。分块渲染每 750 帧启动独立 Node 子进程，逐块全量解码核对帧数，再不重编码拼接；检查点保存输入身份、分块帧范围和哈希。同一输入可从已验证块恢复；输入变化会拒绝复用，须选择新的 `--work` 目录。编码与拼接均通过 `ffmpeg_gate.py` 等待其他 FFmpeg 进程，并用本地锁串行化。

6. 画面与声音核对后，使用完整时间轴、PCM和字幕报告封装：

   ```sh
   .venv/bin/python scripts/package_delivery.py --picture media/picture-final.mp4 --directory delivery
   ```

   输出为 `delivery/Does-AI-Help-You-Learn-or-Just-Finish.mp4`、独立 `.en.srt` 和 `delivery-manifest.json`。MP4含画面与英语音轨，不内嵌字幕，避免播放器默认覆盖拼贴文字。脚本检查时间轴、PCM、字幕覆盖与视频编码包SHA，封装不重编码画面。一次含mov_text的尝试因封装器仍设默认字幕标志被校验拒绝，失败草片保留；它不是交付版本。门控器会等待已存在的FFmpeg，但无法约束其他项目在检查后新启动的、不使用同一锁的编码器；并发任务仍需协调。

## 逐帧和播放证据

参考原片本地文件为 `reference/art-collage-1080p.mp4`，实际完整解码 5,551 帧。参考下载和研究材料不属于新片素材。论文链接及核查摘要在 `content/sources.json`，本目录没有完整论文 PDF 存档。

```sh
.venv/bin/python scripts/audit_frames.py delivery/Does-AI-Help-You-Learn-or-Just-Finish.mp4 review/final-frame-audit
.venv/bin/python scripts/compare_frames.py delivery/Does-AI-Help-You-Learn-or-Just-Finish.mp4 reference/art-collage-1080p.mp4 media/timeline.json content/reference-map.json review/comparison-final --html review/index.html --large-width 1920
.venv/bin/python scripts/compare_frames.py serve . --port 8876
```

审看目录必须新建或为空。审看页面是 `http://127.0.0.1:8876/review/index.html`；自带服务器支持 HTTP Range，默认 `python -m http.server` 可能使大视频无法定位。网页提供镜头选择、前后单帧、视频并排、精确解码缩略帧、完整接触表和手动审看记录导出。

`audit_frames.py` 为每个解码帧记录 PTS、颜色、边缘和邻帧差异；每张接触表含 100 帧。`compare_frames.py` 为每个成片帧映射参考帧，每张表 50 对，并输出每镜头 3 张较大对照。所有帧标签放在视频像素之外。缩略图各为 160 × 90；逐格看过缩略图不能记成逐帧全分辨率审看。浏览器 seek 可能落在相邻帧，精确帧以 PyAV 输出为准。

自动解码、素材哈希、逐帧表生成、实际目视、运动播放和试听是不同证据。当前接口曾明确拒绝向模型传递可听音频，详见 `review/audio-listening-capability.json`；不能把播放器启动、ASR 或波形分析称为试听通过。颜色/边缘差异也不构成“100% 风格一致”分数。

`validate_production.py` 只读本地文件，把 JSON 写到 stdout；失败返回 1。它验证 source → audio → timeline 的 ID、素材和音频哈希、真实 PCM 时长、非草稿帧时钟以及明确音效提示的覆盖，不调用服务、不修改 manifest、不运行 FFmpeg。它的通过不替代上述内容质量审查。

## 本地产物与归档

`delivery/`、`media/`、`review/`、`reference/`、`.venv/`、`node_modules/` 和运行缓存已由仓库规则忽略。大型生成位图、视频、WAV 和接触表保留在本机/单独归档，不加入本次源代码提交；`assets/generated/` 的 PNG 是重建必需输入，应按清单哈希备份。仅克隆文字源码不能恢复这些媒体字节。官方小型 SVG 和来源记录保留在 `assets/source/`。

旧试片的比较输出 `review/comparison-trial/` 仅验证工具；v5 的时间轴快照在 `review/revisions/v5/timeline.json`。一次连续整片渲染在约 4,500 帧处以 137 退出，未生成完整 MP4；内存增长是可能原因，未被确证。其恢复采用 `media/render-v5-chunks/` 和 `media/full-v5-draft-picture-recovered.mp4`，仍是草稿。最终审看报告必须绑定最终文件及其时间轴哈希，不能挪用这些历史记录。

当前交付MP4的SHA-256为 `807c8ff6ff631f4601f998083d8820520cdb1dcea14cb5535d09534918591d84`；最终时间轴SHA-256为 `0137ab972ec4e0707765f972c6907aa0d41abe7b1b1c6071a37dffdc45b14a3d`。这些身份与技术检查不代表视觉风格、连续播放或试听已全部通过，最终结论须查绑定这两份输入的审查记录。
