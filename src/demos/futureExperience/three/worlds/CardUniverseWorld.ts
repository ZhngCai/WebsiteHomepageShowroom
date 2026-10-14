import { createCardSphere } from '@/shared/three/CardSphere'
import type { QualityProfile } from '@/shared/utils/device'
import { cardContent } from '../../utils/cards'
import { CARD_CLOSE_EVENT, emitCardClose, emitCardFocus } from '../../utils/events'
import { worldZ } from '../Camera'
import { BaseWorld, exitFade, type FrameContext } from '../World'

/**
 * 02 Card Universe —— 100+ 张图片卡片的球体。
 * 自动旋转 / 拖动 / hover 放大 / 点击飞向镜头并展开玻璃信息卡。
 * 卡片球实现见 shared/three/CardSphere（与 nebula demo 共用）。
 */
export class CardUniverseWorld extends BaseWorld {
  readonly id = 'cards'
  readonly index = 1

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
      count: this.quality.futureCards,
      accent: '#d8b26a',
      closeEvent: CARD_CLOSE_EVENT,
      onFocus: ({ index, tile, rect }) => emitCardFocus({ index, tile, rect, ...cardContent(index) }),
      onClose: () => emitCardClose(),
    })

    this.group.add(this.sphere.group)
  }

  protected onEnter() {
    this.sphere?.attach()
    this.sphere?.gatherIn(1.8, 0.2)
  }

  protected onLeave() {
    // 只解除交互并收回飞出的卡片；球体本身由着色器的距离淡出接管
    this.sphere?.detach()
    this.sphere?.close()
  }

  setProgress(progress: number) {
    this.progress = progress
    this.sphere?.setScatter(progress)
  }

  update(ctx: FrameContext) {
    // 飞离淡出：相机在「产品瀑布」章节初段仍停在球体内部，
    // 必须按本章节进度主动淡出，否则卡片会压住下一个章节的画面
    this.sphere?.setOpacity(exitFade(this.progress))
    this.sphere?.update({ time: ctx.time, delta: ctx.delta, camera: ctx.camera })
  }

  dispose() {
    this.sphere?.dispose()
    super.dispose()
  }
}
