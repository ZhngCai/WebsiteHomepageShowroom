/**
 * 世界工厂注册表 —— 六个世界按索引注册，SceneManager 按需实例化。
 * 新增/替换某个世界只需修改这里，不触碰其它世界代码。
 */
import { getQuality } from '@/shared/utils/device'
import type { WorldFactory } from '../SceneManager'
import { CardUniverseWorld } from './CardUniverseWorld'
import { GalleryWorld } from './GalleryWorld'
import { NebulaWorld } from './NebulaWorld'
import { NeuralWorld } from './NeuralWorld'
import { SingularityWorld } from './SingularityWorld'
import { TimeWarpWorld } from './TimeWarpWorld'

export function createWorldFactories(): WorldFactory[] {
  const quality = getQuality()

  return [
    () => new NebulaWorld(quality),
    () => new TimeWarpWorld(quality),
    () => new CardUniverseWorld(quality),
    () => new GalleryWorld(quality),
    () => new NeuralWorld(quality),
    () => new SingularityWorld(quality),
  ]
}
