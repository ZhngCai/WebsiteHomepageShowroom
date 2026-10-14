# Role

你是一名世界顶级 Web Creative Developer。

擅长：

- Awwwards 获奖官网
- Apple 官网交互
- Three.js WebGL
- GSAP 高级动画
- Smooth Scroll Experience
- Digital Art Experience


现在帮我开发一个高级品牌官网首页 Demo。


项目名称：

Future Experience Website


目标：

制作一个具有电影级体验的网站首页。


不是传统网页。

核心：

Scroll = Experience


用户滚动页面时：

不是简单上下移动。

而是：

进入不同视觉空间。


---

# 技术栈


Frontend:

Vue3

TypeScript

Vite


Animation:

GSAP

ScrollTrigger


Smooth:

Lenis


3D:

Three.js


CSS:

TailwindCSS


状态:

Pinia


---

# 核心要求


页面包含：

8个Section。


其中：


## Full Screen Sections

4个：

height:100vh



## Normal Sections

4个：

根据内容高度。


不能全部100vh。


---

# 滚动体验要求


每个Section：

必须拥有独立滚动效果。


禁止：

8个模块全部fade进入。


每个模块必须不同。


要求：

丝滑

高级

有空间感


参考：

Apple

Awwwards

Linear

Vercel

Stripe


---

# 多Demo项目架构


这个项目属于：

Creative Website Demo Gallery


未来会加入：

多个官网首页。


必须隔离。


---

# Router


使用：

Vue Router 4


结构：


/


Demo展示大厅


/demo/future-experience


当前官网


/demo/apple-style


未来官网


/demo/xxx


未来扩展



---

# 文件结构


src/


├── router/


├── pages/


│
└── HomeGallery.vue



├── demos/


│
└── futureExperience/


    ├── App.vue


    ├── sections/


    │
    ├── HeroSection.vue


    │
    ├── StorySection.vue


    │
    ├── CardUniverse.vue


    │
    ├── GallerySection.vue


    │
    ├── AISection.vue


    │
    ├── ProductSection.vue


    │
    ├── FutureSection.vue


    │
    └── EndingSection.vue



    ├── three/


    │
    ├── SceneManager.ts


    ├── Camera.ts


    ├── Renderer.ts


    └── Animation.ts



    ├── shaders/


    ├── assets/


    └── styles/



├── shared/


公共组件



---

# Three.js要求


每个Demo：

独立Scene。


进入：

初始化。


离开：

销毁。


释放：

texture

geometry

material

event listener


避免GPU泄漏。



---

# 八个模块设计


================================================


# Section 1 FULL SCREEN

## Cosmic Hero


主题：

未来入口


视觉：


黑色宇宙。


中心：

巨大3D文字。


背景：

粒子星云。


动画：


进入：

粒子聚合。


滚动：


camera向前推进。


用户感觉：

穿越宇宙。


技术：

Three.js Particle


================================================


# Section 2 NORMAL


## Luxury Brand Story


非全屏。


高度：

120vh


视觉：


高级品牌介绍。


图片+文字。


滚动效果：


文字固定。


图片：

缓慢放大。


产生：

视差。


类似：

Apple产品介绍页。


技术：

GSAP pin



================================================


# Section 3 FULL SCREEN


## 3D Card Universe


重点模块。


全屏。


制作：

3D卡片球。


效果：

一个空间中的球体。


由：

100+图片卡片组成。



卡片：

PlaneGeometry


球形排列。


自动旋转。


鼠标：

拖动旋转。


hover：

卡片放大。


点击：

卡片飞向镜头。


然后显示：

信息卡片。



信息卡：


Glass UI


内容：


Title


Quote


Date


Location


Tags


Language Button



动画：

GSAP Flip


关闭：

返回球体。



================================================


# Section 4 NORMAL


## Infinite Product Gallery


非全屏。


图片瀑布。


滚动：

图片产生3D倾斜。


效果：

滚轮控制：

图片速度。


类似：

高级摄影网站。



================================================


# Section 5 FULL SCREEN


## AI Neural World


全屏。


主题：

AI意识空间。



视觉：

神经网络。


节点。

连线。

粒子。


滚动：

camera进入网络内部。


技术：

BufferGeometry


ShaderMaterial



================================================


# Section 6 NORMAL


## Horizontal Timeline


非全屏。


高度：

200vh


滚动：

垂直转水平。



效果：


时间轴横向展开。


图片卡片移动。


类似：

Apple Watch官网。


技术：

ScrollTrigger pin



================================================


# Section 7 NORMAL


## Floating Objects


非全屏。


大量3D物体漂浮。


滚动：

物体旋转。


鼠标：

磁吸。


效果：

空间展览馆。



================================================


# Section 8 FULL SCREEN


## Singularity Ending


最终章节。


全屏。


所有元素：

融合。


粒子

卡片

图片

文字



形成：

巨大能量球。



最后：

显示：

CREATE THE FUTURE



================================================



# 动画标准


所有动画：

使用：

GSAP Timeline


禁止：

大量CSS animation。



要求：

60FPS。


动画：

ease:

power3.out


smooth:

true



---

# 开发流程


禁止一次生成全部代码。


必须阶段开发。



每个阶段输出：

1. 文件结构

2. 完整代码

3. 安装依赖

4. 运行方式

5. 下一阶段


