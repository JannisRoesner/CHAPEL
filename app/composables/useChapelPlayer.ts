import type { PlaylistStepDto } from '#shared/types/chapel'

export type PlayerState = 'idle' | 'playing' | 'paused' | 'pausedAfterTrack'

export function useChapelPlayer() {
  const audio = import.meta.client ? new Audio() : null
  const playlist = ref<PlaylistStepDto[]>([])
  const currentIndex = ref(0)
  const state = ref<PlayerState>('idle')
  const progress = ref(0)
  const currentTime = ref(0)
  const duration = ref(0)
  const loadedTrackId = ref<number | null>(null)
  const lastFinishedIndex = ref<number | null>(null)

  const currentStep = computed(() => playlist.value[currentIndex.value] ?? null)

  if (import.meta.client && audio) {
    audio.addEventListener('timeupdate', () => {
      currentTime.value = audio.currentTime
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        duration.value = audio.duration
      }
      progress.value = duration.value ? (audio.currentTime / duration.value) * 100 : 0
    })

    audio.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        duration.value = audio.duration
      }
    })

    audio.addEventListener('ended', () => {
      lastFinishedIndex.value = currentIndex.value
      progress.value = 100

      if (currentIndex.value < playlist.value.length - 1) {
        resetPlayback()
        currentIndex.value++
      } else {
        state.value = 'pausedAfterTrack'
      }
    })
  }

  onUnmounted(() => {
    audio?.pause()
  })

  async function loadPlaylist(steps: PlaylistStepDto[]) {
    resetPlayback()
    lastFinishedIndex.value = null
    playlist.value = steps
    currentIndex.value = 0
  }

  async function resolveStreamUrl(step: PlaylistStepDto): Promise<string | null> {
    if (!step.trackId || !step.streamUrl) return null

    if ('caches' in window) {
      try {
        const cache = await caches.open('chapel-audio-v1')
        const cached = await cache.match(step.streamUrl)
        if (cached) {
          const blob = await cached.blob()
          return URL.createObjectURL(blob)
        }
      } catch {
        // fall through to network
      }
    }

    return step.streamUrl
  }

  async function playCurrent() {
    const step = currentStep.value
    if (!step?.trackId || !audio) return

    if (state.value === 'paused' && loadedTrackId.value === step.trackId && !audio.ended) {
      await audio.play()
      state.value = 'playing'
      return
    }

    const url = await resolveStreamUrl(step)
    if (!url) return

    if (loadedTrackId.value !== step.trackId || audio.ended) {
      audio.src = url
      loadedTrackId.value = step.trackId
      if (audio.ended) {
        audio.currentTime = 0
      }
    } else if (url.startsWith('blob:')) {
      audio.src = url
    }

    await audio.play()
    state.value = 'playing'
  }

  function pause() {
    if (!audio) return
    audio.pause()
    state.value = 'paused'
  }

  function resetPlayback() {
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    progress.value = 0
    currentTime.value = 0
    duration.value = 0
    loadedTrackId.value = null
    state.value = 'idle'
  }

  function togglePlay() {
    if (state.value === 'playing') {
      pause()
      return
    }
    playCurrent()
  }

  function playNext() {
    if (currentIndex.value < playlist.value.length - 1) {
      resetPlayback()
      currentIndex.value++
      playCurrent()
    }
  }

  function selectStep(index: number) {
    if (index < 0 || index >= playlist.value.length) return
    resetPlayback()
    currentIndex.value = index
  }

  return {
    playlist,
    currentIndex,
    state,
    progress,
    currentTime,
    duration,
    currentStep,
    lastFinishedIndex,
    loadPlaylist,
    togglePlay,
    stop: resetPlayback,
    playNext,
    playCurrent,
    selectStep
  }
}
