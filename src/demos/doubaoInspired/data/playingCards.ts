import { mulberry32 } from '@/shared/utils/art'

export interface PlayingCardData {
  id: number
  number: string
  title: string
  line: string
  category: string
  date: string
  tags: string[]
  seed: number
}

/** 12 张「未来艺术收藏卡」——原创内容 */
export const playingCards: PlayingCardData[] = [
  { id: 1, number: '01', title: 'THINK', line: 'Ideas begin with curiosity.', category: 'Cognition', date: '2026.01', tags: ['Mind', 'Seed'], seed: 1101 },
  { id: 2, number: '02', title: 'CREATE', line: 'Turn imagination into reality.', category: 'Creation', date: '2026.02', tags: ['Form', 'Light'], seed: 2202 },
  { id: 3, number: '03', title: 'REASON', line: 'Every step can be verified.', category: 'Logic', date: '2026.03', tags: ['Chain', 'Proof'], seed: 3303 },
  { id: 4, number: '04', title: 'ACT', line: 'Understanding becomes doing.', category: 'Agent', date: '2026.04', tags: ['Tool', 'Flow'], seed: 4404 },
  { id: 5, number: '05', title: 'DREAM', line: 'The future is imagined first.', category: 'Vision', date: '2026.05', tags: ['Dream', 'Blue'], seed: 5505 },
  { id: 6, number: '06', title: 'BUILD', line: 'Small parts, calm systems.', category: 'Craft', date: '2026.06', tags: ['Stack', 'Order'], seed: 6606 },
  { id: 7, number: '07', title: 'LEARN', line: 'Every question refines it.', category: 'Growth', date: '2026.07', tags: ['Loop', 'Data'], seed: 7707 },
  { id: 8, number: '08', title: 'SHARE', line: 'Knowledge grows when given.', category: 'Human', date: '2026.08', tags: ['Open', 'Voice'], seed: 8808 },
  { id: 9, number: '09', title: 'IMAGINE', line: 'Beyond the obvious answer.', category: 'Vision', date: '2026.09', tags: ['Spark', 'Wide'], seed: 9909 },
  { id: 10, number: '10', title: 'EXPLORE', line: 'Search is a way of thinking.', category: 'Search', date: '2026.10', tags: ['Map', 'Deep'], seed: 1010 },
  { id: 11, number: '11', title: 'REFINE', line: 'Details decide the quality.', category: 'Craft', date: '2026.11', tags: ['Polish', 'Calm'], seed: 1111 },
  { id: 12, number: '12', title: 'ARRIVE', line: 'The future is already here.', category: 'Future', date: '2026.12', tags: ['End', 'Start'], seed: 1212 },
]

/** 每张卡片的图像：程序化生成的浅色艺术图（无外部素材） */
export function createCardArt(seed: number, width = 480, height = 620) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('[afl] 2D 上下文不可用')

  const random = mulberry32(seed)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  const palettes = [
    ['rgba(91, 124, 250, 0.35)', 'rgba(139, 124, 246, 0.28)'],
    ['rgba(139, 124, 246, 0.34)', 'rgba(91, 124, 250, 0.22)'],
    ['rgba(46, 230, 255, 0.22)', 'rgba(91, 124, 250, 0.3)'],
  ]
  const [c1, c2] = palettes[seed % palettes.length]

  const glow = ctx.createLinearGradient(0, 0, width, height)
  glow.addColorStop(0, c1)
  glow.addColorStop(1, c2)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  // 柔光团
  for (let i = 0; i < 3; i++) {
    const radius = width * (0.3 + random() * 0.5)
    const x = random() * width
    const y = random() * height
    const radial = ctx.createRadialGradient(x, y, 0, x, y, radius)
    radial.addColorStop(0, 'rgba(255,255,255,0.85)')
    radial.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = radial
    ctx.fillRect(0, 0, width, height)
  }

  // 结构线
  ctx.strokeStyle = 'rgba(17, 17, 17, 0.09)'
  ctx.lineWidth = 1
  for (let i = 1; i < 6; i++) {
    const y = (i / 6) * height
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 几何体
  ctx.globalAlpha = 0.2
  for (let i = 0; i < 3; i++) {
    const size = width * (0.16 + random() * 0.3)
    ctx.fillStyle = i % 2 === 0 ? '#5b7cfa' : '#8b7cf6'
    ctx.beginPath()
    ctx.arc(random() * width, random() * height, size / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // 颗粒
  ctx.globalAlpha = 0.06
  ctx.fillStyle = '#111111'
  const grains = Math.floor(width * height * 0.0012)
  for (let i = 0; i < grains; i++) {
    ctx.fillRect(random() * width, random() * height, 1, 1)
  }
  ctx.globalAlpha = 1

  return canvas.toDataURL('image/jpeg', 0.88)
}
