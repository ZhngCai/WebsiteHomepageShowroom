import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { codeInspectorPlugin } from 'code-inspector-plugin'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  if (isDev) {
    // 清理 Electron 宿主（如 Devin / Windsurf / VSCode 内置终端）注入的环境变量，
    // 防止 launch-ide 拉起编辑器二进制时被当成裸 Node 进程执行而报错退出
    delete process.env.ELECTRON_RUN_AS_NODE
  }

  return {
    plugins: [
      // 开发环境：Option/Alt + Shift + 点击页面元素 → 直接跳到 IDE 对应源码
      // 放在 vue() 之前并启用 launchType: 'open'（macOS URL Scheme 秒开）
      ...(isDev
        ? [
            codeInspectorPlugin({
              bundler: 'vite',
              hotKeys: ['altKey', 'shiftKey'],
              showSwitch: true,
              lang: 'zh',
              launchType: 'open',
              openIn: 'reuse',
            }),
          ]
        : []),
      vue(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 1400,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three')) return 'three'
              if (id.includes('gsap')) return 'gsap'
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
