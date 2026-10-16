# ================================
# 项目总任务
# ================================

你是一名资深的 Creative Frontend Engineer、
WebGL Engineer、Motion Designer 和前端架构师。

现在需要开发一个：

「高端 AI 产品官网首页 Demo」

技术栈：

- Vue 3
- TypeScript
- Vite
- Vue Router 4
- GSAP
- GSAP ScrollTrigger
- Lenis
- Three.js（只在确实需要3D的模块使用）
- CSS / SCSS
- 不使用 React
- 不使用 React Three Fiber

目标浏览器：

- Chrome 最新版本
- Safari 最新版本
- macOS Safari
- iOS Safari
- Edge

重点：

这是一个“滚动体验优先”的官网。

不是普通的：

section + fadeIn + translateY

而是需要制作：

高级
丝滑
连续
具有空间感
具有电影感

的 Scroll Experience。


# ================================
# 一、参考网站
# ================================

参考网站：

https://www.doubao.com/about


请将该网站作为：

「滚动交互体验参考」

重点分析和借鉴：

1. 页面滚动节奏
2. Section之间的视觉衔接
3. 元素进入动画
4. 元素退出动画
5. 图片和文字的运动关系
6. 固定区域 / Sticky区域
7. 滚动驱动动画
8. 图片缩放
9. 图片位移
10. 内容切换
11. 背景颜色变化
12. 页面空间层次
13. 动画速度
14. easing
15. 滚动惯性
16. 视差效果
17. 内容出现顺序
18. 页面整体叙事节奏


重要：

不要直接复制豆包的：

- Logo
- 商标
- 文案
- 图片
- 插画
- 源代码
- 私有资源
- 品牌素材


使用原创：

- Logo
- 文案
- 图片
- SVG
- 图形
- UI


只参考其：

「信息架构、视觉节奏和交互理念」。


# ================================
# 二、项目定位
# ================================

网站定位：

AI Future Lab

一个展示未来 AI 能力的创意官网。

整体感觉：

Apple级别的克制
+
Awwwards级别的交互
+
AI产品的未来感。


设计关键词：

- Minimal
- Premium
- Futuristic
- Elegant
- Fluid
- Cinematic
- Intelligent


不要做成：

普通后台
普通营销页
模板化Landing Page
大量卡片堆砌
大量渐变按钮
廉价科技风


# ================================
# 三、最重要的滚动要求
# ================================

整个页面必须：

Scroll Driven。


用户滚动多少距离：

动画就推进多少。


不要让动画完全脱离滚动。


必须大量使用：

GSAP ScrollTrigger


并配合：

Lenis


实现：

Smooth Scroll。


动画要求：

- smooth
- precise
- subtle
- cinematic


不要：

突然移动
突然跳跃
突然出现
生硬缩放


动画应该：

先快后慢
或者
先慢后快


根据不同场景选择：

power2.out
power3.out
power4.out
expo.out
circ.inOut


避免：

bounce
elastic

除非非常必要。


# ================================
# 四、整体页面结构
# ================================

首页：

/

Demo Gallery


官网Demo：

/demo/doubao-inspired


未来可能增加：

/demo/ai-future
/demo/apple-inspired
/demo/creative-ai
/demo/3d-universe


每个Demo必须完全隔离。


# ================================
# 五、路由架构
# ================================

使用：

Vue Router 4


路由：

/


Demo Gallery


/demo/doubao-inspired


当前官网Demo


/demo/doubao-inspired/feature/:id


如果未来需要功能详情页。


使用：

dynamic import。


例如：

component: () =>
  import('@/demos/doubaoInspired/App.vue')


禁止：

所有Demo代码写进：

App.vue


禁止：

所有Demo共用一个：

Three.js Scene。


# ================================
# 六、目录结构
# ================================

必须严格按照以下架构：

src/

├── main.ts
│
├── App.vue
│
├── router/
│   ├── index.ts
│   └── routes.ts
│
├── pages/
│   └── DemoGallery.vue
│
├── demos/
│
│   └── doubaoInspired/
│
│       ├── App.vue
│       │
│       ├── components/
│       │   ├── Header.vue
│       │   ├── Footer.vue
│       │   ├── SectionTitle.vue
│       │   ├── FeatureText.vue
│       │   ├── FeatureImage.vue
│       │   └── ScrollProgress.vue
│       │
│       ├── sections/
│       │   ├── HeroSection.vue
│       │   ├── IntroSection.vue
│       │   ├── WritingSection.vue
│       │   ├── CreationSection.vue
│       │   ├── KnowledgeSection.vue
│       │   ├── MusicSection.vue
│       │   └── EndingSection.vue
│       │
│       ├── animations/
│       │   ├── hero.ts
│       │   ├── intro.ts
│       │   ├── writing.ts
│       │   ├── creation.ts
│       │   ├── knowledge.ts
│       │   ├── music.ts
│       │   └── ending.ts
│       │
│       ├── composables/
│       │   ├── useSmoothScroll.ts
│       │   ├── useScrollAnimation.ts
│       │   ├── useMediaQuery.ts
│       │   └── useReducedMotion.ts
│       │
│       ├── data/
│       │   └── features.ts
│       │
│       ├── assets/
│       │   ├── images/
│       │   ├── icons/
│       │   └── fonts/
│       │
│       ├── styles/
│       │   ├── variables.scss
│       │   ├── base.scss
│       │   └── animations.scss
│       │
│       └── three/
│           ├── SceneManager.ts
│           └── ParticleBackground.ts
│
└── shared/
    ├── components/
    ├── composables/
    └── utils/


