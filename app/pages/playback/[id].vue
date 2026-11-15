<script setup lang="ts">
import type { PlaylistStepDto, ServiceDto } from '#shared/types/chapel'

definePageMeta({
  layout: 'playback'
})

const route = useRoute()
const id = Number(route.params.id)
const playbackProgress = usePlaybackProgress(id)

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
const loadError = ref<string | null>(null)
const serviceName = ref('')
const playedIndices = ref<number[]>([])
const progressReady = ref(false)

watch(lastFinishedIndex, (idx) => {
  if (idx !== null && !playedIndices.value.includes(idx)) {
    playedIndices.value.push(idx)
  }
})

watch(
  [currentIndex, playedIndices],
  () => {
    if (!progressReady.value) return
    playbackProgress.save(currentIndex.value, playedIndices.value)
  },
  { deep: true }
)

onMounted(() => {
  window.addEventListener('pagehide', persistProgress)
  void load()
})

onBeforeUnmount(() => {
  persistProgress()
  window.removeEventListener('pagehide', persistProgress)
})

function persistProgress() {
  if (!progressReady.value) return
  playbackProgress.save(currentIndex.value, playedIndices.value)
}

async function load() {
  loading.value = true
  loadError.value = null
  progressReady.value = false

  try {
    const [service, steps] = await Promise.all([
      $fetch<ServiceDto>(`/api/services/${id}`),
      $fetch<PlaylistStepDto[]>(`/api/services/${id}/playlist`)
    ])
    serviceName.value = service.name
    const saved = playbackProgress.load(steps)
    playedIndices.value = saved
      ? saved.playedIndices.filter(i => i >= 0 && i < steps.length)
      : []
    await loadPlaylist(steps, saved?.currentIndex)
    progressReady.value = true
  } catch {
    loadError.value = 'Gottesdienst konnte nicht geladen werden'
  } finally {
    loading.value = false
  }
}

function onSelectStep(index: number) {
  selectStep(index)
}
</script>

<template>
  <div class="min-h-screen flex flex-col w-full min-w-0 overflow-x-clip">
    <header class="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-default bg-default/85 backdrop-blur-xl overflow-x-clip">
      <UButton
        to="/playback"
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
        class="shrink-0 min-h-11"
      >
        Auswahl
      </UButton>
      <h1 class="flex-1 min-w-0 font-semibold text-lg truncate px-3 text-center">
        {{ serviceName }}
      </h1>
      <UiThemeToggle class="shrink-0" />
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
      v-else-if="loadError"
      class="flex-1 flex items-center justify-center p-4"
    >
      <UEmpty
        :title="loadError"
        description="Bitte Netzwerkverbindung prüfen und erneut versuchen."
      >
        <UButton
          to="/playback"
          class="min-h-12"
        >
          Zur Auswahl
        </UButton>
      </UEmpty>
    </div>

    <div
      v-else
      class="flex-1 flex flex-col gap-6 p-4 max-w-5xl mx-auto w-full min-w-0"
    >
      <PlaybackNowPlayingBar
        class="order-last md:order-none sticky bottom-0 md:static z-20 -mx-4 px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-default/95 backdrop-blur md:bg-transparent md:backdrop-blur-none md:mx-0 md:px-0 md:pt-0 md:pb-0"
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
