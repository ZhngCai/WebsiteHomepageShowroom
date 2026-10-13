import type { RouteRecordRaw } from 'vue-router'
import { demos } from '@/demos/registry'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'gallery',
    component: () => import('@/demos/gallery/App.vue'),
    meta: { title: 'Demo Gallery' },
  },
  ...demos.map<RouteRecordRaw>((demo) => ({
    path: `/demo/${demo.name}`,
    name: demo.name,
    component: demo.load,
    meta: { title: demo.title, accent: demo.accent },
  })),
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: { name: 'gallery' },
  },
]
