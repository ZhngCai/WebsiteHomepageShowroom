<script setup lang="ts">
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { initWritingAnimation } from '../animations/writing'
import { writingLines } from '../data/features'

const root = useScrollAnimation(initWritingAnimation)

const lines = writingLines.map((line) => ({
  ...line,
  words: line.text.split(' '),
}))
</script>

<template>
  <section id="writing" ref="root" class="afl-section afl-writing">
    <div class="afl-container afl-writing__inner">
      <aside class="afl-writing__aside" data-writing-aside>
        <p class="afl-eyebrow">
          <span>03</span>
          <span class="afl-eyebrow__rule" />
          <span>Writing</span>
        </p>
        <h2 class="afl-title">写作能力</h2>
        <p class="afl-text">
          排版本身就是内容的一部分。模型把散落的想法组织成有节奏的句子，再让它们依次出现。
        </p>
      </aside>

      <div class="afl-writing__stage">
        <p v-for="(line, lineIndex) in lines" :key="lineIndex" class="afl-writing__line" data-writing-line>
          <span
            v-for="(word, wordIndex) in line.words"
            :key="wordIndex"
            class="afl-writing__word"
            :class="line.accent ? 'is-accent' : ''"
            data-writing-word
          >
            {{ word }}<span class="afl-writing__space">&nbsp;</span>
          </span>
        </p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.afl-writing {
  position: relative;
  display: flex;
  align-items: center;
  padding-block: 20vh;
  background: $white;
}

.afl-writing__inner {
  display: grid;
  gap: 56px;

  @media (min-width: $bp-tablet) {
    grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
    gap: 72px;
    align-items: start;
  }
}

.afl-writing__aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 26rem;
}

.afl-writing__stage {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.4vw, 22px);
}

.afl-writing__line {
  font-size: clamp(2.1rem, 6.2vw, 5.4rem);
  line-height: 1.02;
  font-weight: 600;
  letter-spacing: -0.035em;
  white-space: nowrap;
  will-change: transform;
}

.afl-writing__word {
  display: inline-block;
  will-change: transform, opacity;
}

.afl-writing__word.is-accent {
  background: linear-gradient(100deg, $accent-blue 0%, $accent-violet 70%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.afl-writing__space {
  display: inline-block;
  width: 0.28em;
}
</style>
