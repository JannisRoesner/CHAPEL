<script setup lang="ts">
import type { TrackDto } from '#shared/types/chapel'

const libraryStore = useLibraryStore()
const toast = useToast()
const trackPreview = useTrackPreview()

const editTrack = ref<TrackDto | null>(null)
const editOpen = ref(false)
const deleteOpen = ref(false)
const deleteTarget = ref<TrackDto | null>(null)

const categoryItems = [
  { label: 'Alle', value: 'all' as const },
  { label: 'Lieder', value: 'hymn' as const },
  { label: 'Liturgie', value: 'liturgy' as const }
]

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
  libraryStore.removeTrack(deleteTarget.value.id)
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
  <div class="space-y-6">
    <UiPageHeader
      title="Bibliothek"
      description="Audiodateien verwalten und kategorisieren"
    />

    <LibraryTrackUpload
      @uploaded="onUploaded"
      @duplicate="onDuplicate"
    />

    <div class="flex flex-col gap-3">
      <UInput
        v-model="libraryStore.search"
        placeholder="Suchen…"
        icon="i-lucide-search"
        size="lg"
        class="w-full"
      />
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="item in categoryItems"
          :key="item.value"
          type="button"
          class="min-h-12 rounded-xl border px-3 font-medium transition-colors"
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
      @delete="requestDelete"
    />

    <LibraryTrackEditModal
      v-model:open="editOpen"
      :track="editTrack"
      @saved="onSaved"
    />

    <UiConfirmModal
      v-model:open="deleteOpen"
      title="Track löschen"
      :description="deleteTarget ? `„${deleteTarget.title}“ wirklich löschen?` : undefined"
      confirm-label="Löschen"
      @confirm="confirmDelete"
    />
  </div>
</template>
