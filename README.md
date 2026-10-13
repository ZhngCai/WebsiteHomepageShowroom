# AI Creative Gallery · 沉浸式官网展厅

Vue3 + TypeScript + Three.js 打造的高端 WebGL 体验集合。每个 Demo 独立运行、独立场景、独立生命周期 —— **进入即创建，离开即销毁**。

核心体验（`/demo/nebula`）：**Scroll = Camera Movement**，滚动即前进，六屏六世界。

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
│   └── nebula/                 # 六屏沉浸式体验（本项目核心）
│       ├── App.vue             # Demo 入口：Loading / Navbar / 场景 / 滚动容器
│       ├── style.css
│       ├── components/
│       │   ├── MainScene.vue   # 固定全屏 canvas + 场景与滚动编排
│       │   ├── ScrollContainer.vue  # 6 屏 + 终章空间
│       │   └── SectionShell.vue     # 章节版式（统一进出场标记）
│       ├── sections/           # 六屏 DOM 层（HeroNebula / TimeWarp / …）
│       ├── three/
│       │   ├── SceneManager.ts # 单渲染器/单场景/单相机 + 世界生命周期
│       │   ├── ScrollManager.ts# Lenis + ScrollTrigger + 镜头时间轴 + snap
│       │   ├── cameraPath.ts   # 六段镜头脚本（到达机位 / 穿越机位）
│       │   ├── World.ts        # 世界接口 + 资源销毁
│       │   ├── particles.ts    # 星云粒子系统
│       │   ├── shaders/        # GLSL：星云 / 时间环 / 卡片 / 画廊 / 神经 / 奇点
│       │   └── worlds/         # 六个世界（各自独立，互不引用）
│       └── utils/
│           ├── scroll.ts       # Lenis 工厂 + ScrollTrigger 注册
│           ├── context.ts      # 注入键与章节元数据
│           └── events.ts       # three ↔ DOM 的事件契约
└── shared/
    ├── Loading.vue / Navbar.vue / Cursor.vue / Transition.vue
    ├── three/textures.ts       # 程序化艺术图集 / 光晕 / 文字精灵
    └── utils/device.ts         # 设备档位探测与 GPU 预算
```

---

## 六个世界（`/demo/nebula`）

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
