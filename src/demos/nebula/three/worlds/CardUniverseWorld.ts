import { createCardSphere } from '@/shared/three/CardSphere'
import type { QualityProfile } from '@/shared/utils/device'
import { worldZ } from '../scene'
import { BaseWorld, exitFade, type FrameContext } from '../World'
import { CARD_CLOSE_EVENT, emitCardClose, emitCardFocus } from '../../utils/events'

const PALETTES = ['Ultraviolet', 'Aurora', 'Ember', 'Abyss', 'Neon Bloom', 'Ion', 'Solar Dust', 'Void']
const TAGS = ['Memory', 'Signal', 'Fragment', 'Archive', 'Echo', 'Trace']

/**
 * 03 卡片星球 —— 100 张图片卡片球形排列。
 * 交互与飞出动效由 shared/three/CardSphere 提供（与 future-experience 共用）。
 */
export class CardUniverseWorld extends BaseWorld {
  readonly id = 'card-universe'
  readonly index = 2

  private readonly quality: QualityProfile
  private sphere: ReturnType<typeof createCardSphere> | null = null
  private progress = 0

  constructor(quality: QualityProfile) {
    super()
    this.quality = quality
  }

  protected onBuild() {
    this.group.position.z = worldZ(this.index)

    this.sphere = createCardSphere({
      count: this.quality.cards,
      accent: '#ff5fa2',
      closeEvent: CARD_CLOSE_EVENT,
      onFocus: ({ index, tile, rect }) =>
        emitCardFocus({
          id: index,
          tile,
          title: `MEMORY #${String(index + 1).padStart(3, '0')}`,
          year: String(2014 + (index % 12)),
          palette: PALETTES[index % PALETTES.length],
          tag: TAGS[index % TAGS.length],
          rect,
        }),
      onClose: () => emitCardClose(),
    })

    this.group.add(this.sphere.group)
  }

  protected onEnter() {
    this.sphere?.attach()
    this.sphere?.gatherIn(1.8, 0.2)
  }

  protected onLeave() {
    this.sphere?.detach()
    this.sphere?.close()
  }

  setProgress(progress: number) {
    this.progress = progress
    this.sphere?.setScatter(progress)
    // 注意：不在此处按进度自动收回卡片。
    // 章节起点进度同样是 0，会被误判为「已滚离」而立刻关闭刚打开的卡片；
    // 收回交由世界失活（onLeave）处理。
  }

  update(ctx: FrameContext) {
    // 飞离淡出：相机在「无限画廊」章节初段仍停在球体内部，
    // 必须按本章节进度主动淡出，否则卡片会压住下一个章节的画面
    this.sphere?.setOpacity(exitFade(this.progress))
    this.sphere?.update({ time: ctx.time, delta: ctx.delta, camera: ctx.camera })
  }

  dispose() {
    this.sphere?.dispose()
    super.dispose()
  }
}
