/**
 * Demo 注册表 —— 新增 Demo 只需在此追加一条记录，
 * 路由 / 首页大厅 / 状态管理会自动生效，无需改动任何既有代码。
 */

export interface DemoMeta {
  name: string
  title: string
  tagline: string
  description: string
  stack: string[]
  accent: string
  cover: string
  sections: string[]
}

export interface DemoEntry extends DemoMeta {
  load: () => Promise<unknown>
}

export const demos: DemoEntry[] = [
  {
    name: 'doubao-inspired',
    title: 'AI Future Lab',
    tagline: '高端 AI 产品官网',
    description:
      '浅色极简的高级 AI 官网。8 个 Section 各自拥有独立的滚动叙事：Sticky 能力切换、逐词排版、图片扩张、3D 纸牌折叠展开、横向知识轨道、圆形音乐视觉与极简收尾。',
    stack: ['Vue3', 'GSAP', 'ScrollTrigger', 'Lenis', 'SCSS'],
    accent: '#5b7cfa',
    cover:
      'radial-gradient(120% 120% at 78% 8%, #8b7cf633 0%, transparent 46%), linear-gradient(160deg, #ffffff 0%, #eef1ff 46%, #f7f7f8 100%)',
    sections: [
      'Hero',
      'Capabilities',
      'Writing',
      'Visual Creation',
      'Card Collection',
      'Knowledge',
      'Rhythm',
      'Ending',
    ],
    load: () => import('@/demos/doubaoInspired/App.vue'),
  },
  {
    name: 'future-experience',
    title: 'Future Experience',
    tagline: '高级品牌官网',
    description:
      '8 个 Section（4 全屏 + 4 非全屏），每个 Section 拥有完全不同的滚动效果：宇宙粒子推进、品牌故事视差、3D 卡片球、产品瀑布、AI 神经网络、横向时间轴、漂浮空间与奇点终章。',
    stack: ['Vue3', 'Three.js', 'GSAP', 'Lenis', 'Pinia'],
    accent: '#d8b26a',
    cover:
      'radial-gradient(120% 120% at 78% 12%, #d8b26a44 0%, transparent 46%), linear-gradient(150deg, #12100c 0%, #4a3a1c 48%, #05060c 100%)',
    sections: [
      'Cosmic Hero',
      'Brand Story',
      'Card Universe',
      'Product Gallery',
      'AI Neural',
      'Timeline',
      'Floating',
      'Singularity',
    ],
    load: () => import('@/demos/futureExperience/App.vue'),
  },
  {
    name: 'nebula',
    title: 'Nebula Odyssey',
    tagline: '未来数字艺术官网',
    description:
      '滚动即穿越：星云入口 → 时间折叠 → 卡片星球 → 无限画廊 → AI 宇宙 → 奇点。六屏六世界，Scroll = Camera Movement。',
    stack: ['Vue3', 'Three.js', 'GSAP', 'Lenis', 'Shader'],
    accent: '#7c5cff',
    cover:
      'radial-gradient(120% 120% at 20% 10%, #2ee6ff33 0%, transparent 45%), linear-gradient(140deg, #120c2e 0%, #3b1f7a 45%, #05060f 100%)',
    sections: ['Nebula Portal', 'Time Warp', 'Card Universe', 'Infinite Gallery', 'AI Universe', 'Singularity'],
    load: () => import('@/demos/nebula/App.vue'),
  },
]

export const plannedDemos: DemoMeta[] = [
  {
    name: 'apple-vision',
    title: 'Vision Space',
    tagline: 'Apple 级产品页',
    description: 'Vision Pro 风格的滚动叙事、玻璃材质与镜头语言。',
    stack: ['Vue3', 'Three.js', 'GSAP'],
    accent: '#9fb4ff',
    cover: 'linear-gradient(150deg, #1b2233 0%, #47536e 50%, #0a0d14 100%)',
    sections: ['Product Reveal', 'Feature Grid', 'Buy'],
  },
  {
    name: 'nft-gallery',
    title: 'NFT Vault',
    tagline: '数字艺术馆',
    description: '无限展墙、作品详情抽屉与竞拍信息面板。',
    stack: ['Vue3', 'WebGL', 'Pinia'],
    accent: '#ff5fa2',
    cover: 'linear-gradient(150deg, #2a0a1d 0%, #7b2352 55%, #0b0509 100%)',
    sections: ['Curated', 'Auctions', 'Artist'],
  },
  {
    name: 'ai-memory',
    title: 'AI Memory',
    tagline: 'AI 数字记忆',
    description: '以神经网络结构可视化个人记忆与语义检索。',
    stack: ['Vue3', 'Three.js', 'Shader'],
    accent: '#2ee6ff',
    cover: 'linear-gradient(150deg, #06222b 0%, #0d6b7d 55%, #04090c 100%)',
    sections: ['Recall', 'Graph', 'Timeline'],
  },
  {
    name: 'future-city',
    title: 'Future City',
    tagline: '未来城市官网',
    description: '程序化生成的城市天际线，昼夜与天气实时切换。',
    stack: ['Vue3', 'Three.js', 'Instancing'],
    accent: '#ffc46b',
    cover: 'linear-gradient(150deg, #2a1e06 0%, #8a6420 55%, #0a0803 100%)',
    sections: ['Skyline', 'Transit', 'Energy'],
  },
]

export function findDemo(name: string) {
  return demos.find((demo) => demo.name === name)
}
