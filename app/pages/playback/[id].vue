<script setup lang="ts">
definePageMeta({
  layout: 'playback'
})

const route = useRoute()
const id = Number(route.params.id)
const offlineCache = useOfflineCache()

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
const offlineBanner = ref<string | null>(null)
const partialBanner = ref<string | null>(null)
const playedIndices = ref<number[]>([])

watch(lastFinishedIndex, (idx) => {
  if (idx !== null && !playedIndices.value.includes(idx)) {
    playedIndices.value.push(idx)
  }
})

async function load() {
  loading.value = true
  loadError.value = null
  offlineBanner.value = null
  partialBanner.value = null

  try {
    const result = await offlineCache.loadServiceForPlayback(id)

    if (result.error) {
      loadError.value = result.error
      return
    }

    serviceName.value = result.serviceName
    await loadPlaylist(result.playlist)

    if (result.source === 'cache' && result.cachedAt) {
      const date = new Date(result.cachedAt).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      offlineBanner.value = `Offline-Modus — vorbereitete Version vom ${date}`
    }

    if (result.partial) {
      partialBanner.value = `Nur ${result.cachedTracks} von ${result.totalTracks} Tracks offline verfügbar`
    }
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
    <header class="flex items-center justify-between px-4 py-3 border-b border-default overflow-x-clip">
      <UButton
        to="/playback"
        variant="ghost"
        size="sm"
        class="shrink-0"
      >
        ← Auswahl
      </UButton>
      <h1 class="flex-1 min-w-0 font-semibold truncate px-4 text-center">
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
        description="Öffnen Sie den Gottesdienst einmal online und nutzen Sie „Offline vorbereiten“."
      >
        <UButton to="/playback">
          Zur Auswahl
        </UButton>
      </UEmpty>
    </div>

    <div
      v-else
      class="flex-1 flex flex-col gap-6 p-4 max-w-5xl mx-auto w-full"
    >
      <UAlert
        v-if="offlineBanner"
        color="warning"
        variant="subtle"
        :description="offlineBanner"
      />

      <UAlert
        v-if="partialBanner"
        color="warning"
        variant="subtle"
        :description="partialBanner"
      />

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
