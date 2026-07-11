<script setup lang="ts">
import { DEMO_PLAYLIST_STEPS } from '#shared/constants/landingDemo'
import type { PlayerState } from '~/composables/useChapelPlayer'

const state = ref<PlayerState>('playing')
const progress = 62
const currentTime = 111
const duration = 180
const currentIndex = 2
const playedIndices = [0, 1]

const currentStep = computed(() => DEMO_PLAYLIST_STEPS[currentIndex] ?? null)

function togglePlay() {
  state.value = state.value === 'playing' ? 'paused' : 'playing'
}
</script>

<template>
  <div class="space-y-4 select-none">
    <PlaybackNowPlayingBar
      :step="currentStep"
      :state="state"
      :progress="progress"
      :current-time="currentTime"
      :duration="duration"
      @toggle-play="togglePlay"
      @stop="state = 'idle'"
      @next="state = 'pausedAfterTrack'"
    />

    <PlaybackStepGrid
      :steps="DEMO_PLAYLIST_STEPS"
      :current-index="currentIndex"
      :played-indices="playedIndices"
    />
  </div>
</template>
