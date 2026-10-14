# Role

你是一名世界顶级 WebGL 创意开发工程师，擅长制作：

- Awwwards 获奖网站
- Apple 官网级滚动体验
- Three.js WebGL 实验
- 数字艺术展览网站


现在请帮我开发一个 Vue3 + Three.js 的沉浸式首页。


项目目标：

制作一个未来数字艺术网站首页。

核心体验：

用户通过滚动鼠标进入6个完全不同的视觉世界。

不是普通网页滚动。

而是：

Scroll = Camera movement

每一次滚动：

进入新的空间。


---

# 技术栈


Vue3

TypeScript

Vite


3D:

Three.js


动画:

GSAP

ScrollTrigger


CSS:

TailwindCSS


辅助:

Lenis Smooth Scroll


要求：

60FPS

GPU优化

移动端降级


---

# 页面整体结构


6个 FullScreen Section


每个Section:

height:100vh


滚动：

- smooth scroll
- snap
- camera transition
- immersive animation


类似：

Apple Vision Pro

https://www.apple.com/apple-vision-pro/

Awwwards WebGL Experience



---

# Section 1

## 星云入口 Nebula Portal


主题：

进入数字宇宙


视觉：

黑色宇宙背景


中心：

巨大透明星球


周围：

百万粒子


滚动效果：


进入页面：

粒子从四周聚集


标题：

从远处3D空间飞入


滚动：

用户向下滚动


摄像机：

穿越星云


效果：

camera.position.z

从：

50

移动到：

0


同时：

粒子产生速度变化


技术：

Three.js Particle System


视觉参考：

Interstellar

NASA


---

# Section 2

## 时间折叠 Time Warp


主题：

时间旅行


视觉：

巨大3D时间环


空间中：

年份

图片

文字


组成：

旋转圆环


滚动效果：


普通垂直滚动


转换为：

360度空间旋转


Camera：

绕圆环旋转


效果：

用户感觉：

穿越时间隧道


技术：

Three.js Curve

GSAP timeline


---

# Section 3

## 3D卡片星球 Card Universe


主题：

记忆宇宙


核心：

参考提供图片


制作：

一个由大量卡片组成的球体。


卡片：

100+

图片Plane


球形排列。


效果：


默认：

球体缓慢旋转


滚动进入：


球体从远处靠近


Camera：

zoom in


卡片散开。


交互：


hover:

卡片放大


click:

卡片飞向屏幕


展开信息面板。



信息面板：

Glassmorphism


类似：

Vision Pro UI


---

# Section 4

## 无限图片空间 Infinite Gallery


主题：

梦境画廊


视觉：

无限图片长廊


大量图片漂浮。


滚动效果：


用户向下滚动


变成：

向前飞行


Camera：

forward movement


图片：

从两侧高速经过


类似：

星际旅行


技术：

Three.js

Shader

Depth effect


---

# Section 5

## AI数据生命体 AI Universe


主题：

人工智能意识空间


视觉：

巨大神经网络


包含：

节点

线

粒子


滚动：

网络从混乱


逐渐：

形成一个AI大脑


效果：

节点连接


粒子流动


Camera：

进入神经网络内部


技术：

BufferGeometry

ShaderMaterial


---

# Section 6

## 世界终点 Singularity


主题：

未来入口


视觉：

所有前面元素融合


粒子

图片

文字

数据


最终：

形成巨大光球。


滚动：

用户靠近光球


光球爆炸


显示：

ENTER THE FUTURE


结束动画。


---

# 通用动画要求


所有Section:

必须有：

进入动画

停留动画

离开动画


使用：

GSAP ScrollTrigger


例如：


onEnter:

start animation


onLeave:

reverse / destroy


---

# 项目结构


src


components/


HeroNebula.vue

TimeWarp.vue

CardUniverse.vue

InfiniteGallery.vue

AIUniverse.vue

Singularity.vue


three/


scene.ts

camera.ts

renderer.ts

particle.ts

shader.ts


utils/


scroll.ts



---

# 开发方式


不要一次生成所有代码。


必须分阶段。


每阶段输出：

1. 文件结构

2. 完整代码

3. 安装依赖

4. 运行效果说明

5. 下一阶段任务


代码必须真实可运行。


禁止伪代码。



