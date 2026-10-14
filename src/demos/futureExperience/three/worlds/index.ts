/**
 * 世界工厂注册表 —— 5 个 3D 章节按索引注册，SceneManager 按需实例化。
 * 新增/替换某个世界只需修改这里，不触碰其它世界代码。
 */
import { getQuality } from '@/shared/utils/device'
import type { WorldFactory } from '../SceneManager'

export function createWorldFactories(): WorldFactory[] {
  const quality = getQuality()

  return []
}
