# Codex Film Studio

**选一个风格，带一个故事，用 Codex 做成视频。**

这是一个会持续扩展的视频风格库。所有视觉风格统一放在 `styles/`，
逐项标注完成状态；`methods/` 保存跨风格通用的制作和审查流程。

[在线展示与播放](https://visiontrail.github.io/codex-film-studio/) ·
[English](README.md) · [下载样片](https://github.com/visiontrail/codex-film-studio/releases/tag/v0.1.0)

## 所有风格与完成状态

[统一风格目录](styles/README.md)包含白板、艺术拼贴、蜡笔绘本、50 年代平涂卡通、
卫星影像／地理简报、科幻情景喜剧卡通。所有风格使用同一创建命令：

```sh
python3 scripts/new_film.py --list
python3 scripts/new_film.py my-film --style midcentury-cartoon
```

目录标明“已发布样片”“创作起步包”“材质工具包”，同时列出渲染工程和已有网页。
这描述风格包的完成情况；每一部新影片仍须独立创作和审查。

已有播放与审阅网页集中在各自的风格目录中，通过统一入口打开：

```sh
python3 scripts/serve_styles.py --port 8249
```

访问 **http://127.0.0.1:8249/**。网页读取保留项目里的影片、字体和审阅数据，
详细说明见[本地网页说明](docs/pages.md#local-style-catalog)。原项目及其输出继续保留。

[通用制作方法](methods/README.md)提供共用的故事、音频、时间轴与审查流程；
每种风格自己的材质、绘画、镜头和声音规则都在 `styles/<id>/`。

## 已发布样片 · 白板讲解

[![白板上的人物、土耳其国旗和学习成绩对比](styles/whiteboard/poster.png)](https://github.com/visiontrail/codex-film-studio/releases/download/v0.1.0/does-ai-help-you-learn-3min.mp4)

**Does AI Help You Learn—or Just Finish?**

在一块持续保留内容的白板上，用移动的马克笔、手写文字、线条人物和
电脑、课本、国旗等具体对象，讲清“借助 AI 完成”和“独立掌握”的区别。

[3 分钟样片](https://github.com/visiontrail/codex-film-studio/releases/download/v0.1.0/does-ai-help-you-learn-3min.mp4) ·
[12 分钟长版](https://github.com/visiontrail/codex-film-studio/releases/download/v0.1.0/does-ai-help-you-learn-long.mp4) ·
[风格说明](styles/whiteboard/STYLE.md)

## 通过 Codex 使用

```sh
git clone https://github.com/visiontrail/codex-film-studio.git
cd codex-film-studio
```

在 Codex 中打开这个目录，粘贴：

> 阅读仓库的 AGENTS.md 和白板风格说明。用白板讲解风格制作一个三分钟的
> “太阳能电池如何工作”视频，放到仓库外的 ../codex-film-studio-projects/solar-panels。需要人物和具体对象
> 的地方画出简笔画。使用英文配音，输出 1080p MP4。自行检查并修复画面和
> 动作问题，完成后再让我看。

仓库包含 `.agents/skills/codex-film/SKILL.md`，也可以明确让 Codex 阅读它。
白板样片的手写字体和字幕布局面向英文；制作中文白板片需要配置中文字形和排版。
其他风格按各自说明选择字体与配音，影片语言以新项目要求为准。

## 先复现现有样片

需要 Node.js 20+、Python 3.11+ 和 FFmpeg。macOS 已验证；Linux 有样片预览
CI 检查。Windows 请使用 WSL。

```sh
python3 scripts/fetch_demo.py --edition short
cd styles/whiteboard/studio
npm ci
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
node scripts/render.mjs --start 0 --end 8 --width 960 --out media/preview.mp4
.venv/bin/python scripts/build.py --skip-atlases
python3 scripts/serve.py
```

打开 **http://127.0.0.1:8246/**。最终视频位于该工作目录的
`media/does-ai-help-you-learn-3min.mp4`。预览命令只生成画面，完整构建会合成
配音、音乐和笔触音效。生成时间取决于机器性能。

在仓库根目录执行 `python3 scripts/fetch_demo.py --edition all` 可下载两版
样片及配音。长版构建命令添加 `--edition long`，输出在
`editions/long/media/does-ai-help-you-learn-long.mp4`。

克隆只下载源码、字体和乐器采样；视频和配音从 Release 下载并校验哈希。
复现现有样片无需 TTS 密钥。改写脚本后，需要自己的 Chatterbox 兼容服务
或按段提供 WAV 配音，详见 [制作方法](TECHNIQUE.md)。

## 新建影片与扩展风格

```sh
python3 scripts/new_film.py my-film --style <id>
```

然后用 Codex 打开 `../codex-film-studio-projects/my-film`，阅读生成的 README、STYLE、
prompt 和制作审查说明，提供选题、观众、语言和时长。可用 `--output` 指定其他外部目录；
已有目标目录会被拒绝覆盖。创建命令负责准备工程，随后继续创作、配音和渲染。

白板保留可编辑的样片工程；其他风格提供空白输入和通用工具，需要为新选题编写场景与
渲染器。蜡笔绘本目前是材质工具包。修改主题必须同时修改叙事和画面。

原 `methods/<style>/` 已迁入 `styles/<style>/`；所有新项目使用 `--style <id>`。
旧的 `--method <id>` 参数保留为兼容别名。已创建的项目拥有独立副本，可继续使用。

新增风格的目录规范见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## GitHub Pages 展示页

[在线展示页](https://visiontrail.github.io/codex-film-studio/) 支持三分钟和
十二分钟样片切换、英文字幕、章节跳转，以及仓库和使用说明入口。
推送到 `main` 后，GitHub Actions 会自动构建并部署。

部署自己的 fork：在 **Settings → Pages → Source** 选择 **GitHub Actions**，
然后在 Actions 中运行 **Deploy film showcase**。构建会下载并校验 Release
样片，只发布播放器需要的文件。预览命令及修改方法见 [部署说明](docs/pages.md)。

由 LeoGuoLabs 使用 Codex 制作。风格库的组织方式参考
[LemoLab / lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)。

代码和文档采用 [MIT](LICENSE)，原创样片与剧照采用
[CC BY 4.0](MEDIA-LICENSE.md)。素材出处和许可证见
[CREDITS.md](styles/whiteboard/studio/CREDITS.md)。

## 扩展与维护

无论有没有发布样片，视觉风格都登记到 `styles.json`，按实际内容标注完成状态和能力。
修改索引后执行 `python3 scripts/update_style_index.py` 同步可读目录，贡献规范见
[CONTRIBUTING.md](CONTRIBUTING.md)。

新影片的选题、人物、配音、成片和审阅记录放到外部项目；向库内贡献通用规则、工具和
空白输入。指定真实人物时使用新项目提供的肖像。已有样片和网页保留为历史参考。
