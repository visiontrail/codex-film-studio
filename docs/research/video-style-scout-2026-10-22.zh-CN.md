# Codex Film Studio：24 个新视频风格候选

调研日期：2026-10-22（Asia/Singapore）。

目标是为这个项目找新的视觉与动作语言。当前项目的 `styles.json` 只登记了 whiteboard；本次对照了 [lemo-opuscar 在线风格索引](https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/README.md)（调研时公开介绍为 51 种），排除直接重复的白板、蓝图、数据简报、拆解、剪纸、像素 RPG 等方向。

以下名称是按画面、动作、镜头与声音规则归纳的候选标签，并非声称作者用这些名称定义自己的作品。跨媒体风格之间难免有相邻关系；每条单列区别，不能只换一个材质或频道名字就算一个新风格。

本次查阅了作品页面、作者/制作机构说明及 YouTube/Vimeo 的可检索元数据，没有逐部完整播放或完成试制。部分视频的网页抓取失败，保留了作者或机构的说明入口；链接存在或元数据可检索不等于当前地区的完整播放验证。难度和实现路径均为面向本项目的工程判断。

## 先看哪些

建议首批做六个小样：**几何变换式数学讲解、角色行为模拟实验室、算法运行与声化、精密机械无缝循环、字形即物体的语义动画、超现实照片拼贴喜剧**。它们分别扩展推导、实验、执行过程、循环机制、文字语义和角色喜剧，互相差异明显。

先按每项一个 15—30 秒的完整视觉命题验证；机械循环可以先做 8—12 秒。通过实际画面、运动、声音和最终播放检查之后，再根据 CONTRIBUTING.md 补充 STYLE.md、prompt.txt、DEMO.md、poster、可编辑 studio 和真实样片，登记到 styles.json。调研候选不应直接成为“已经可用”的风格。

## 总览

