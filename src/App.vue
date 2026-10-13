<script setup lang="ts">
import { RouterView } from 'vue-router'
import Cursor from '@/shared/Cursor.vue'
import RouteTransition from '@/shared/Transition.vue'
</script>

<template>
  <Cursor />
  <RouterView v-slot="{ Component, route }">
    <RouteTransition>
      <component :is="Component" :key="route.path" />
    </RouteTransition>
  </RouterView>
</template>