# ================================
# 七、页面总体设计
# ================================

不要机械复制参考网站。

重新设计一个：

AI Future Lab。


页面包含：

7个主要内容区域。


其中：

Hero
+
5个AI能力模块
+
Ending


每个模块使用不同的滚动动画。


# ================================
# SECTION 01
# HERO
# ================================

全屏。

100vh。


视觉：

非常干净。

背景：

白色 / 极浅灰。

中心：

巨大标题。


例如：

AI
THAT MOVES
WITH YOU


标题：

超大字号。


进入页面：

文字不是简单fade。


动画：

第一阶段：

文字轻微向上漂移。


第二阶段：

字间距展开。


第三阶段：

副标题出现。


第四阶段：

背景出现非常轻微的光晕。


滚动：

标题开始向上移动。


背景：

产生轻微视差。


最终：

Hero内容离开视口。


要求：

非常克制。


# ================================
# SECTION 02
# AI模型能力
# ================================

采用：

Sticky + Scroll Storytelling。


左侧：

固定标题。


右侧：

动态内容。


用户滚动：

右侧内容逐个切换。


例如：

01

UNDERSTAND


02

CREATE


03

REASON


04

ACT


滚动过程中：

当前内容放大。


上一条：

缩小 + 淡出。


下一条：

进入。


同时：

背景颜色发生非常缓慢变化。


不要使用突然切换。


效果：

类似产品官网的：

scroll storytelling。


# ================================
# SECTION 03
# 写作能力
# ================================

重点：

文字滚动动画。


不要使用普通段落。


制作：

超大排版。


例如：

"Turn ideas
into words."


滚动过程中：

单词逐渐出现。


每个单词：

opacity
+
blur
+
translateY


从：

模糊
透明
下方


变成：

清晰
不透明
正常位置。


然后：

文字开始横向移动。


最后：

形成完整句子。


视觉：

高级编辑杂志。


# ================================
# SECTION 04
# 视觉创作
# ================================

这是视觉重点模块。


制作：

巨大的图片 / 视觉作品。


初始：

图片非常小。


随着滚动：

图片从中心向外扩大。


scale：

0.35 → 1


同时：

border-radius：

40px → 0


图片：

从卡片变成全屏视觉。


继续滚动：

图片轻微放大。


前景：

出现文字。


文字与图片产生视差。


离开：

图片缩小并向上移动。


要求：

动画必须丝滑。


# ================================
# SECTION 05
# 知识 / AI搜索
# ================================

采用：

横向滚动效果。


用户：

垂直滚动。


内容：

水平移动。


制作：

巨大的横向内容轨道。


例如：

DISCOVER

↓

SEARCH

↓

UNDERSTAND

↓

ANSWER


滚动：

track：

translateX


同时：

每个内容进入：

scale + opacity


并加入：

3D rotateY


产生空间感。


要求：

不是普通横向列表。


必须像：

镜头横向扫过内容。


# ================================
# SECTION 06
# 音乐 / 多媒体
# ================================

采用：

圆形 / 波纹滚动动画。


中心：

一个巨大的圆形视觉元素。


滚动：

圆形旋转。


同时：

外围：

波纹


粒子


频谱线


随着滚动：

逐渐展开。


文字：

FOLLOW THE RHYTHM


文字沿圆形运动。


整个模块：

有轻微3D效果。


不要过度科技感。


要：

艺术化。


# ================================
# SECTION 07
# ENDING
# ================================

最后：

回到极简。


巨大文字：

THE FUTURE
IS ALREADY HERE


滚动：

文字从远处进入。


然后：

快速靠近。


最终：

整个屏幕只剩：

一个圆点。


圆点：

缓慢缩小。


页面结束。


# ================================
# 八、3D卡片球模块
# ================================

如果需要增加3D Card Universe：

放在：

Section 04 或 Section 05。


要求：

Three.js。


制作：

3D立体球状卡片。


100+卡片。


所有卡片：

沿球体分布。


每张卡片：

图片。


默认：

球体缓慢旋转。


鼠标：

拖动球体。


hover：

卡片突出。


点击：

卡片从球体中飞出。


移动到：

屏幕中央。


其他卡片：

模糊 + 缩小。


打开：

Information Panel。


Panel：

Glassmorphism。


