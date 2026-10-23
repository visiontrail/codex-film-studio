# Mid-century Cartoon · 可复用制作方法

将 1950 年代平涂卡通的套色、墨线、有限动画、教学镜头和爵士声音语言，
用于自己的新选题。方法来自对 LemoLab《Meet Pip》的参考研究，以及独立
Canvas 制作中的修订经验。来源与改编边界见 [PROVENANCE.md](PROVENANCE.md)。

这是可执行的创作起步包：风格规范、制作步骤、空白输入、通用绘画与时间轴
代码、逐帧工具。人物、场景、叙述和配乐仍需按新主题创作；它不含默认故事，
也不宣称一次调用就能生成已验收影片。

## 开始一个新选题

在仓库根目录运行（Python 3.10+；创建过程不安装依赖、不访问配音服务）：

```sh
python3 methods/midcentury-cartoon/new_project.py my-film
# 或选择一个尚不存在的外部目录
python3 methods/midcentury-cartoon/new_project.py my-film --output /absolute/path/my-film
```

默认目录是 `../codex-film-studio-projects/my-film`。打开生成目录，在 Codex
中使用 `prompt.txt` 并提供主题、观众、语言和时长。项目含独立副本，后续
不依赖作者机器上的旧制作项目、Lemo 引擎或 FrontierTechSN 的 Tasks。

## 方法文件

| 文件 | 解决的问题 |
| --- | --- |
| [STYLE.md](starter/STYLE.md) | 材质、配色、字体、人物、动作、镜头和声音的风格约束 |
| [WORKFLOW.md](starter/WORKFLOW.md) | 从新选题到实测音频、动画、长篇章节和交付 |
| [AUDIO.md](starter/AUDIO.md) | Chatterbox 服务适配、原始 WAV、ASR、字幕与听审 |
| [REVIEW.md](starter/REVIEW.md) | 全帧配对、实际审看、原尺寸检查、修复与版本继承 |
| [INPUTS.md](starter/INPUTS.md) | 选题、镜头、音频、帧时钟和证据的空白合同 |
| [print.mjs](starter/lib/print.mjs) | 确定性的套色、压力线、纸面与星形几何 |
| [timeline.mjs](starter/lib/timeline.mjs) | 两帧一姿态、半开区间镜头查找和阅读时长 |
| [prompt.txt](prompt.txt) | 给 Codex 的简短调用方式 |

新项目还带有共享的 `tools/frame_review/`：全帧解码、语义配对图集、浏览器
逐帧查看、版本像素比较与 FFmpeg 协作锁。工具生成证据；审看者记录判断。

## 复用边界

保留的是表达规律和检查方法。新项目重新决定角色身份、事实、品牌、国旗、
几何场景、配音与音效。真实人物使用该项目提供的肖像，保留身份特征；品牌
和国旗按可信来源重绘，不能借风格化随意改动标志结构。

上游主要面向短操作教学片；本方法允许扩展为解释片和长篇章节，但仍让画面
展示动作、比较和结果。长篇节奏是独立扩展，不能据此宣称与短参考片的全部
感受完全一致。逐帧覆盖、技术合格和风格判断分别记录，不输出虚假的相似度。

本包是 `methods/` 下的方法。`styles.json` 的已发布样片登记仍按仓库的
[贡献规范](../../CONTRIBUTING.md)办理；没有为本包虚构公开样片或验收状态。

## 验证本包

```sh
python3 -B -m unittest discover -s methods/midcentury-cartoon/tests -v
node --test methods/midcentury-cartoon/starter/tests/*.test.mjs
```

这些测试验证安全创建、空白输入、寻帧确定性、套色节拍与时间区间。
具体影片仍须完成自己的画面、动作、声音和最终编码审查。
