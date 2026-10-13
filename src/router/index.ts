import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0, left: 0 }),
})

router.afterEach((to) => {
  const title = (to.meta.title as string | undefined) ?? 'AI Creative Gallery'
  document.title = `${title} · AI Creative Gallery`
})

router.onError((error) => {
  console.error('[router] 导航失败:', error)
})

export default router
