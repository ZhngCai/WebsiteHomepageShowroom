import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { getQuality, prefersReducedMotion, type QualityProfile } from '@/shared/utils/device'

const STORAGE_KEY = 'acg:settings:v1'

interface PersistedSettings {
  music: boolean
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

  const quality = ref<QualityProfile>(getQuality())
  const currentDemo = ref<string | null>(null)
  const loading = ref(true)
  const loadingProgress = ref(0)
  const activeSection = ref(0)

  const settings = reactive<PersistedSettings>({
    music: false,
    showStats: false,
    cursorFx: true,
    reducedMotion: prefersReducedMotion(),
    ...persisted,
  })

  const isLowEnd = computed(() => quality.value.tier === 'low')

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

  function toggle(key: 'music' | 'showStats' | 'cursorFx') {
    settings[key] = !settings[key]
  }

  return {
    quality,
    currentDemo,
    loading,
    loadingProgress,
    activeSection,
    settings,
    isLowEnd,
    setDemo,
    setLoading,
    setProgress,
    setActiveSection,
    toggle,
  }
})
