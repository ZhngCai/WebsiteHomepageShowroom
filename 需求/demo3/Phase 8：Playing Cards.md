# ================================
# Phase 8
# 3D Playing Cards Fold → Spread
# ================================



这是整个网站最重要的滚动视觉模块之一。


# 一、核心视觉概念

页面刚进入这个Section时：

所有卡片不是平铺。

而是：

「一叠立体纸牌」。

类似真实扑克牌：

Card Stack


例如：

12张卡片。

全部重叠在页面中心。


初始状态：

┌─────────┐
│ Card 12 │
├─────────┤
│ Card 11 │
├─────────┤
│ Card 10 │
│   ...   │
│ Card 01 │
└─────────┘


卡片之间：

存在真实空间层次。


不要让它看起来像：

普通CSS卡片堆叠。


必须具有：

3D厚度
透视
阴影
旋转
空间层级。


# 二、滚动动画

用户开始向下滚动：

第一张卡片：

轻微抬起。


然后：

向左 / 右展开。


第二张：

跟随展开。


第三张：

继续展开。


随着滚动进度：

卡片逐渐从：

STACK

变成：

FAN


再继续滚动：

从扇形：

变成：

HORIZONTAL ROW


最终：

所有卡片：

完整横向排列。


整个动画由：

ScrollProgress

控制。


不要：

自动播放。


必须：

滚动多少：

动画就进行多少。


# 三、三个动画阶段

整个Section分成：

Stage 1：

STACK


Stage 2：

FAN


Stage 3：

HORIZONTAL SPREAD


--------------------------------

Stage 1：

STACK


所有卡片：

x ≈ 0

y ≈ 0

z：

逐层递增。


rotation：

轻微随机。


例如：

-1deg
0deg
1deg


卡片：

稍微错位。


形成：

真实纸牌叠。


--------------------------------

Stage 2：

FAN


随着滚动：

卡片开始展开。


第1张：

向左。


第2张：

向右。


或者：

按照：

中心 → 两侧


逐步展开。


同时：

rotationZ


逐渐增加。


例如：

-25°

-20°

-15°

...

0°

...

15°

20°

25°


形成：

扇形纸牌。


--------------------------------

Stage 3：

HORIZONTAL SPREAD


继续向下滚动。


所有卡片：

逐渐排列成：

横向一排。


最终：

Card 01

Card 02

Card 03

Card 04

Card 05

Card 06

...


排列：

水平居中。


rotation：

全部归零。


scale：

统一。


z：

统一。


形成：

高级横向卡牌画廊。


# 四、3D空间

必须使用：

CSS 3D

或者：

Three.js。


优先：

CSS 3D + GSAP。


如果卡片数量超过：

30张

可以考虑：

Three.js。


当前建议：

12~16张。


CSS：

perspective


transform-style:

preserve-3d


卡片：

translate3d()


rotateX()


rotateY()


rotateZ()


# 五、纸牌视觉

每张卡片：

宽：

220~280px


高：

320~400px。


桌面端：

完整显示。


移动端：

缩小。


卡片设计：

高级艺术卡牌。


每张卡片包含：

编号

图片

标题

短文案


例如：

01

THINK

Ideas begin
with curiosity.


02

CREATE

Turn imagination
into reality.


不要设计成传统扑克牌。


而是：

「未来艺术收藏卡」。


# 六、卡片堆叠细节

初始状态：

最底层卡片：

z-index: 1


最上层：

z-index: 16


每张卡：

存在轻微：

rotateZ


以及：

translateY。


模拟真实纸牌。


卡片边缘：

有：

subtle shadow


以及：

1px border。


不要使用：

夸张发光。


# 七、滚动控制

使用：

GSAP ScrollTrigger。


Section：

设置足够的滚动高度。


例如：

min-height:

300vh


其中：

中间区域：

pin。


实现：

滚动驱动动画。


结构：

ScrollTrigger


trigger:

card-section


pin:

true


scrub:

1


