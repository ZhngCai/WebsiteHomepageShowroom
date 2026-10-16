# AI Creative Gallery · 沉浸式官网展厅

Vue3 + TypeScript + Three.js 打造的高端 WebGL 体验集合。每个 Demo 独立运行、独立场景、独立生命周期 —— **进入即创建，离开即销毁**。

| Demo | 路由 | 核心体验 |
| --- | --- | --- |
| **AI Future Lab** | `/demo/doubao-inspired` | 浅色极简高级 AI 官网：8 个 Section 各自独立的滚动叙事（Sticky 能力切换 / 逐词排版 / 图片扩张 / **3D 纸牌折叠展开** / 横向知识轨道 / 圆形音乐视觉 / 极简收尾） |
| **Future Experience** | `/demo/future-experience` | 8 个 Section（4 全屏 + 4 非全屏），每个 Section 拥有完全不同的滚动效果 |
| **Nebula Odyssey** | `/demo/nebula` | 6 屏六世界，Scroll = Camera Movement |

---

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Vue 3.5（`<script setup>`）+ TypeScript + Vite 7 |
| 3D | Three.js（自定义 ShaderMaterial / InstancedMesh / Points） |
| 动画 | GSAP 3 + ScrollTrigger + Flip |
| 滚动 | Lenis 1.3（与 GSAP ticker / ScrollTrigger 同帧管线） |
| 样式 | TailwindCSS 4（CSS-first `@theme`） |
| 状态 | Pinia（只存普通数据，绝不保存 Three 对象） |

---

## 快速开始

```bash
npm install
npm run dev        # 开发
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览构建产物
npm run typecheck  # 仅类型检查
```

### 点击浏览器元素跳转源码（code-inspector-plugin）

开发环境下按住 **`Option`（Windows 为 `Alt`）+ `Shift` + 左键点击** 页面任意元素，即可在 IDE 中打开对应源码位置（`Option/Alt + Shift + 右键` 查看节点树）；页面左下角也有功能开关。

- 仅在 `vite serve` 阶段挂载，生产构建不注入任何相关代码（已实测 `dist/` 中无 `data-insp-path`）。
- 配置见 <ref_file file="/Applications/my/git/炫酷的官网首页/vite.config.ts" />，客户端界面语言设为中文。

---

## 目录结构

```
src/
├── main.ts                     # 应用入口（Pinia / Router / 全局错误兜底）
├── App.vue                     # 路由出口 + 自定义光标 + 转场
├── router/
│   ├── index.ts                # createRouter + 标题同步 + 滚动复位
│   └── routes.ts               # 由 registry 自动生成 /demo/:name 路由
├── demos/
│   ├── registry.ts             # ★ Demo 注册表：新增 Demo 的唯一入口
│   ├── gallery/                # 首页 Demo 展示大厅
│   ├── futureExperience/       # ★ 8 章节高级品牌官网（Future Experience）
│   │   ├── App.vue
│   │   ├── components/         # MainScene / ScrollContainer / SectionHeading
│   │   ├── sections/           # 8 个 Section（各自独立滚动效果）
│   │   ├── three/
│   │   │   ├── SceneManager.ts # 单渲染器/单场景/单相机 + 世界生命周期
│   │   │   ├── Camera.ts       # 相机装配 + 5 段镜头脚本
│   │   │   ├── Renderer.ts     # 渲染器与自适应分辨率
│   │   │   ├── Animation.ts    # GSAP 注册、统一缓动与进出场
│   │   │   ├── ScrollManager.ts# Lenis + ScrollTrigger + 章节进度与激活世界
│   │   │   ├── World.ts        # 世界接口 / 资源销毁 / 飞离淡出
│   │   │   └── worlds/         # hero / cards / ai / floating / ending
│   │   ├── shaders/            # hero / floating 专用 GLSL
│   │   └── utils/              # scroll / sectionEffect / events / cards
│   └── nebula/                 # 六屏沉浸式体验（Nebula Odyssey）
└── shared/
    ├── Loading.vue / Navbar.vue / Cursor.vue / Transition.vue
    ├── shaders/                # card / neural / singularity / common（跨 Demo 共用 GLSL）
    ├── three/
    │   ├── CardSphere.ts       # 卡片球（球面排列 + 拖动/hover/点击飞出）
    │   ├── Starfield.ts        # 远景星尘
    │   ├── textures.ts         # 程序化艺术图集 / 光晕 / 文字 / 标题纹理
    │   └── debug.ts            # 开发环境 window.__nebula 调试句柄
    └── utils/
        ├── art.ts              # 纯 Canvas 艺术图（3D 贴图与 DOM 图片共用）
        └── device.ts           # 设备档位探测与 GPU 预算
```

