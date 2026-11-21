<script setup lang="ts">
import type { TrackDto } from '#shared/types/chapel'

const libraryStore = useLibraryStore()
const toast = useToast()
const trackPreview = useTrackPreview()

const editTrack = ref<TrackDto | null>(null)
const editOpen = ref(false)
const deleteOpen = ref(false)
const deleteTarget = ref<TrackDto | null>(null)
const tempoTrack = ref<TrackDto | null>(null)
const tempoOpen = ref(false)

function openTempo(track: TrackDto) {
  tempoTrack.value = track
  tempoOpen.value = true
}

function onTempoSaved(track: TrackDto, created: boolean) {
  libraryStore.upsertTrack(track)
  toast.add({ title: created ? 'Tempo-Variante angelegt' : 'Tempo gespeichert', description: track.title, color: 'success' })
}

const elementTypes = useElementTypesStore()
const categoryItems = computed(() => [
  { label: 'Alle', value: 'all' },
  ...elementTypes.types.map(t => ({ label: t.label, value: t.key }))
])

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

function requestDelete(track: TrackDto) {
  deleteTarget.value = track
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  await $fetch(`/api/tracks/${deleteTarget.value.id}`, { method: 'DELETE' })
  const removedId = deleteTarget.value.id
  libraryStore.removeTrack(removedId)
  // Varianten werden serverseitig mitgelöscht
  libraryStore.tracks = libraryStore.tracks.filter(t => t.parentTrackId !== removedId)
  toast.add({ title: 'Track gelöscht', color: 'neutral' })
  deleteOpen.value = false
  deleteTarget.value = null
}

function onSaved(track: TrackDto) {
  libraryStore.upsertTrack(track)
  toast.add({ title: 'Gespeichert', color: 'success' })
}
</script>

<template>
  <div class="space-y-6 min-w-0 max-w-full overflow-x-clip">
    <UiPageHeader
      title="Bibliothek"
      description="Audiodateien verwalten und kategorisieren"
    />

    <LibraryTrackUpload
      @uploaded="onUploaded"
      @duplicate="onDuplicate"
    />

    <div class="flex flex-col gap-3 min-w-0">
      <UInput
        v-model="libraryStore.search"
        placeholder="Suchen…"
        icon="i-lucide-search"
        size="lg"
        class="w-full min-w-0 max-w-full"
      />
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 min-w-0">
        <button
          v-for="item in categoryItems"
          :key="item.value"
          type="button"
          class="min-h-12 min-w-0 rounded-xl border px-2 sm:px-3 font-medium text-sm sm:text-base leading-tight text-center transition-colors"
          :class="libraryStore.categoryFilter === item.value
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-default text-muted hover:bg-elevated/60'"
          @click="libraryStore.categoryFilter = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <LibraryTrackList
      :tracks="libraryStore.filteredTracks"
      :loading="libraryStore.loading"
      @edit="openEdit"
      @tempo="openTempo"
      @delete="requestDelete"
    />

    <LibraryTrackTempoModal
      v-model:open="tempoOpen"
      :track="tempoTrack"
      @saved="onTempoSaved"
    />

    <LibraryTrackEditModal
      v-model:open="editOpen"
      :track="editTrack"
      @saved="onSaved"
    />

    <UiConfirmModal
      v-model:open="deleteOpen"
      title="Track löschen"
      :description="deleteTarget ? `„${deleteTarget.title}“ wirklich löschen?${deleteTarget.parentTrackId ? '' : ' Zugehörige Tempo-Varianten werden ebenfalls gelöscht.'}` : undefined"
      confirm-label="Löschen"
      @confirm="confirmDelete"
    />
  </div>
</template>
