# Sci-Fi Sitcom Toon · 可复用制作方法

从参考片的绘画、动作、剪辑和声音语言出发，为新选题创作科幻情景喜剧。
这是方法包，包含风格说明、制作流程、空白输入和通用代码；不是固定故事，
也不是输入一段文字便能自动完成影片的模板。

**本包不预置任何选题、国家、统计数字、人物、品牌、对白或完整分镜。**
双人反应差、平涂与线条抖动是可复用的表达手段；咖啡、赌球、特定国旗、
某个角色造型和穿越几个世界，都不构成使用这个风格的前提。

## 从哪里开始

| 文件 | 用途 |
| --- | --- |
| [STYLE.md](starter/STYLE.md) | 风格不变量、可变项、动作与声音语言 |
| [WORKFLOW.md](starter/WORKFLOW.md) | 选题 → 镜头 → 音频 → 时间轴 → 修订 → 交付 |
| [REVIEW.md](starter/REVIEW.md) | 对照参考、逐帧覆盖、缺陷修复与证据边界 |
| [prompt.txt](prompt.txt) | 在 Codex 中启动新选题的简短提示词 |
| [starter/](starter/) | 空白输入、描边与时间轴工具、维护测试 |
| [PROVENANCE.md](PROVENANCE.md) | 方法来源、授权与提炼范围 |

在仓库根目录运行（Python 3.9+；不会安装软件或调用 TTS）：

```sh
python3 methods/scifi-sitcom/new_project.py my-film
# 或指定仓库之外的位置
python3 methods/scifi-sitcom/new_project.py my-film --output /absolute/path/my-film
```

默认创建 `../codex-film-studio-projects/my-film`。已存在的目录会被拒绝，
包括通过符号链接指向库内的目的地。新目录包含所有方法说明和共享审看工具，
不依赖作者机器上的旧项目。然后在 Codex 中打开新目录，提供选题并使用提示词。

创作仍须为新主题编写人物、场景、道具和镜头。`lib/ink.mjs` 只提供通用
绘画能力；`lib/timeline.mjs` 只提供帧时钟与镜头查找。空白合同故意不能
作为已完成影片通过验证。语音可以来自已有 Pocket TTS、Chatterbox 或录音；
服务地址、认证和声音选择由新项目显式提供。

## 复用边界

- 保存通用方法和参数起点，不保存上一部影片的观点、事实、角色或素材。
- 有参考片时按视觉功能配对；不同主题不要求道具、坐标、时长或情节一致。
- 风格相近仍然需要检查可读性、动作和连续性；题材变化不是忽略缺陷的理由。
- 使用真实人物时遵循新项目的肖像输入要求；国旗、品牌和事实保持来源可追溯。
- 大量生成素材、配音响应、视频和逐片审看记录保存在外部生产目录。

本包不把未发布的影片当作公开样片，也不新增 `styles.json` 中的展示条目。
注册公开风格仍需遵守仓库的 [CONTRIBUTING.md](../../CONTRIBUTING.md)。
方法包可以直接用于新选题，无需复制旧片或下载参考项目的动画代码。

## 验证本包

```sh
python3 -B -m unittest discover -s methods/scifi-sitcom/tests -p 'test_*.py'
node --test methods/scifi-sitcom/starter/tests/*.mjs
```

这些检查验证空白项目、路径隔离、帧边界和描边行为，不冒充影片视觉验收。
