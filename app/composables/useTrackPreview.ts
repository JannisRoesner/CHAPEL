const audio = import.meta.client ? new Audio() : null
const activeTrackId = ref<number | null>(null)
const playing = ref(false)
let listenersAttached = false

function attachListeners() {
  if (!audio || listenersAttached) return
  listenersAttached = true
  audio.addEventListener('ended', () => {
    playing.value = false
  })
}

export function useTrackPreview() {
  if (import.meta.client) attachListeners()

  function isPlaying(trackId: number) {
    return activeTrackId.value === trackId && playing.value
  }

  async function toggle(trackId: number) {
    if (!audio) return

    if (activeTrackId.value === trackId && playing.value) {
      audio.pause()
      audio.currentTime = 0
      playing.value = false
      return
    }

    activeTrackId.value = trackId
    audio.src = `/api/tracks/${trackId}/stream`
    try {
      await audio.play()
      playing.value = true
    } catch {
      playing.value = false
    }
  }

  function stop() {
    if (!audio) return
    audio.pause()
    audio.currentTime = 0
    playing.value = false
    activeTrackId.value = null
  }

  return { toggle, stop, isPlaying, playing, activeTrackId }
}