# 项目类型说明（重要）

当前项目不是单一官网。

这是一个：

「AI Creative Website Demo Gallery」

项目。

未来会持续增加多个不同风格的官网首页 Demo。

例如：

/demo/nebula

未来宇宙官网


/demo/apple-vision

Apple Vision Pro 风格官网


/demo/nft-gallery

NFT艺术馆官网


/demo/ai-memory

AI数字记忆官网


/demo/fashion

高级品牌官网


因此必须设计成：

多 Demo 独立架构。


禁止：

所有代码写在一个App.vue。

禁止：

所有组件混在一起。


---

# 路由架构要求


使用：

Vue Router 4


路由结构：

/


首页Demo展示大厅



/demo/:demoName


具体官网Demo



示例：

/


Demo Gallery


/demo/card-universe


3D卡片宇宙官网


/demo/ai-memory


AI记忆空间官网


/demo/future-city


未来城市官网



---

# Router设计


创建：

src/router/


index.ts


要求：

支持：

动态路由加载。


例如：

const demos = [
 {
  name:'card-universe',
  component:
  ()=>import('@/demos/cardUniverse/App.vue')
 }
]


自动注册Demo。


未来增加Demo：

只需要：

新增文件夹

添加配置。


---

# 项目目录必须如下


src/


├── main.ts


├── App.vue


├── router/


│
├── index.ts


├── routes.ts



├── demos/


│
│
├── gallery/


│   ├── App.vue
│   ├── components/
│   ├── scenes/
│   ├── assets/
│   └── three/


│
├── cardUniverse/


│   ├── App.vue
│   ├── components/
│   │
│   ├── sections/
│   │
│   ├── three/
│   │
│   ├── shaders/
│   │
│   └── assets/


│
├── aiMemory/


│
├── futureCity/


│
└── shared/


    公共组件


    ├── Navbar.vue

    ├── Loading.vue

    ├── Cursor.vue

    ├── Transition.vue



---

# Demo隔离原则


每个官网Demo：

必须拥有自己的：

1. Vue入口


App.vue



2. 页面组件


sections/


3. Three.js环境


three/


4. 静态资源


assets/


5. 样式


style.scss



不能：

跨Demo直接引用内部组件。


例如：

禁止：

cardUniverse/components/Card.vue

被：

aiMemory使用。


如果需要共享：

放入：

shared/


---

# Three.js架构要求


每个Demo：

拥有独立Scene。


例如：


demos/cardUniverse/three/


SceneManager.ts

Camera.ts

Renderer.ts

Animation.ts



禁止：

全局只有一个Three Scene。


原因：

不同官网效果：

需要独立生命周期。


进入Demo：

创建Scene。


离开Demo：

销毁：

renderer

geometry

texture

event listener


防止：

GPU内存泄漏。


---

# Demo加载动画


进入任何Demo：


显示：

Loading Screen


例如：

Loading 3D Experience...


加载：

texture

model

shader



完成：

执行：

fade transition


---

# Demo之间切换动画


从：

/demo/a


进入：

/demo/b



不要直接跳转。


需要：


旧页面：

camera zoom out


粒子消散


新页面：

camera zoom in


粒子聚合



类似：

Apple官网页面切换。


---

# 首页Demo大厅


创建：

src/pages/Home/


展示：

所有官网Demo卡片。



每个Demo:

包含：


封面图

名称

描述

技术栈


例如：


Card Universe

Three.js
GSAP
WebGL


点击：

进入Demo。



---

# 状态管理


使用：

Pinia


只管理：

全局状态。


例如：

- 当前Demo
- 音乐状态
- 用户设置


禁止：

保存Three对象。


Three对象：

必须局部管理。


---

# 性能要求


多个Demo存在情况下：


必须：

按需加载。


使用：

dynamic import



例如：


访问：

/demo/cardUniverse


才加载：

cardUniverse代码。


不要：

首次加载所有Demo。


---

# 代码规范


每个Demo必须：

独立运行。


例如：

进入：

/demo/cardUniverse


刷新页面：

正常显示。



不能依赖：

之前Demo状态。



---

# 后续增加新官网Demo流程


新增：


src/demos/newDemo/


创建：

App.vue


添加：

routes配置


即可运行。


不要修改：

已有Demo代码。


