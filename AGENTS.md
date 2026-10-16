# AGENTS.md

## 构建与验证

```bash
npm run build       # vue-tsc --noEmit && vite build —— 提交前必须通过
npm run typecheck   # 仅类型检查
npm run dev         # 本地开发（默认 5173，可用 -- --port <n> 指定）
```

## 开发工具

- `code-inspector-plugin`（仅 dev）：`Option/Alt + Shift + 左键点击`页面元素 → 跳转 IDE 源码；`+ 右键` 查看节点树。
  只在 `vite serve` 挂载，生产构建不注入代码。若与浏览器/系统快捷键冲突，改 `vite.config.ts` 中的 `hotKeys`。

## 约定

- 使用 `.devin/` 存放新增的 agent 配置；不要写入 `.claude/`、`.cursor/` 等目录。
- TypeScript 严格模式：仅对公共 API、组件 props 与空数组显式标注类型，其余交给编译器推断。
- 样式嵌套最多 3 层；优先使用 Tailwind 工具类，复杂视觉再写 `scoped` CSS。
- Three.js 对象只允许存在于 `three/` 内，绝不进入 Pinia 或 DOM 组件状态。
- Demo 之间禁止互相引用内部文件；跨 Demo 复用的能力放入 `src/shared/`。
- 新增 Demo：新建 `src/demos/<name>/` 并在 `src/demos/registry.ts` 注册，不修改既有 Demo 代码。

## 手工验收路径

1. `npm run dev` → 打开 `/`：Demo 大厅渲染正常，点击 AI Future Lab / Future Experience / Nebula Odyssey 进入。
2. `/demo/doubao-inspired`：Loading 淡出 → Hero 四阶段进入 → 逐屏滚动经过 8 个 Section：
   Sticky 能力切换（01–04）、逐词排版、图片扩张（0.35 → 1、圆角 40 → 0）、
   **3D 纸牌堆叠 → 扇形 → 横向牌列**（滚动驱动，排列完成后可 hover / 点击聚焦并展开 Glass 面板）、
   横向知识轨道（整节 pin）、圆形音乐视觉（波纹 + 频谱 + 圆环粒子）、终章文字靠近后收缩为圆点。
2. `/demo/future-experience`：Loading 淡出 → Hero 粒子聚合与 3D 文字 → 逐屏滚动经过 8 个章节，
   每节效果不同（文字固定、卡片球、瀑布倾斜、AI 核心、横向时间轴、漂浮磁吸）。
3. 第 3 节：拖动旋转、悬停放大、点击卡片飞出并展开 Glass 信息卡（含 Title/Quote/Date/Location/Tags/语言切换，Esc 关闭）。
4. 第 6 节：垂直滚动转换为水平时间轴（整节被 pin）。
5. 第 8 节与终章：能量球聚合 → 爆炸闪光 → `CREATE THE FUTURE` 浮现。
6. `/demo/nebula`：Loading 淡出 → 粒子聚合 → 逐屏滚动（每屏自动吸附）。
7. 第 3 屏：拖动旋转、悬停放大、点击卡片飞出并展开玻璃信息卡（Esc 关闭）。
8. 第 6 屏与终章：光球聚合 → 爆炸闪光 → `ENTER THE FUTURE` 出现。
9. 控制台无报错；`?quality=low` 可验证移动端降级路径。

## 调试开关

| 参数 | 作用 |
| --- | --- |
| `?nosnap` | 关闭滚动吸附（仅 nebula），便于逐帧检查中间态 |
| `?adaptive=0` | 关闭自适应分辨率（固定 DPR，便于截图对比） |
| `?quality=low\|medium\|high` | 强制 GPU 预算档位 |

开发环境 `window.__afl` 暴露滚动引擎（`manager` / `ScrollTrigger` / `instanceCount()`），`window.__nebula` 暴露 `camera / rig / scene / active() / worlds() / instances()`；
future-experience 额外暴露 `window.__st`（ScrollTrigger）用于检查区间与刷新状态。
