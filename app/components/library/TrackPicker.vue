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
const toast = useToast()
const { toggle, isPlaying, stop } = useTrackPreview()
const search = ref('')
const mode = ref<'library' | 'upload'>('library')
const isMobile = useMediaQuery('(max-width: 767px)')

const modeItems = [
  { label: 'Bibliothek', value: 'library' as const, icon: 'i-lucide-library' },
  { label: 'Hochladen', value: 'upload' as const, icon: 'i-lucide-upload' }
]

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

watch(
  () => props.open,
  (open) => {
    if (open) {
      mode.value = 'library'
      if (!libraryStore.tracks.length) void libraryStore.fetchTracks()
    } else {
      stop()
    }
  },
  { immediate: true }
)

function chooseTrack(track: TrackDto) {
  emit('pick', track)
  emit('update:open', false)
}

function onUploaded(track: TrackDto) {
  libraryStore.upsertTrack(track)
  toast.add({ title: 'Hochgeladen & ausgewählt', description: track.title, color: 'success' })
  chooseTrack(track)
}

function onDuplicate(existing: TrackDto) {
  toast.add({ title: 'Bereits in der Bibliothek', description: `„${existing.title}“ wurde ausgewählt.`, color: 'info' })
  chooseTrack(existing)
}
</script>

<template>
  <UModal
    :open="open"
    :fullscreen="isMobile"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div class="flex h-full max-h-[100dvh] sm:max-h-[75vh] flex-col">
        <div class="flex items-center gap-3 border-b border-default px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:pt-3">
          <h3 class="flex-1 text-lg font-semibold">
            Track auswählen
          </h3>
          <UButton
            variant="ghost"
            color="neutral"
            icon="i-lucide-x"
            square
            class="press min-h-11 min-w-11 justify-center"
            aria-label="Schließen"
            @click="emit('update:open', false)"
          />
        </div>

        <div class="space-y-3 px-4 pt-4">
          <div
            class="grid grid-cols-2 gap-1 rounded-xl bg-elevated p-1"
            role="tablist"
          >
            <button
              v-for="item in modeItems"
              :key="item.value"
              type="button"
              role="tab"
              :aria-selected="mode === item.value"
              class="press flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium"
              :class="mode === item.value ? 'bg-default text-highlighted shadow-sm' : 'text-muted hover:text-default'"
              @click="mode = item.value"
            >
              <UIcon :name="item.icon" />
              {{ item.label }}
            </button>
          </div>
          <UInput
            v-if="mode === 'library'"
            v-model="search"
            placeholder="Suchen…"
            icon="i-lucide-search"
            size="xl"
            class="w-full"
            type="search"
          />
        </div>

        <div
          v-if="mode === 'library'"
          class="flex-1 overflow-y-auto overscroll-contain px-2 py-2"
        >
          <div
            v-for="track in filtered"
            :key="track.id"
            class="flex items-center gap-1 rounded-xl hover:bg-elevated/60"
          >
            <button
              type="button"
              class="press flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-3 text-left"
              @click="chooseTrack(track)"
            >
              <div class="size-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                <FontAwesomeIcon
                  :icon="track.parentTrackId ? 'gauge-high' : 'music'"
                  class="text-primary"
                />
              </div>
              <div class="min-w-0">
                <p class="font-semibold truncate">
                  {{ track.title }}
                </p>
                <p class="text-muted text-sm truncate mt-0.5">
                  {{ track.composer || 'Unbekannt' }} · {{ formatDuration(track.durationMs) }}
                  <template v-if="track.playbackRate !== 1">
                    · Tempo {{ formatPlaybackRate(track.playbackRate) }}
                  </template>
                </p>
              </div>
            </button>
            <UButton
              :variant="isPlaying(track.id) ? 'solid' : 'ghost'"
              color="neutral"
              square
              class="press mr-1 min-h-11 min-w-11 shrink-0 justify-center"
              :aria-label="isPlaying(track.id) ? 'Wiedergabe stoppen' : 'Probehören'"
              @click="toggle(track.id)"
            >
              <FontAwesomeIcon :icon="isPlaying(track.id) ? 'stop' : 'play'" />
            </UButton>
          </div>
          <div
            v-if="!filtered.length"
            class="py-10 text-center text-muted space-y-3"
          >
            <p>Keine Tracks gefunden</p>
            <UButton
              variant="soft"
              icon="i-lucide-upload"
              class="press min-h-11"
              @click="() => { mode = 'upload' }"
            >
              Neues Lied hochladen
            </UButton>
          </div>
        </div>

        <div
          v-else
          class="flex-1 overflow-y-auto p-4"
        >
          <LibraryTrackUpload
            single
            :default-category="categoryFilter === 'liturgy' ? 'liturgy' : 'hymn'"
            @uploaded="onUploaded"
            @duplicate="onDuplicate"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
