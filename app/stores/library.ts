import { defineStore } from 'pinia'

import type { TrackDto } from '#shared/types/chapel'

export const useLibraryStore = defineStore('library', () => {
  const tracks = ref<TrackDto[]>([])
  const loading = ref(false)
  const search = ref('')
  const categoryFilter = ref<'all' | 'hymn' | 'liturgy'>('all')

  const filteredTracks = computed(() => {
    let result = tracks.value
    if (categoryFilter.value !== 'all') {
      result = result.filter((t) => t.category === categoryFilter.value)
    }
    const q = search.value.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q)
          || t.composer?.toLowerCase().includes(q)
          || t.originalFilename.toLowerCase().includes(q)
      )
    }
    return result
  })

  async function fetchTracks() {
    loading.value = true
    try {
      tracks.value = await $fetch<TrackDto[]>('/api/tracks')
    } finally {
      loading.value = false
    }
  }

  function upsertTrack(track: TrackDto) {
    const idx = tracks.value.findIndex((t) => t.id === track.id)
    if (idx >= 0) tracks.value[idx] = track
    else tracks.value.unshift(track)
  }

  function removeTrack(id: number) {
    tracks.value = tracks.value.filter((t) => t.id !== id)
  }

  return {
    tracks,
    loading,
    search,
    categoryFilter,
    filteredTracks,
    fetchTracks,
    upsertTrack,
    removeTrack
  }
})
