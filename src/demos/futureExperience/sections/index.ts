import HeroSection from './HeroSection.vue'
import StorySection from './StorySection.vue'
import CardUniverse from './CardUniverse.vue'
import GallerySection from './GallerySection.vue'
import AISection from './AISection.vue'
import ProductSection from './ProductSection.vue'
import FutureSection from './FutureSection.vue'
import EndingSection from './EndingSection.vue'

/** 八个 Section —— 顺序必须与 utils/context.ts 的 sectionList 一致 */
export const sectionComponents = [
  HeroSection,
  StorySection,
  CardUniverse,
  GallerySection,
  AISection,
  ProductSection,
  FutureSection,
  EndingSection,
]
