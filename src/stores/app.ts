import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { getQuality, prefersReducedMotion, type QualityProfile } from '@/shared/utils/device'

const STORAGE_KEY = 'acg:settings:v1'

interface PersistedSettings {
  showStats: boolean
  cursorFx: boolean
  reducedMotion: boolean
}

function readSettings(): Partial<PersistedSettings> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<PersistedSettings>
  } catch (error) {
    console.warn('[store] 设置读取失败，使用默认值:', error)
    return {}
  }
}

export const useAppStore = defineStore('app', () => {
  const persisted = readSettings()

  /** GPU 预算档位（只存普通数据，绝不保存 Three 对象） */
  const quality = ref<QualityProfile>(getQuality())
  const currentDemo = ref<string | null>(null)
  const loading = ref(true)
  const loadingProgress = ref(0)
  const activeSection = ref(0)

  const settings = reactive<PersistedSettings>({
    showStats: false,
    cursorFx: true,
    reducedMotion: prefersReducedMotion(),
    ...persisted,
  })

  const qualityLabel = computed(() => `${quality.value.tier} · ${quality.value.cards} cards`)

  watch(
    settings,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch (error) {
        console.warn('[store] 设置持久化失败:', error)
      }
    },
    { deep: true },
  )

  function setDemo(name: string | null) {
    currentDemo.value = name
  }

  function setLoading(value: boolean) {
    loading.value = value
    if (!value) loadingProgress.value = 1
  }

  function setProgress(value: number) {
    loadingProgress.value = Math.min(1, Math.max(0, value))
  }

  function setActiveSection(index: number) {
    activeSection.value = index
  }

  function toggleStats() {
    settings.showStats = !settings.showStats
  }

  return {
    quality,
    qualityLabel,
    currentDemo,
    loading,
    loadingProgress,
    activeSection,
    settings,
    setDemo,
    setLoading,
    setProgress,
    setActiveSection,
    toggleStats,
  }
})