| # | 候选风格 | 代表作品与作者 | 复刻难度估计 |
| --- | --- | --- | --- |
| 1 | 几何变换式数学讲解 | [But what is a Neural Network?](https://www.youtube.com/watch?v=aircAruvnKk) · 3Blue1Brown / Grant Sanderson | 中 |
| 2 | 角色行为模拟实验室 | [Simulating Natural Selection](https://www.youtube.com/watch?v=0ZGbIKd0XrM) · Primer | 中 |
| 3 | 算法运行与声化 | [The Sound of Sorting](https://www.youtube.com/watch?v=kPRA0W1kECg) · Timo Bingmann | 低 |
| 4 | 可操控因果模型讲解 | [The Evolution of Trust](https://ncase.me/trust/) · Nicky Case | 中 |
| 5 | 字形即物体的语义动画 | [Word as Image](https://vimeo.com/30168074) · Ji Lee；动画 Bran Dougherty-Johnson | 低至中 |
| 6 | 精密机械无缝循环 | [Focus!](https://www.onassis.org/art/works/focus) · Andreas Wannerstedt | 中 |
| 7 | 分形空间漫游 | [Fractal Time](https://www.julius-horsthuis.com/fulldome-1/fractal-time-836nm) · Julius Horsthuis | 高 |
| 8 | 群集涌现的粒子电影 | [Murmuration](https://roberthodgin.com/project/murmuration) · Robert Hodgin | 中至高 |
| 9 | 滚动图形乐谱 | [Bach “Little” Fugue 等图形乐谱](https://www.youtube.com/watch?v=ddbxFi3-UO4) · Stephen Malinowski / Music Animation Machine | 低至中 |
| 10 | 示波器矢量音乐 | [Shrooms](https://www.youtube.com/watch?v=19jv0HM92kw) · Jerobeam Fenderson | 中至高 |
| 11 | 机械音乐世界 | [Pipe Dream](https://www.youtube.com/watch?v=hyCIpKAIFyo) · Animusic | 高 |
| 12 | 磁流体动态雕塑 | [Morpho Towers — Two Standing Spirals](https://www.kodama.hc.uec.ac.jp/spiral/) · Sachiko Kodama；合作 Yasushi Miyajima | 高 |
| 13 | 多重曝光运动回声 | [Pas de deux](https://www.nfb.ca/film/pas_de_deux/) · Norman McLaren | 中 |
| 14 | 时间切片与时空拉伸 | [Static No.12 (seek stillness in movement)](https://www.qagoma.qld.gov.au/exhibition/daniel-crooks) · Daniel Crooks | 中 |
| 15 | 频闪螺旋雕塑 | [Blooms: Strobe Animated Sculptures](https://vimeo.com/117674269) · John Edmark | 中至高 |
| 16 | 胶片直刻与间歇动画 | [Blinkity Blank](https://www.nfb.ca/film/blinkity-blank/) · Norman McLaren | 低至中 |
| 17 | 黏土变形喜剧 | [Morph / The Epic Adventures of Morph](https://aardman.com/film-tv-games/morph/) · Aardman；Peter Lord、David Sproxton | 中至高 |
| 18 | 毛线角色与解线叙事 | [Lost & Found](https://www.lostandfound.film/) · Andrew Goldsmith（Goldy）、Bradley Slabe / Wabi Sabi Studios | 高 |
| 19 | 日常物件替代式定格 | [Fresh Guacamole](https://pesfilm.com/pages/fresh-guacamole) · PES | 中至高 |
| 20 | 沙粒连续变形叙事 | [The Owl Who Married a Goose](https://www.nfb.ca/film/owl_who_married_goose/) · Caroline Leaf；图像来源合作 Agnes Nanogak | 中至高 |
| 21 | 针幕灰阶梦境 | [Mindscape](https://www.nfb.ca/film/mindscape/) · Jacques Drouin | 高 |
| 22 | 真人转描与画中世界 | [Take On Me](https://www.youtube.com/watch?v=djV11Xbc914) · a-ha；导演 Steve Barron；转描 Michael Patterson、Candace Reckinger | 高 |
| 23 | 真人逐格超现实 | [Neighbours](https://www.nfb.ca/film/neighbours_voisins/) · Norman McLaren | 高；依赖拍摄 |
| 24 | 超现实照片拼贴喜剧 | [Monty Python — I’m (Still) So Worried](https://www.youtube.com/watch?v=nT5JBrKC5M0) · Terry Gilliam 的视觉语言；参考 MV 导演 Paul Shammasian | 中；依赖素材设计 |

## 逐项拆解

### 01 · 几何变换式数学讲解

- **作品与出处：**[But what is a Neural Network?](https://www.youtube.com/watch?v=aircAruvnKk)；3Blue1Brown / Grant Sanderson。参考类型：YouTube / 作者课程。[作者/机构说明](https://www.3blue1brown.com/lessons/neural-networks/)。
- **可复刻规则：**深色背景、少量高亮色；节点、连线、矩阵和公式沿着同一概念连续变形；对象变形时仍可追踪。
- **适合题材：**AI、通信、概率、信号处理。
- **实现判断：**优先；用 Manim 或自编二维几何时间轴。先做少量元素，保留变换前后的对应关系。 难度估计：中。
- **与既有合集的区别：**邻近 blueprint/dataviz，但核心是数学对象的连续映射与推导，不是制图外观或统计图表。
- **原创试片命题：**为什么模型的下一词预测会形成一个概率分布？

### 02 · 角色行为模拟实验室

- **作品与出处：**[Simulating Natural Selection](https://www.youtube.com/watch?v=0ZGbIKd0XrM)；Primer。参考类型：YouTube 原频道。[作者/机构说明](https://www.youtube.com/watch?v=0ZGbIKd0XrM)。
- **可复刻规则：**把规则交给可识别的小角色；展示寻找、竞争、复制与失败，再暂停、重置或改变参数对照。
- **适合题材：**群体决策、市场、排队、资源分配、演化。
- **实现判断：**优先；先实现确定种子的模拟并记录事件，再用简化二维或三维角色重放。原片简介明确写有 Blender 和 Python。 难度估计：中。
- **与既有合集的区别：**邻近 dataviz；画面由个体互动产生，保留角色与因果过程，不能只把统计条形图换成小人。
- **原创试片命题：**多加一条道路，为什么所有人反而更慢？

### 03 · 算法运行与声化

- **作品与出处：**[The Sound of Sorting](https://www.youtube.com/watch?v=kPRA0W1kECg)；Timo Bingmann。参考类型：作者演示 / YouTube。[作者/机构说明](https://panthema.net/2013/sound-of-sorting/)。
- **可复刻规则：**比较、交换、访问同时触发颜色与音高；由混乱逐步形成秩序；操作节奏就是配乐结构。
- **适合题材：**算法、搜索、调度、缓存、压缩。
- **实现判断：**优先；从算法事件日志同时生成画面和声音。作者页面有源码与原视频入口。 难度估计：低。
- **与既有合集的区别：**邻近 dataviz，但必须展示真实操作状态并由操作生成声音；不是给统计图配一条背景音乐。
- **原创试片命题：**三种搜索方法，在同一份数据里怎样找到答案？

### 04 · 可操控因果模型讲解

- **作品与出处：**[The Evolution of Trust](https://ncase.me/trust/)；Nicky Case。参考类型：交互作品；可改编为影片。[作者/机构说明](https://ncase.me/trust/words)。
- **可复刻规则：**角色、选择按钮和因果规则共享画面；先作预测，再展示实验，回退并只改变一个条件；让结果解释机制。
- **适合题材：**合作、激励、平台机制、AI 评估、反馈系统。
- **实现判断：**优先；用 Canvas/网页状态机做可重放实验，影片版预先编排输入并配解说。 难度估计：中。
- **与既有合集的区别：**邻近 microgame，但原仓库该项是快闪微游戏；这里是一套持续模型的反事实教学。也区别于第 2 项的大规模自主个体模拟。
- **原创试片命题：**评分规则怎样把一个有用的助手变成讨好你的助手？

### 05 · 字形即物体的语义动画

- **作品与出处：**[Word as Image](https://vimeo.com/30168074)；Ji Lee；动画 Bran Dougherty-Johnson。参考类型：作者 Vimeo / 作者项目。[作者/机构说明](https://pleaseenjoy.com/word-as-image)。
- **可复刻规则：**直接用字母本身组成所表达的物体或动作；字形移动、坠落、开合之后，观众才读懂词义。
- **适合题材：**概念短片、片头、词汇、科技主题的短章节。
- **实现判断：**优先；用 SVG 字形路径、遮罩和骨骼式拆分；从少量英文词开始。中文需要另做字形设计。 难度估计：低至中。
- **与既有合集的区别：**邻近 swiss-motion，但判定标准是字形承担语义动作，而不是网格、字号和版面节奏。
- **原创试片命题：**让 TOKEN、MEMORY、ATTENTION 三个词各自演示自己的含义。

### 06 · 精密机械无缝循环

- **作品与出处：**[Focus!](https://www.onassis.org/art/works/focus)；Andreas Wannerstedt。参考类型：展览机构作品页；无限循环三维动画。[作者/机构说明](https://www.onassis.org/people/andreas-wannerstedt)。
- **可复刻规则：**几何体、雕塑与机械以精确节拍接触、避让和平衡；用一个循环维持悬念，首尾完全衔接。
- **适合题材：**效率、平衡、工作流、品牌短片、Shorts。
- **实现判断：**优先；用简化三维模型和解析轨迹控制接触与周期；先做一个 8—12 秒闭环。 难度估计：中。
- **与既有合集的区别：**邻近 glass-product/lowpoly-island，但辨识度来自动作约束、接触和闭环，而不是产品材质或低多边形场景。
- **原创试片命题：**一个任务球如何在收集、判断、执行、验证四个机关间持续流转？

### 07 · 分形空间漫游

- **作品与出处：**[Fractal Time](https://www.julius-horsthuis.com/fulldome-1/fractal-time-836nm)；Julius Horsthuis。参考类型：作者影片页；原作为球幕影片。[作者/机构说明](https://www.julius-horsthuis.com/)。
- **可复刻规则：**镜头穿越自相似的数学空间；宏观与微观互相转换，结构尺度难以判断；光与雾提供纵深。
- **适合题材：**复杂性、宇宙、数学、意识主题、音乐影像。
- **实现判断：**用分形公式、距离估计与离线渲染做普通画幅版本；先限制路径和细节，避免照搬球幕画幅。 难度估计：高。
- **与既有合集的区别：**区别于 lowpoly-island；空间由递归公式生成，尺度跨越本身就是叙事。
- **原创试片命题：**从一座城市不断下潜，最后发现它藏在一个数学公式里。

### 08 · 群集涌现的粒子电影

- **作品与出处：**[Murmuration](https://roberthodgin.com/project/murmuration)；Robert Hodgin。参考类型：作者项目及视频。[作者/机构说明](https://roberthodgin.com/project/murmuration)。
- **可复刻规则：**大量个体通过局部规则形成旋涡、分裂和合流；远景呈现整体形状，近景看见局部动作。
- **适合题材：**去中心化、群体智能、网络、扩散、生态。
- **实现判断：**用群集规则驱动简化点或鸟形；先做中等规模，再测试三维渲染预算。 难度估计：中至高。
- **与既有合集的区别：**邻近 lidar-survey，但这里的点主动运动形成形状。区别于第 2 项：以连续集体运动和尺度为镜头语言，少用实验台、角色台词及统计对照。
- **原创试片命题：**没有指挥者，一万个节点怎样形成稳定的队形？

### 09 · 滚动图形乐谱

- **作品与出处：**[Bach “Little” Fugue 等图形乐谱](https://www.youtube.com/watch?v=ddbxFi3-UO4)；Stephen Malinowski / Music Animation Machine。参考类型：作者推荐列表 / smalin YouTube。[作者/机构说明](https://www.musanim.com/watch_mam.html)。
- **可复刻规则：**时间横向移动，音高按纵向排列，音符长度对应时值；各声部用颜色区分，发声时点亮。
- **适合题材：**音乐结构、信号、周期、复调、声音教育。
- **实现判断：**优先；使用有演奏时序的 MIDI 或标注音符，按同一时间轴输出乐谱和声音。 难度估计：低至中。
- **与既有合集的区别：**邻近 dataviz，但乐谱承担精确音乐结构，观众能跟随每个声部的同时进行。
- **原创试片命题：**用四条颜色不同的声部解释信息怎样并行传递。

### 10 · 示波器矢量音乐

- **作品与出处：**[Shrooms](https://www.youtube.com/watch?v=19jv0HM92kw)；Jerobeam Fenderson。参考类型：作者艺术家频道。[作者/机构说明](https://www.youtube.com/watch?v=19jv0HM92kw)。
- **可复刻规则：**立体声的左右信号分别控制横纵偏转；连续荧光线组成可辨认的形状，声音与图像来自同一信号。
- **适合题材：**声音、波形、电子、通信、实验音乐。
- **实现判断：**先做数字 XY 示波器与余辉模拟；若只让图案跟音乐跳动，应称为该风格的视觉近似，不能声称实现了原作的声画同源。 难度估计：中至高。
- **与既有合集的区别：**邻近 ascii-crt，但图形由连续矢量信号绘出，不是终端字符加扫描线。
- **原创试片命题：**同一段立体声怎样既是一朵花，也是一组可听见的信号？

### 11 · 机械音乐世界

- **作品与出处：**[Pipe Dream](https://www.youtube.com/watch?v=hyCIpKAIFyo)；Animusic。参考类型：AnimusicLLC 原频道。[作者/机构说明](https://www.youtube.com/watch?v=hyCIpKAIFyo)。
- **可复刻规则：**虚构机器按音乐节拍发射、弹跳、击打；每个音符在画面里有一个明确的机械成因。
- **适合题材：**自动化、协议、流水线、因果链、音乐短片。
- **实现判断：**用三维部件及音符事件反推轨迹；每次击打都应与音符严格对齐，再安排摄影机。 难度估计：高。
- **与既有合集的区别：**区别于 teardown：机器持续工作而非拆开展示。也区别于第 6 项：声部和音符决定动作，循环只是局部结构。
- **原创试片命题：**把网络数据包做成会击打不同乐器的小球。

### 12 · 磁流体动态雕塑

- **作品与出处：**[Morpho Towers — Two Standing Spirals](https://www.kodama.hc.uec.ac.jp/spiral/)；Sachiko Kodama；合作 Yasushi Miyajima。参考类型：作者学术机构项目页；装置影像。[作者/机构说明](https://www.kodama.hc.uec.ac.jp/spiral/)。
- **可复刻规则：**黑色液体在磁场控制下长出尖峰、爬升和旋转；近距离突出表面张力、反射和节奏。
- **适合题材：**磁场、材料、能量、生命感、实验品牌影像。
- **实现判断：**可先用程序化表面位移做外观近似；完整磁流体物理与原作的实体装置另有难度。 难度估计：高。
- **与既有合集的区别：**区别于 glass-product/microscope：动态磁性表面与液态尖峰是主角，不是透明产品或显微证据。
- **原创试片命题：**让看不见的磁场通过一团会呼吸的黑色液体显形。

### 13 · 多重曝光运动回声

- **作品与出处：**[Pas de deux](https://www.nfb.ca/film/pas_de_deux/)；Norman McLaren。参考类型：NFB 正片及馆藏。[作者/机构说明](https://collection.nfb.ca/film/pas_de_deux_en)。
- **可复刻规则：**黑场、侧光与清晰人体轮廓；把同一动作的不同时刻叠加，让时间轨迹成为形状。
- **适合题材：**动作、时间、学习、传承、运动科学、诗性表达。
- **实现判断：**优先；对自有舞蹈/动作素材或自绘骨骼动画叠加延时帧，控制亮度与遮挡。 难度估计：中。
- **与既有合集的区别：**区别于 shadow-puppet：多个时间样本同时出现是结构，不是用影子演戏。
- **原创试片命题：**一次挥手怎样在画面上留下一条完整的时间曲线？

### 14 · 时间切片与时空拉伸

- **作品与出处：**[Static No.12 (seek stillness in movement)](https://www.qagoma.qld.gov.au/exhibition/daniel-crooks)；Daniel Crooks。参考类型：美术馆及悉尼双年展馆藏说明。[作者/机构说明](https://artsandculture.google.com/asset/static-no-12-seek-stillness-in-movement-daniel-crooks/rAHs4v1-JxKj-Q?hl=en)。
- **可复刻规则：**画面不同位置读取不同时间；把运动切成条带重组，身体和街景沿时间延展、弯曲或凝固。
- **适合题材：**时间、记忆、速度、城市、观察方式。
- **实现判断：**优先；输入视频或自渲染场景，缓存帧并按空间位置采样不同时间；可从简单狭缝扫描开始。 难度估计：中。
- **与既有合集的区别：**不是 backrooms 的录像质感或普通故障滤镜；真正改变的是空间与时间的采样关系。
- **原创试片命题：**同一个人从画面左侧的过去，走入右侧的未来。

### 15 · 频闪螺旋雕塑

- **作品与出处：**[Blooms: Strobe Animated Sculptures](https://vimeo.com/117674269)；John Edmark。参考类型：作者 Vimeo / 参数说明。[作者/机构说明](https://www.johnedmark.com/phi)。
- **可复刻规则：**一个螺旋雕塑在旋转与离散采样下仿佛持续生长；重复单元沿黄金角度排布。
- **适合题材：**数学、采样、视觉错觉、自然生长、循环短片。
- **实现判断：**以参数化三维建模和固定旋转采样模拟；无需先制作实体雕塑。 难度估计：中至高。
- **与既有合集的区别：**区别于 brick-toy/lowpoly-island。作者特别说明 Blooms 是单体雕塑的频闪效果，并不等同于把多个姿势排成一圈的普通三维西洋镜。
- **原创试片命题：**一个没有变形的雕塑，为什么看上去一直在开花？

### 16 · 胶片直刻与间歇动画

- **作品与出处：**[Blinkity Blank](https://www.nfb.ca/film/blinkity-blank/)；Norman McLaren。参考类型：NFB 正片及馆藏。[作者/机构说明](https://collection.nfb.ca/film/blinkity-blank)。
- **可复刻规则：**黑底上短促出现刻痕、色块和生物形态；留黑、闪现和打击节奏共同构成动作。
- **适合题材：**声音短片、片头、节奏实验、抽象情绪。
- **实现判断：**用程序化刮痕与间歇帧设计做数字近似；重点是刻痕的时间编排与留黑，而不是统一加颗粒。 难度估计：低至中。
- **与既有合集的区别：**区别于 engraving/woodcut 的印刷图像；原作直接刻在胶片上，画面呈现离散、短促的声画事件。
- **原创试片命题：**把一段打击乐变成一群只在节拍上显形的抽象生物。

### 17 · 黏土变形喜剧

- **作品与出处：**[Morph / The Epic Adventures of Morph](https://aardman.com/film-tv-games/morph/)；Aardman；Peter Lord、David Sproxton。参考类型：制作公司作品及制作说明。[作者/机构说明](https://www.aardman.com/latest-news/2020/october/the-epic-adventures-of-morph-debut-sky-kids/)。
- **可复刻规则：**有手捏感的小角色在真实尺度的桌面行动；身体可压扁、拉长、融回泥团；动作有定格节拍。
- **适合题材：**无对白喜剧、产品概念、生活隐喻、角色系列。
- **实现判断：**新增简化黏土三维角色，以离散姿势和粗糙表面模拟定格；需要角色动作设计。 难度估计：中至高。
- **与既有合集的区别：**区别于 brick-toy：黏土可连续变形，身体材料本身制造情节。
- **原创试片命题：**一个总被拉成工具的小泥人，学会自己选择工作方式。

### 18 · 毛线角色与解线叙事

- **作品与出处：**[Lost & Found](https://www.lostandfound.film/)；Andrew Goldsmith（Goldy）、Bradley Slabe / Wabi Sabi Studios。参考类型：影片官网；含正片和幕后。[作者/机构说明](https://www.screenaustralia.gov.au/screen-guide/lost-found-34711/)。
- **可复刻规则：**毛线编织角色与微型布景；角色由线构成这一事实参与动作、风险和情绪，拉伸、缠绕、解线都有后果。
- **适合题材：**情感短片、协作、牺牲、连接、修复。
- **实现判断：**先制作有明显纤维纹理的三维/二维分层角色；真正解线需要逐段曲线结构和连续性设计。 难度估计：高。
- **与既有合集的区别：**区别于 crayon-book/brick-toy：针脚与线的拓扑决定情节，不是给普通角色贴毛线纹理。
- **原创试片命题：**一个由许多线头连接起来的小队，怎样修复断掉的伙伴？

### 19 · 日常物件替代式定格

- **作品与出处：**[Fresh Guacamole](https://pesfilm.com/pages/fresh-guacamole)；PES。参考类型：导演官方作品页。[作者/机构说明](https://pesfilm.com/products/fresh-guacamole-hd)。
- **可复刻规则：**将物体按形状、颜色或动作关系替换为另一种物体；用连续动作和精确拟音让不可能的变化显得合理。
- **适合题材：**料理隐喻、技术流程、产品、短广告、创意科普。
- **实现判断：**可用自有物件拍摄；代码版需逐镜设计三维替换物和手部/工具动作，不能仅作自动图像变形。 难度估计：中至高。
- **与既有合集的区别：**区别于 paper-popup/brick-toy：真实物件的语义替代与拟音错觉是核心。
- **原创试片命题：**用橡皮、纽扣和回形针演示一份信息怎样被编码、传输和重组。

### 20 · 沙粒连续变形叙事

- **作品与出处：**[The Owl Who Married a Goose](https://www.nfb.ca/film/owl_who_married_goose/)；Caroline Leaf；图像来源合作 Agnes Nanogak。参考类型：NFB 影片 / TIFF 作者资料。[作者/机构说明](https://cfe.tiff.net/canadianfilmencyclopedia/content/bios/caroline-leaf)。
- **可复刻规则：**背光沙面以颗粒密度形成灰阶；推开、堆积和擦除让人物、背景持续变成下一个场景。
- **适合题材：**寓言、记忆、迁徙、情感、短篇文学。
- **实现判断：**用密度场、粒子与有方向的擦除模拟；先做少量轮廓，保留前一个动作留下的沙迹。 难度估计：中至高。
- **与既有合集的区别：**区别于 ink-wash/watercolor：干燥颗粒的密度、边缘崩散和推沙动作决定转场。
- **原创试片命题：**一条迁徙路线变成一只鸟，再变成它返回的家。

### 21 · 针幕灰阶梦境

- **作品与出处：**[Mindscape](https://www.nfb.ca/film/mindscape/)；Jacques Drouin。参考类型：NFB 正片及馆藏。[作者/机构说明](https://collection.nfb.ca/film/mindscape)。
- **可复刻规则：**密集针的高度与侧光产生柔软灰阶；人物和地形在同一阴影表面中逐步浮现、消退和变形。
- **适合题材：**梦境、心理、回忆、历史寓言、无对白短片。
- **实现判断：**可先用高度场和斜光阴影做数字近似；保留针点结构、灰阶过渡及表面连续性。 难度估计：高。
- **与既有合集的区别：**区别于 woodcut/engraving：灰阶来自针的高度与投影，不来自雕版线条的印刷密度。
- **原创试片命题：**一个人走进自己的画，地景随着记忆逐步改变。

### 22 · 真人转描与画中世界

- **作品与出处：**[Take On Me](https://www.youtube.com/watch?v=djV11Xbc914)；a-ha；导演 Steve Barron；转描 Michael Patterson、Candace Reckinger。参考类型：官方音乐视频 / 乐队官方制作说明。[作者/机构说明](https://staging.a-ha.com/news/a-ha-reaches-one-billion-views-with-take-on-me)。
- **可复刻规则：**保留真人动作节律，逐帧转为铅笔轮廓；实拍空间与绘画空间通过角色和镜头连续穿越。
- **适合题材：**现实与想象、人物故事、音乐影像、记忆。
- **实现判断：**需要自有动作影像及一致的转描/分层处理；一张图套素描滤镜不足以构成这种风格。 难度估计：高。
- **与既有合集的区别：**区别于 cel-anime-80s/urban-sketch：转描的真人动作与两种现实层级的切换决定语言。
- **原创试片命题：**一位工程师从真实桌面进入草图，亲自穿过自己设计的系统。

### 23 · 真人逐格超现实

- **作品与出处：**[Neighbours](https://www.nfb.ca/film/neighbours_voisins/)；Norman McLaren。参考类型：NFB 影片 / 作者技术笔记。[作者/机构说明](https://www3.nfb.ca/archives_mclaren/notech/NT_EN.pdf)。
- **可复刻规则：**把真人当作逐格摆拍的动画角色；在真实场景中滑行、悬浮、跳跃，让日常动作服从荒诞规则。
- **适合题材：**社会寓言、无对白喜剧、人与机器、行为规则。
- **实现判断：**原生路径需要自有真人逐格素材；代码可模仿节拍与运动，但不能据此声称实现了真人逐格工艺。 难度估计：高；依赖拍摄。
- **与既有合集的区别：**区别于 silent-film：关键不是黑白默片外观，而是现实人物逐帧移动的运动方式。
- **原创试片命题：**办公室里的人只能沿流程箭头滑行，直到有人试着跨出路径。

### 24 · 超现实照片拼贴喜剧

- **作品与出处：**[Monty Python — I’m (Still) So Worried](https://www.youtube.com/watch?v=nT5JBrKC5M0)；Terry Gilliam 的视觉语言；参考 MV 导演 Paul Shammasian。参考类型：Monty Python 官方 MV / 制作说明。[作者/机构说明](https://www.montypython.com/news_soworriedrelease/501)。
- **可复刻规则：**照片、古典图像和绘画碎片成为会行动的角色；夸张比例、分层关节、突然闯入与荒诞变形推动笑点。
- **适合题材：**科技讽刺、历史、制度隐喻、幽默评论。
- **实现判断：**优先；用自有或可用素材做分层剪贴与二维关节动画；每一镜先设计一个明确的视觉笑点。 难度估计：中；依赖素材设计。
- **与既有合集的区别：**邻近 halftone-dossier/archive-lighttable，但没有证据墙式阅读任务；碎片直接扮演角色并制造荒诞动作。
- **原创试片命题：**一台只会批准申请的巨大印章，追着城市里所有想提问的人跑。

## 如何避免把相邻风格重复计数

- 第 2、4、8 项都能使用模拟，但应保留各自的画面规则：角色实验与代际对照、可操控反事实模型、连续的大规模群集运动。若实际样片只是同一模拟换配色，应合并。
- 第 3、9、10、11 项都有声音，但分别是算法操作声化、音符结构图谱、音频电压直接绘图、虚构机械产生音乐；共用音乐并不等于共用风格。
- 第 5 项必须让字形演示词义；普通标题飞入仍属于原合集已有的动态排版邻域。
- 第 13 项复制并叠加不同时间的完整轮廓；第 14 项在画面不同位置采样不同时间。两者不能用同一个通用拖影效果充数。
- 第 17—21 项的材料必须参与动作或情节：压泥、解线、物件替代、推沙和针高阴影。仅贴一层材质纹理，不能满足对应风格。

## 取舍记录

没有将常见的“某频道式扁平信息图”、普通工程剖视、普通地图飞行、一般科技 HUD、复古 CRT、纸片立体书等直接追加：它们与原合集现有类别相邻或已有明确覆盖。此前检索到的 Animagraffs《How a Car Engine Works》很好，但原合集已经有 teardown，因此不计入这 24 项。

保留原作的参考价值，制作时另写故事、角色、画面和声音。对于真人逐格、实体磁流体、针幕、沙画等，需区分原始制作工艺和代码实现的数字近似；本次没有证明它们都能使用现有白板渲染器完成。

## 补充的一手技术来源

- [3Blue1Brown 的 Manim](https://github.com/3b1b/manim)：数学解释动画引擎。
- [The Sound of Sorting 源码](https://github.com/bingmann/sound-of-sorting)：算法事件与声音/画面映射。
- [Music Animation Machine 观看说明](https://www.musanim.com/watch_mam.html)及[图形乐谱说明](https://www.musanim.com/pdf/ViewersGuideMAMQuickTime.pdf)。
- [Processing 视频库 SlitScan 示例](https://github.com/processing/processing-video/blob/main/examples/Capture/SlitScan/SlitScan.pde)：实时狭缝扫描的代码入口。
- [John Edmark 的 Golden Angle / Blooms](https://www.johnedmark.com/phi)：旋转与采样的原理。
- [NFB 的 McLaren 技术笔记](https://www3.nfb.ca/archives_mclaren/notech/NT_EN.pdf)：包含真人逐格等原始制作说明。
