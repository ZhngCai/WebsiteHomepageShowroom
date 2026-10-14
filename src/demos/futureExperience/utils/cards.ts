import type { CardContent } from './events'

const TITLES = [
  ['Aurora Vessel', '极光容器'],
  ['Meridian Chair', '子午线座椅'],
  ['Halo Timepiece', '光晕时计'],
  ['Eclipse Lamp', '日蚀灯'],
  ['Vantage Console', '观景边柜'],
  ['Solstice Vase', '至日花器'],
  ['Nimbus Screen', '雨云屏风'],
  ['Zenith Table', '天顶长桌'],
]

const QUOTES = [
  ['Light is our raw material.', '光，是我们唯一的原料。'],
  ['Silence, shaped by hand.', '以手塑形，以静为声。'],
  ['Weightless, yet permanent.', '无重量，却恒久。'],
  ['The future, softly lit.', '未来，被温柔照亮。'],
  ['Form follows feeling.', '形随感受。'],
  ['Made to outlive trends.', '为超越潮流而造。'],
]

const LOCATIONS = [
  ['Zürich Atelier', '苏黎世工坊'],
  ['Kyoto Studio', '京都工作室'],
  ['Milan Gallery', '米兰画廊'],
  ['Copenhagen Lab', '哥本哈根实验室'],
  ['Shanghai Space', '上海空间'],
]

const TAGS = ['Optical', 'Titanium', 'Handmade', 'Limited', 'Series', 'Archive']

const MONTHS = ['03', '05', '07', '09', '11', '12']

/** 依据卡片索引生成确定性的作品信息（无外部数据源） */
export function cardContent(index: number): CardContent {
  const [title, titleZh] = TITLES[index % TITLES.length]
  const [quote, quoteZh] = QUOTES[index % QUOTES.length]
  const [location, locationZh] = LOCATIONS[index % LOCATIONS.length]

  return {
    title,
    titleZh,
    quote,
    quoteZh,
    date: `2025.${MONTHS[index % MONTHS.length]}.${String((index % 27) + 1).padStart(2, '0')}`,
    location,
    locationZh,
    tags: [TAGS[index % TAGS.length], TAGS[(index + 2) % TAGS.length], `No.${String(index + 1).padStart(3, '0')}`],
  }
}