包含：

Title

Description

Date

Category

Tags


关闭：

卡片返回原位置。


必须：

GSAP控制动画。


# ================================
# 九、导航
# ================================

顶部导航：

固定。


默认：

透明。


向下滚动：

出现轻微：

backdrop-filter: blur()


背景：

rgba。


导航不要过度抢视觉。


Logo：

使用原创Logo。


右侧：

Explore


Menu


# ================================
# 十、页面滚动进度
# ================================

页面左侧或者右侧：

细小Scroll Progress。


不要使用传统进度条。


使用：

小圆点 / 细线。


随着滚动：

当前位置变化。


非常克制。


# ================================
# 十一、Lenis
# ================================

使用：

Lenis。


实现：

smooth scrolling。


必须解决：

Lenis + GSAP ScrollTrigger


同步问题。


要求：

正确实现：

ScrollTrigger.update


requestAnimationFrame


不要产生：

ScrollTrigger跳动。


# ================================
# 十二、GSAP架构
# ================================

每个Section：

拥有自己的动画文件。


例如：

animations/hero.ts


animations/creation.ts


不要把所有动画：

全部写在App.vue。


每个动画：

export function initHeroAnimation()


退出：

return cleanup()


组件：

onMounted：

初始化。


onUnmounted：

cleanup。


必须：

kill ScrollTrigger。


kill timeline。


remove event listener。


# ================================
# 十三、Safari兼容
# ================================

这是重点。


必须兼容：

Chrome

Safari


尤其注意：

Safari：

- backdrop-filter
- position: sticky
- transform
- overflow
- viewport height
- 100vh
- 100svh
- 100dvh
- WebGL
- touch scrolling


不要大量使用：

100vh。


优先：

min-height: 100svh;


对于动态视口：

使用：

100dvh


同时提供：

fallback。


例如：

height: 100vh;

height: 100svh;


# ================================
# 十四、Safari动画要求
# ================================

禁止：

依赖：

filter: blur()

的大量高频动画。


不要：

同时对大量DOM：

filter + transform。


优先：

transform

opacity


图片：

使用：

transform: translate3d()


开启：

GPU acceleration。


但是不要滥用：

will-change。


只在动画开始前添加。


动画结束后：

删除。


# ================================
# 十五、移动端
# ================================

必须响应式。


Desktop：

完整动画。


Tablet：

适当减少动画。


Mobile：

保留核心视觉。


但降低：

粒子数量

3D对象

ScrollTrigger复杂度。


检测：

prefers-reduced-motion。


如果用户：

prefers-reduced-motion: reduce


关闭：

复杂动画。


# ================================
# 十六、性能
# ================================

目标：

Desktop：

60FPS。


要求：

避免：

scroll事件直接修改DOM。


禁止：

scroll：

每帧：

querySelector。


必须：

GSAP


requestAnimationFrame。


图片：

lazy loading。


WebP / AVIF。


Three.js：

正确dispose。


页面离开：

释放GPU。


# ================================
# 十七、视觉规范
# ================================

整体：

高级、克制。


不要：

廉价渐变。


颜色：

#FFFFFF

#F7F7F8

#111111

#666666


重点色：

柔和蓝

柔和紫

极淡彩色。


圆角：

16px

24px

32px


阴影：

非常轻。


字体：

优先：

Inter

SF Pro Display 类似风格。


不要直接加载Apple字体。


# ================================
# 十八、禁止事项
# ================================

禁止：

1. 所有section使用相同动画。

2. 大量fadeIn。

3. 大量bounce。

4. 页面出现明显卡顿。

5. ScrollTrigger重复初始化。

6. Three.js内存泄漏。

7. 路由之间互相污染。

8. 所有代码写App.vue。

9. 使用未知CDN资源。

10. 直接复制参考网站源码。

11. 直接使用豆包Logo或品牌素材。


# ================================
# 十九、最终验收标准
# ================================

必须检查：

[ ] Chrome正常

[ ] Safari正常

[ ] Edge正常

[ ] macOS Safari正常

[ ] iOS Safari正常

[ ] 路由刷新正常

[ ] /demo/doubao-inspired可以直接刷新

[ ] 页面滚动没有跳动

[ ] Lenis正常

[ ] ScrollTrigger正常

[ ] Section进入动画正常

[ ] Section退出动画正常

[ ] resize正常

[ ] 移动端正常

[ ] prefers-reduced-motion正常

[ ] Three.js正确dispose

[ ] 无明显内存泄漏

[ ] 无console error


# ================================
# 二十、开发方式
# ================================

非常重要：

不要一次性生成全部代码。


必须：

分阶段开发。


每个阶段完成后：

1. 修改代码
2. 运行项目
3. 检查错误
4. 修复错误
5. 汇报修改文件
6. 汇报运行结果
7. 再进入下一阶段。


不要为了追求代码量：

一次生成大量代码。


优先：

可运行
可维护
可调试
可扩展。

