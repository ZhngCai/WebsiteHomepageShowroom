/**
 * 设备能力探测 —— 用于移动端降级与 GPU 预算分配。
 */

export type QualityTier = 'high' | 'medium' | 'low'

export interface QualityProfile {
  tier: QualityTier
  dpr: number
  antialias: boolean
  nebulaParticles: number
  timeRingCards: number
  cards: number
  galleryTiles: number
  neuralNodes: number
  neuralEdges: number
  flowParticles: number
  singularityParticles: number
}

const PROFILES: Record<QualityTier, Omit<QualityProfile, 'tier'>> = {
  high: {
    dpr: 2,
    antialias: true,
    nebulaParticles: 12000,
    timeRingCards: 12,
    cards: 100,
    galleryTiles: 260,
    neuralNodes: 1000,
    neuralEdges: 2200,
    flowParticles: 700,
    singularityParticles: 9000,
  },
  medium: {
    dpr: 1.6,
    antialias: true,
    nebulaParticles: 7000,
    timeRingCards: 10,
    cards: 72,
    galleryTiles: 170,
    neuralNodes: 700,
    neuralEdges: 1500,
    flowParticles: 420,
    singularityParticles: 5200,
  },
  low: {
    dpr: 1.25,
    antialias: false,
    nebulaParticles: 3600,
    timeRingCards: 8,
    cards: 48,
    galleryTiles: 100,
    neuralNodes: 420,
    neuralEdges: 900,
    flowParticles: 220,
    singularityParticles: 2600,
  },
}

function detectTier(): QualityTier {
  if (typeof window === 'undefined') return 'medium'

  const ua = navigator.userAgent
  const isMobile = /Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i.test(ua)
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 620

  if (isMobile || smallScreen) return cores >= 8 && memory >= 6 ? 'medium' : 'low'
  if (cores <= 4 || memory <= 4) return 'medium'
  return 'high'
}

let cached: QualityProfile | null = null

export function getQuality(): QualityProfile {
  if (!cached) {
    // 允许用 ?quality=low|medium|high 强制指定档位（用于演示与回归对比）
    const override = new URLSearchParams(location.search).get('quality')
    const tier: QualityTier =
      override === 'low' || override === 'medium' || override === 'high' ? override : detectTier()

    cached = { tier, ...PROFILES[tier] }
  }
  return cached
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isTouchDevice() {
  return typeof window !== 'undefined' && (window.matchMedia('(hover: none)').matches || 'ontouchstart' in window)
}
