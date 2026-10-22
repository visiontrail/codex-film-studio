# 新加坡 · 三天，三条线

独立制作的新加坡英文旅行短片，采用 LemoLab **Satellite Briefing** 的卫星简报视觉语言：倾斜轨道、对数下降、局部主岛纸地图扫描、冷灰摄影、细白地理标注、琥珀读数、局部回色和回升收尾。

**1920 × 1080，24 fps，2609 帧，1 分 48.7083 秒。** 12 段英文 Chatterbox 旁白，原速；全部旁白、字幕和画面标签均为英文。星耀樟宜雨漩涡和超级树航拍来自有来源记录的真实 YouTube 素材。国旗和 Universal 地球字标按本片风格重绘。没有创建 FrontierTechSN Tasks，也没有调用其编排流程。

## 观看与检查

- 成片：`media/final.mp4`
- 英文字幕：`media/captions.en.srt`
- 左右逐帧对比：`review/comparison.html`
- 全部成片帧、逐帧测量、原生尺寸配对图：`review/final-analysis/`、`review/comparison-pairs/`
- 原始参考片及其全帧审阅：`reference/`、`review/reference/`
- 验收记录：`QUALITY-REVIEW.md`、`REFERENCE-REVIEW.md`、`AUDIO-REVIEW.md`

从本目录启动本地浏览器审阅：

```sh
.venv/bin/python scripts/serve.py --port 8823
```

打开 `http://127.0.0.1:8823/watch.html`。服务器只监听本机。原生视频需浏览器支持 H.264/AAC；某些自动化 Chromium 构建没有这些解码器。`index.html` 是可编辑的实时 WebGL/Canvas 预览。

## 内容与依据

滨海湾安排一天，牛车水—小印度—甘榜格南安排一天，圣淘沙安排一天；用地铁连接街区，把露天步行留给早晚。路线线条表示游览顺序，不是导航级步行或地铁线路。

旅行事实见 `sources-travel.md`，实拍来源见 `sources-footage.md`，历史卫星底图和纸地图见 `sources-imagery.md`。完整署名在 `CREDITS.md`，也嵌入成片元数据。历史卫星图用于定位，不代表当前施工、天气或景点状态。

风格比较以对应镜头操作为依据。新地点、不同片长、英文单行字幕和实拍窗口会形成具体差异；本项目不把这些差异换算成虚假的“100%一致”分数。全帧自动测量、逐帧缩略图审阅、全尺寸重点帧检查、浏览器播放和音频听感分别记录。

## 修改与重建

`content/narration.json` 管理文案；`scripts/timeline.py` 依据真实音频时长和词时间戳生成统一整数帧时钟；`src/globe.mjs` 管理经纬度投影、影像层和调色；`src/film.mjs` 管理镜头、文字、路线和实拍窗口。所有这些代码为本片独立编写，没有套用参考工程的渲染流程。

本机已保留依赖和所有媒体。重建命令：

```sh
.venv/bin/python scripts/build.py
```

脚本依次校验音频、生成时间线/字幕、混音、渲染、检查全部帧并生成对比材料。每次 ffmpeg 均经过 `scripts/ffmpeg_gate.py`，获取 studio 锁并等待既有 ffmpeg 进程结束。重建后的视觉结果仍需实际审阅。

新环境需要 Python 3.11、Node、FFmpeg、`pip install -r requirements.txt`、`npm ci` 和 Playwright Chromium。字体可由 `scripts/fetch_fonts.py` 获取；卫星图由 `scripts/fetch_plates.py` 获取；海岸线可用 `scripts/extract_coastline.py` 从已保留的官方 ZIP 重建。实拍抽帧使用 Swift/AVFoundation，脚本和原始视频在本目录保留。音频客户端 `scripts/speech.py --help` 支持复用服务或独立本地 Chatterbox；修改文案后必须重新生成并审核相应语音。

媒体、模型运行记录、ASR 明细、参考片和依赖目录保留在本机，均不进入 Git。Git 只保存源码、内容、可追溯的来源和审核摘要。
