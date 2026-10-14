import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { codeInspectorPlugin } from 'code-inspector-plugin'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    plugins: [
      vue(),
      tailwindcss(),
      // 开发环境：Option/Alt + Shift + 点击页面元素 → 直接跳到 IDE 对应源码
      // 只在 serve 阶段挂载，生产构建不会注入任何相关代码
      ...(isDev
        ? [
            codeInspectorPlugin({
              bundler: 'vite',
              hotKeys: ['altKey', 'shiftKey'],
              showSwitch: true,
              lang: 'zh',
            }),
          ]
        : []),
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
