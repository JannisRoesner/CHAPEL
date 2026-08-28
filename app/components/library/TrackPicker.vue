<script setup lang="ts">
import type { TrackDto } from '#shared/types/chapel'
import { useMediaQuery } from '@vueuse/core'

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
const isMobile = useMediaQuery('(max-width: 767px)')

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
    :fullscreen="isMobile"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <UCard class="max-h-[85vh] sm:max-h-[70vh] flex flex-col">
        <template #header>
          <h3 class="text-lg font-semibold">
            Track auswählen
          </h3>
        </template>

        <UInput
          v-model="search"
          placeholder="Suchen…"
          icon="i-lucide-search"
          size="lg"
          class="mb-4"
        />

        <div class="overflow-y-auto flex-1 -mx-1">
          <button
            v-for="track in filtered"
            :key="track.id"
            type="button"
            class="w-full text-left px-4 py-4 rounded-xl hover:bg-elevated/50 flex items-center gap-4 min-h-16"
            @click="chooseTrack(track)"
          >
            <div class="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FontAwesomeIcon
                icon="music"
                class="text-primary"
              />
            </div>
            <div class="min-w-0">
              <p class="font-semibold truncate">
                {{ track.title }}
              </p>
              <p class="text-muted truncate mt-0.5">
                {{ track.composer || 'Unbekannt' }}
              </p>
            </div>
          </button>
          <p
            v-if="!filtered.length"
            class="text-center text-muted py-10"
          >
            Keine Tracks gefunden
          </p>
        </div>
      </UCard>
    </template>
  </UModal>
</template>