---

## AI Future Lab（`/demo/doubao-inspired`）

参考「豆包 about 页」的信息架构与滚动节奏重新设计，**所有 Logo / 文案 / 图片 / 图形均为原创**（图片全部程序化生成）。

| Section | 滚动机制 |
| --- | --- |
| 01 Hero | 四阶段进入（逐行漂入 → 字距展开 → 副标题 → 光晕）+ 滚动离开（标题 scale/位移/淡出，背景反向视差） |
| 02 Capabilities | Sticky 叙事：左侧标题固定，右侧 01–04 连续状态切换（当前 1 / 上一条 0.92 & 0.2 / 下一条 +60px），背景缓慢变色 |
| 03 Writing | 逐词排版：blur → clear + opacity + translateY，随后整段横向位移 |
| 04 Visual Creation | 图片 scale 0.35 → 1、圆角 40px → 0，继续放大后文字视差浮现，离开时缩小上移 |
| 05 Card Collection | **3D Playing Cards：STACK → FAN → HORIZONTAL SPREAD**，同一条 scrubbed timeline 连续衔接，逐张 stagger 展开；排列完成后支持 hover / 3D tilt / 点击聚焦（其余卡片淡出 + Glass 信息面板） |
| 06 Knowledge | 垂直滚动 → 水平轨道（ScrollTrigger pin），内容块以 scale / opacity / rotateY 进入 |
| 07 Rhythm | 圆形视觉系统：核心旋转、波纹扩散、频谱线、Three.js 圆环粒子；文字沿圆运动 |
| 08 Ending | 巨大文字从远处进入 → scale 1 → 4 快速靠近 → 只剩圆点并缓慢缩小 |

结构与生命周期严格按需求：`sections/` + `animations/*.ts`（每个 Section 一个动画模块，`init` 返回 `cleanup`）+ `composables/`（滚动引擎、动画生命周期、媒体查询、减弱动效、纸牌状态）+ `data/`（文案与程序化图像）+ `styles/*.scss` + `three/`（SceneManager / ParticleBackground，仅音乐模块使用，离开即 dispose）。

## Future Experience（`/demo/future-experience`）

8 个 Section —— 4 个全屏 + 4 个非全屏，**每个 Section 的滚动效果都不同**：

| # | Section | 高度 | 滚动效果 | 关键技术 |
| --- | --- | --- | --- | --- |
| 01 | Cosmic Hero | 100vh | 粒子从四周聚合、相机向前推进穿越星云 | Points + 顶点着色器聚合、3D 文字平面 |
| 02 | Luxury Brand Story | 120vh | 文字固定（sticky）、主图放大 + 小图反向视差 | ScrollTrigger scrub |
| 03 | 3D Card Universe | 100vh | 球体自转 / 拖动 / hover 放大 / 点击飞出 | InstancedMesh + GSAP Flip + Glass 信息卡 |
| 04 | Infinite Product Gallery | 内容高度 | 四列瀑布流、列间视差、滚轮速度驱动 3D 倾斜 | ScrollTrigger.getVelocity + ticker 插值 |
| 05 | AI Neural World | 100vh | 1000 节点从混沌聚成 AI 核心、相机进入网络 | BufferGeometry + 自定义 Shader |
| 06 | Horizontal Timeline | 200vh | 垂直滚动转水平展开（pin 整节） | ScrollTrigger pin + scrub |
| 07 | Floating Objects | 内容高度 | 物体漂浮、滚动驱动旋转、鼠标磁吸 | 射线磁力线 + 菲涅尔材质 |
| 08 | Singularity Ending | 170vh（内容 sticky 100vh） | 四类元素聚合为能量球 → 爆炸 → CREATE THE FUTURE | 共享 singularity 着色器 + 相机余震 |

