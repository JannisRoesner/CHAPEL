<script setup lang="ts">
import type { TrackDto } from '#shared/types/chapel'

const libraryStore = useLibraryStore()
const toast = useToast()
const trackPreview = useTrackPreview()

const editTrack = ref<TrackDto | null>(null)
const editOpen = ref(false)

onMounted(() => libraryStore.fetchTracks())
onUnmounted(() => trackPreview.stop())

function onUploaded(track: TrackDto) {
  libraryStore.upsertTrack(track)
  toast.add({ title: 'Track hochgeladen', description: track.title, color: 'success' })
}

function onDuplicate(existing: TrackDto) {
  toast.add({
    title: 'Duplikat erkannt',
    description: `"${existing.title}" ist bereits in der Bibliothek.`,
    color: 'warning'
  })
}

function openEdit(track: TrackDto) {
  editTrack.value = track
  editOpen.value = true
}

async function onDelete(track: TrackDto) {
  if (!confirm(`"${track.title}" wirklich löschen?`)) return
  await $fetch(`/api/tracks/${track.id}`, { method: 'DELETE' })
  libraryStore.removeTrack(track.id)
  toast.add({ title: 'Track gelöscht', color: 'neutral' })
}

function onSaved(track: TrackDto) {
  libraryStore.upsertTrack(track)
  toast.add({ title: 'Gespeichert', color: 'success' })
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold mb-1">Bibliothek</h1>
      <p class="text-muted">Audiodateien verwalten und kategorisieren</p>
    </div>

    <LibraryTrackUpload @uploaded="onUploaded" @duplicate="onDuplicate" />

    <div class="flex flex-wrap gap-3">
      <UInput
        v-model="libraryStore.search"
        placeholder="Suchen…"
        icon="i-lucide-search"
        class="flex-1 min-w-48"
      />
      <USelect
        v-model="libraryStore.categoryFilter"
        :items="[
          { label: 'Alle', value: 'all' },
          { label: 'Lieder', value: 'hymn' },
          { label: 'Liturgie', value: 'liturgy' }
        ]"
        class="w-40"
      />
    </div>

    <LibraryTrackList
      :tracks="libraryStore.filteredTracks"
      :loading="libraryStore.loading"
      @edit="openEdit"
      @delete="onDelete"
    />

    <LibraryTrackEditModal
      v-model:open="editOpen"
      :track="editTrack"
      @saved="onSaved"
    />
  </div>
</template>
