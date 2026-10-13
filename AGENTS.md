# AGENTS.md

## 构建与验证

```bash
npm run build       # vue-tsc --noEmit && vite build —— 提交前必须通过
npm run typecheck   # 仅类型检查
npm run dev         # 本地开发（默认 5173，可用 -- --port <n> 指定）
```

## 约定

- 使用 `.devin/` 存放新增的 agent 配置；不要写入 `.claude/`、`.cursor/` 等目录。
- TypeScript 严格模式：仅对公共 API、组件 props 与空数组显式标注类型，其余交给编译器推断。
- 样式嵌套最多 3 层；优先使用 Tailwind 工具类，复杂视觉再写 `scoped` CSS。
- Three.js 对象只允许存在于 `three/` 内，绝不进入 Pinia 或 DOM 组件状态。
- Demo 之间禁止互相引用内部文件；跨 Demo 复用的能力放入 `src/shared/`。
- 新增 Demo：新建 `src/demos/<name>/` 并在 `src/demos/registry.ts` 注册，不修改既有 Demo 代码。

## 手工验收路径

1. `npm run dev` → 打开 `/`：Demo 大厅渲染正常，点击 Nebula Odyssey 进入。
2. `/demo/nebula`：Loading 淡出 → 粒子聚合 → 逐屏滚动（每屏自动吸附）。
3. 第 3 屏：拖动旋转、悬停放大、点击卡片飞出并展开玻璃信息卡（Esc 关闭）。
4. 第 6 屏与终章：光球聚合 → 爆炸闪光 → `ENTER THE FUTURE` 出现。
5. 控制台无报错；`?quality=low` 可验证移动端降级路径。