---

## Nebula Odyssey（`/demo/nebula`）

| # | 世界 | 视觉 | 关键技术 |
| --- | --- | --- | --- |
| 01 | 星云入口 Nebula Portal | 万级粒子旋臂星云 + 巨大透明星球 | Points + 顶点着色器聚合、菲涅尔玻璃壳 |
| 02 | 时间折叠 Time Warp | 3D 时间环，年份与影像沿曲线排列 | `TubeGeometry` + `CatmullRomCurve3` + 相机绕环 |
| 03 | 卡片星球 Card Universe | 100 张卡片球形排列 | `InstancedMesh` + 图集 UV 偏移、拖动/悬停/点击飞出 + GSAP Flip |
| 04 | 无限画廊 Infinite Gallery | 环形图片长廊，飞船前进 | 实例化 + 循环回收 + 着色器景深 |
| 05 | AI 宇宙 AI Universe | 1000 节点从混沌聚成大脑 | BufferGeometry + k 近邻突触 + GPU 粒子流动 |
| 06 | 奇点 Singularity | 全部元素聚合为光球并炸开 | 三类来源粒子 + 爆炸冲击 + ENTER THE FUTURE |

---

## 新增一个 Demo

1. 新建 `src/demos/<demoName>/`，包含 `App.vue`、`components/`、`sections/`、`three/`、`shaders/`、`assets/`。
2. 在 `src/demos/registry.ts` 追加一条记录（名称、封面、描述、技术栈、`load`）。
3. 完成 —— 路由 `/demo/<demoName>`、首页大厅卡片、独立场景与销毁逻辑自动接入。

**隔离原则**：Demo 之间禁止互相引用内部组件；需要复用的放入 `shared/`。

---

## 调试开关

| 参数 | 作用 |
| --- | --- |
| `?nosnap` | 关闭滚动吸附，便于逐帧检查中间态 |
| `?adaptive=0` | 关闭自适应分辨率（固定 DPR，便于截图对比） |
| `?quality=low\|medium\|high` | 强制 GPU 预算档位 |

开发环境下 `window.__nebula` 暴露 `camera / rig / scene / active() / worlds()`，用于检查镜头与世界状态。

---

## 性能与降级

- **单渲染器 / 单场景 / 单相机**：六个世界共享一次 draw call 提交，按需构建、按需更新。
- **GPU 优先**：粒子聚合、形态插值、景深、突触流动全部在着色器内完成，CPU 每帧只写 uniform。
- **三档预算**：`high / medium / low` 分别配置粒子数、卡片数、节点数、边数、DPR 与抗锯齿（移动端自动降档）。
- **帧率守卫**：连续掉帧时自动下调渲染分辨率，回到流畅区间再缓慢回升。
- **无障碍**：系统开启「减弱动效」时，Lenis 退化为原生滚动，章节动画只保留淡入。
- **资源释放**：离开 Demo 时销毁 renderer / geometry / material / texture / 事件监听，防止 GPU 内存泄漏。

---

## 说明

- 所有图片资源均为**程序化生成**（Canvas 图集），不依赖任何外部图片，保证 Demo 可离线运行、可复现。
- 需求文档与阶段拆分见 `需求/` 目录。
