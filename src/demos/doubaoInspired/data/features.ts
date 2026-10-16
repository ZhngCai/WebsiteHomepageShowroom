/**
 * AI Future Lab —— 全部文案与内容数据（原创，不引用任何第三方品牌素材）
 */

export interface Capability {
  id: string
  index: string
  title: string
  description: string
  meta: string
}

/** Section 02：AI 模型能力（Sticky Scroll Storytelling 的 01~04） */
export const capabilities: Capability[] = [
  {
    id: 'understand',
    index: '01',
    title: 'UNDERSTAND',
    description: '读得懂上下文，也读得懂言外之意。模型在长文本中保持连贯理解，把模糊的问题变成清晰的结构。',
    meta: 'Context · 1M tokens',
  },
  {
    id: 'create',
    index: '02',
    title: 'CREATE',
    description: '从一句提示到完整作品。文字、图像、结构与节奏，都由同一个意图驱动。',
    meta: 'Multimodal · Text / Image',
  },
  {
    id: 'reason',
    index: '03',
    title: 'REASON',
    description: '推理不是猜答案，而是一步步验证。复杂问题被拆成可检查的中间结论。',
    meta: 'Chain of thought · Verifiable',
  },
  {
    id: 'act',
    index: '04',
    title: 'ACT',
    description: '理解之后动手完成：调用工具、编排流程、交付结果，并留下可追溯的过程。',
    meta: 'Agentic · Tool use',
  },
]

/** Section 03：写作能力（逐词进入的排版动画） */
export const writingLines = [
  { text: 'Turn ideas', accent: false },
  { text: 'into words.', accent: true },
  { text: 'Then into', accent: false },
  { text: 'something real.', accent: true },
]

/** Section 05：知识 / AI 搜索（横向轨道） */
export interface KnowledgeItem {
  step: string
  title: string
  description: string
}

export const knowledgeTrack: KnowledgeItem[] = [
  { step: '01', title: 'DISCOVER', description: '从海量信息中找到真正相关的那一部分。' },
  { step: '02', title: 'SEARCH', description: '跨文档、跨模态检索，答案不再只藏在一处。' },
  { step: '03', title: 'UNDERSTAND', description: '把碎片拼成结构，让信息之间产生联系。' },
  { step: '04', title: 'ANSWER', description: '给出可核查的结论，并标注每一条依据。' },
  { step: '05', title: 'EVOLVE', description: '每一次提问，都让知识库更接近你的语境。' },
]

/** Section 04：视觉创作（图片扩张 + 视差文字） */
export const creationCopy = {
  eyebrow: 'Visual Creation',
  title: '让画面自己展开',
  description: '从一枚小小的缩略图开始，随着滚动逐渐铺满整个视口 —— 这是创作发生的瞬间。',
  caption: 'AFL — Generative Visual Study 001',
}

/** Section 06：音乐 / 多媒体 */
export const musicCopy = {
  eyebrow: 'Sound & Rhythm',
  title: 'FOLLOW THE RHYTHM',
  description: '滚动即节拍。圆形核心、波纹与频谱线在同一个频率上呼吸。',
}

/** Section 07：Ending */
export const endingCopy = {
  title: ['THE FUTURE', 'IS ALREADY HERE'],
  subtitle: 'AI Future Lab — 让智能安静地融入每一次创作。',
}

/** 页脚 */
export const footerLinks = [
  { label: 'Explore', href: '#hero' },
  { label: 'Capabilities', href: '#intro' },
  { label: 'Lab', href: '#creation' },
  { label: 'Contact', href: '#ending' },
]
