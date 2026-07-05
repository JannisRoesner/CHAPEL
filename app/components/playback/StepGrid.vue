<script setup lang="ts">
import type { PlaylistStepDto } from '#shared/types/chapel'

defineProps<{
  steps: PlaylistStepDto[]
  currentIndex: number
  playedIndices?: number[]
}>()

const emit = defineEmits<{
  select: [index: number]
}>()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    <button
      v-for="(step, index) in steps"
      :key="step.id"
      type="button"
      class="rounded-xl border-2 p-4 min-h-24 text-left transition-all touch-manipulation"
      :class="[
        index === currentIndex
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : 'border-default bg-elevated/30 hover:bg-elevated/60',
        playedIndices?.includes(index) && index !== currentIndex ? 'opacity-60' : ''
      ]"
      @click="emit('select', index)"
    >
      <p class="text-xs text-muted mb-1">{{ step.label }}</p>
      <p class="font-medium truncate">{{ step.title || '—' }}</p>
      <p v-if="!step.trackId" class="text-xs text-warning mt-1">Leer</p>
    </button>
  </div>
</template>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
}
</style>
