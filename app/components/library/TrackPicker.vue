<script setup lang="ts">
import type { TrackDto } from '#shared/types/chapel'

const props = defineProps<{
  open: boolean
  categoryFilter?: 'hymn' | 'liturgy' | 'all'
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'pick': [track: TrackDto]
}>()

const libraryStore = useLibraryStore()
const search = ref('')

const filtered = computed(() => {
  let list = libraryStore.tracks
  if (props.categoryFilter && props.categoryFilter !== 'all') {
    list = list.filter(t => t.category === props.categoryFilter)
  }
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      t =>
        t.title.toLowerCase().includes(q)
        || t.composer?.toLowerCase().includes(q)
    )
  }
  return list
})

onMounted(() => {
  if (!libraryStore.tracks.length) libraryStore.fetchTracks()
})

watch(
  () => props.open,
  (open) => {
    if (open && !libraryStore.tracks.length) {
      void libraryStore.fetchTracks()
    }
  }
)

function chooseTrack(track: TrackDto) {
  emit('pick', track)
  emit('update:open', false)
}
</script>

<template>
  <UModal
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <UCard class="max-h-[70vh] flex flex-col">
        <template #header>
          <h3 class="font-semibold">
            Track auswählen
          </h3>
        </template>

        <UInput
          v-model="search"
          placeholder="Suchen…"
          icon="i-lucide-search"
          class="mb-4"
        />

        <div class="overflow-y-auto flex-1 divide-y divide-default">
          <button
            v-for="track in filtered"
            :key="track.id"
            type="button"
            class="w-full text-left px-3 py-3 hover:bg-elevated/50 flex items-center gap-3"
            @click="chooseTrack(track)"
          >
            <FontAwesomeIcon
              icon="music"
              class="text-muted"
            />
            <div class="min-w-0">
              <p class="font-medium truncate">
                {{ track.title }}
              </p>
              <p class="text-sm text-muted truncate">
                {{ track.composer || 'Unbekannt' }}
              </p>
            </div>
          </button>
          <p
            v-if="!filtered.length"
            class="text-center text-muted py-8"
          >
            Keine Tracks gefunden
          </p>
        </div>
      </UCard>
    </template>
  </UModal>
</template>