动画：

timeline


例如：

timeline

.to(stack)

.to(fan)

.to(horizontal)


三个阶段：

连续衔接。


禁止：

阶段之间出现跳变。


# 八、卡片展开节奏

非常重要。


不要：

所有卡片同时展开。


必须：

逐张展开。


例如：

Card 01

↓

Card 02

↓

Card 03

↓

Card 04


存在：

80~150ms

的视觉错位。


但是：

动画本身必须跟随Scroll。


不能真正使用：

setTimeout。


使用：

GSAP stagger。


# 九、鼠标交互

当卡片最终横向排列后：

支持：

hover。


hover：

当前卡片：

translateY(-20px)

scale(1.04)


同时：

其他卡片：

保持不变。


鼠标移动：

卡片产生轻微：

rotateX

rotateY


形成：

3D Tilt。


但是：

必须非常轻。


不要晃动。


移动端：

关闭hover效果。


# 十、点击卡片

最终横向排列后：

点击任意卡片。


卡片：

向前移动。


scale：

1 → 1.5


其他卡片：

opacity：

1 → 0.25


背景：

轻微变暗。


然后：

显示信息面板。


信息：

Title

Description

Category

Date

Tags


面板：

Glassmorphism。


动画：

GSAP。


关闭：

卡片回到：

horizontal row


状态必须恢复。


# 十一、关键要求

整个模块必须有：

「空间折叠感」。


初始：

一叠卡牌。


中间：

扇形展开。


最终：

横向展开。


因此：

Scroll实际上控制：

空间展开程度。


用户应该感觉：

自己正在：

「把一叠纸牌摊开」。

而不是：

「页面里的卡片移动了」。

# 十二、视觉风格

风格：

Luxury

Editorial

Minimal

Future


背景：

#F5F5F3


卡片：

白色 / 黑色 / 图片。


阴影：

柔和。


字体：

大标题 + 小号metadata。


整体：

高级杂志 + 数字艺术展。


# 十三、文件结构

创建：

demos/doubaoInspired/

sections/

PlayingCardsSection.vue


components/

PlayingCard.vue

CardDetailPanel.vue


animations/

playingCards.ts


composables/

usePlayingCards.ts


data/

playingCards.ts


不要把动画全部写进：

PlayingCardsSection.vue。


动画必须放：

animations/playingCards.ts


# 十四、生命周期

组件：

onMounted：

初始化。


onUnmounted：

完整清理。


必须：

ScrollTrigger.kill()


timeline.kill()


事件监听移除。


避免：

重复进入页面后：

动画叠加。


# 十五、Safari兼容

重点测试：

Chrome

Safari

macOS Safari

iOS Safari。


尤其注意：

CSS：

perspective

transform-style

backface-visibility

position: sticky


避免：

Safari出现：

卡片闪烁

卡片消失

Z-index异常

3D层级异常。


卡片建议：

backface-visibility:

hidden;


transform：

使用：

translate3d()


避免：

频繁改变：

top

left


# 十六、响应式

Desktop：

12~16张卡片。


Tablet：

8~12张。


Mobile：

5~8张。


移动端不要强行：

16张卡片横向挤在一起。


可以：

减少数量。


最终：

横向排列可以：

横向轻微溢出。


但是：

不能产生整个页面的水平滚动。


# 十七、性能

动画优先使用：

transform

opacity


不要动画：

width

height

top

left


不要每帧：

querySelector。


不要：

scroll事件直接修改DOM。


使用：

GSAP ScrollTrigger。


# 十八、最终动画目标

最终视觉必须形成：

STACK

↓

FAN

↓

SPREAD

↓

HORIZONTAL GALLERY


整个过程：

丝滑。

连续。

高级。

有重量感。


不要：

廉价卡片飞舞。


不要：

随机乱飞。


不要：

突然展开。


不要：

大量bounce。


不要：

夸张旋转。


最终效果应该：

克制、精致、具有真实纸牌的物理空间感。