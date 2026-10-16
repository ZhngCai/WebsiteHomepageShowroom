开始 Phase 12。


现在进行最终性能优化。


目标：

Desktop：

60FPS


Mobile：

尽可能流畅。


检查：

Chrome Performance

Safari Performance。


优化：

DOM数量

Paint

Composite

Layout

Three.js draw calls

Texture size

Image loading

GSAP instances

ScrollTrigger instances。


所有：

onMounted

必须有：

cleanup。


所有：

ScrollTrigger

必须kill。


所有：

Three.js：

geometry.dispose()

material.dispose()

texture.dispose()


最终：

console不能有错误。

