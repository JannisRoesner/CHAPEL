<script setup lang="ts">
import { computed } from 'vue'

import type { PlaylistStepDto } from '#shared/types/chapel'
import type { PlayerState } from '~/composables/useChapelPlayer'

const props = defineProps<{
  step: PlaylistStepDto | null
  state: PlayerState
  progress: number
  currentTime: number
  duration: number
}>()

defineEmits<{
  togglePlay: []
  stop: []
  next: []
}>()

const totalDurationMs = computed(() => {
  if (props.duration > 0 && Number.isFinite(props.duration)) {
    return props.duration * 1000
  }
  return props.step?.durationMs ?? 0
})

const elapsedMs = computed(() => {
  if (props.state === 'pausedAfterTrack') {
    return totalDurationMs.value
  }
  if (props.state === 'playing' || props.state === 'paused') {
    return props.currentTime * 1000
  }
  return 0
})

const showProgress = computed(() => Boolean(props.step?.trackId))
</script>

<template>
  <div class="rounded-2xl border border-default bg-elevated/50 p-6 space-y-4">
    <div class="text-center min-h-16">
      <p class="text-sm text-muted">
        {{ step?.label || '—' }}
      </p>
      <h2 class="text-2xl md:text-3xl font-semibold mt-1 truncate">
        {{ step?.title || 'Kein Track' }}
      </h2>
      <p
        v-if="step?.composer"
        class="text-muted mt-1"
      >
        {{ step.composer }}
      </p>
    </div>

    <UProgress
      v-if="showProgress"
      :model-value="progress"
      :max="100"
    />

    <p
      v-if="showProgress"
      class="text-center text-sm text-muted"
    >
      {{ formatDuration(elapsedMs) }} / {{ formatDuration(totalDurationMs) }}
    </p>

    <div class="flex items-center justify-center gap-4">
      <UButton
        size="xl"
        color="primary"
        class="min-w-32 min-h-16 text-lg"
        :disabled="!step?.trackId"
        @click="$emit('togglePlay')"
      >
        <FontAwesomeIcon
          :icon="state === 'playing' ? 'pause' : 'play'"
          class="text-2xl"
        />
      </UButton>

      <UButton
        size="xl"
        variant="outline"
        class="min-w-32 min-h-16 text-lg"
        @click="$emit('next')"
      >
        <FontAwesomeIcon
          icon="forward-step"
          class="mr-2"
        />
        Nächster
      </UButton>
    </div>

    <p
      v-if="state === 'pausedAfterTrack'"
      class="text-center text-sm text-primary"
    >
      Letzter Titel beendet
    </p>
  </div>
</template>

<style scoped>
:deep(button) {
  touch-action: manipulation;
}
</style>
