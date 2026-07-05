<script setup lang="ts">
import type { PlaylistStepDto } from '#shared/types/chapel'

definePageMeta({
  layout: 'playback'
})

const route = useRoute()
const id = Number(route.params.id)

const {
  playlist,
  currentIndex,
  currentStep,
  state,
  progress,
  currentTime,
  duration,
  loadPlaylist,
  togglePlay,
  stop,
  playNext,
  selectStep,
  lastFinishedIndex
} = useChapelPlayer()

const loading = ref(true)
const serviceName = ref('')
const playedIndices = ref<number[]>([])

watch(lastFinishedIndex, (idx) => {
  if (idx !== null && !playedIndices.value.includes(idx)) {
    playedIndices.value.push(idx)
  }
})

async function load() {
  loading.value = true
  try {
    const [steps, service] = await Promise.all([
      $fetch<PlaylistStepDto[]>(`/api/services/${id}/playlist`),
      $fetch<{ name: string }>(`/api/services/${id}`)
    ])
    serviceName.value = service.name
    await loadPlaylist(steps)
  } finally {
    loading.value = false
  }
}

onMounted(load)

function onSelectStep(index: number) {
  selectStep(index)
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="flex items-center justify-between px-4 py-3 border-b border-default">
      <UButton
        to="/playback"
        variant="ghost"
        size="sm"
      >
        ← Auswahl
      </UButton>
      <h1 class="font-semibold truncate px-4">
        {{ serviceName }}
      </h1>
      <UiThemeToggle />
    </header>

    <div
      v-if="loading"
      class="flex-1 flex items-center justify-center"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="animate-spin text-3xl text-muted"
      />
    </div>

    <div
      v-else
      class="flex-1 flex flex-col gap-6 p-4 max-w-5xl mx-auto w-full"
    >
      <PlaybackNowPlayingBar
        :step="currentStep"
        :state="state"
        :progress="progress"
        :current-time="currentTime"
        :duration="duration"
        @toggle-play="togglePlay()"
        @stop="stop()"
        @next="playNext()"
      />

      <PlaybackStepGrid
        :steps="playlist"
        :current-index="currentIndex"
        :played-indices="playedIndices"
        @select="onSelectStep"
      />
    </div>
  </div>
</template>
