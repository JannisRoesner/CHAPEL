<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { TrackDto } from '#shared/types/chapel'

const props = defineProps<{
  tracks: TrackDto[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [track: TrackDto]
  tempo: [track: TrackDto]
  delete: [track: TrackDto]
}>()

/** Tempo-Varianten direkt unter ihrem Original anzeigen */
const ordered = computed(() => {
  const ids = new Set(props.tracks.map(t => t.id))
  const variants = new Map<number, TrackDto[]>()
  for (const t of props.tracks) {
    if (t.parentTrackId && ids.has(t.parentTrackId)) {
      variants.set(t.parentTrackId, [...(variants.get(t.parentTrackId) ?? []), t])
    }
  }
  return props.tracks
    .filter(t => !(t.parentTrackId && ids.has(t.parentTrackId)))
    .flatMap(t => [t, ...(variants.get(t.id) ?? []).sort((a, b) => a.playbackRate - b.playbackRate)])
})

const { toggle, isPlaying } = useTrackPreview()

function trackMenu(track: TrackDto): DropdownMenuItem[][] {
  return [[
    {
      label: 'Bearbeiten',
      icon: 'i-lucide-pencil',
      onSelect: () => emit('edit', track)
    },
    {
      label: track.parentTrackId ? 'Tempo ändern' : 'Tempo-Variante anlegen',
      icon: 'i-lucide-gauge',
      onSelect: () => emit('tempo', track)
    },
    {
      label: 'Löschen',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect: () => emit('delete', track)
    }
  ]]
}
</script>

<template>
  <div
    v-if="loading"
    class="space-y-3"
  >
    <USkeleton
      v-for="i in 5"
      :key="i"
      class="h-20 w-full rounded-2xl"
    />
  </div>

  <UEmpty
    v-else-if="!tracks.length"
    title="Keine Tracks"
    description="Laden Sie Audiodateien hoch, um die Bibliothek zu füllen."
    icon="i-lucide-music"
  />

  <div
    v-else
    class="space-y-3 min-w-0 max-w-full"
  >
    <div
      v-for="track in ordered"
      :key="track.id"
      class="rounded-2xl border border-default bg-elevated/40 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 min-w-0 max-w-full"
      :class="track.parentTrackId ? 'ml-6 sm:ml-10 border-dashed' : ''"
    >
      <UButton
        :variant="isPlaying(track.id) ? 'solid' : 'soft'"
        :color="isPlaying(track.id) ? 'primary' : 'neutral'"
        square
        class="press min-h-12 min-w-12 shrink-0 justify-center"
        :aria-label="isPlaying(track.id) ? 'Wiedergabe stoppen' : 'Probehören'"
        @click="toggle(track.id)"
      >
        <FontAwesomeIcon
          :icon="isPlaying(track.id) ? 'stop' : 'play'"
          class="text-lg"
        />
      </UButton>

      <div class="flex-1 min-w-0">
        <p class="font-semibold truncate">
          {{ track.title }}
        </p>
        <p class="text-muted truncate mt-0.5">
          {{ track.composer || 'Unbekannt' }} · {{ formatDuration(track.durationMs) }}
        </p>
        <div class="mt-2 flex flex-wrap gap-1.5">
          <UBadge
            :color="track.category === 'liturgy' ? 'secondary' : track.category === 'voluntary' ? 'neutral' : 'primary'"
            :icon="track.category === 'voluntary' ? 'i-lucide-door-open' : undefined"
            variant="subtle"
          >
            {{ categoryLabel(track.category) }}
          </UBadge>
          <UBadge
            v-if="track.parentTrackId"
            color="primary"
            variant="subtle"
            icon="i-lucide-gauge"
          >
            Tempo {{ formatPlaybackRate(track.playbackRate) }}
          </UBadge>
        </div>
      </div>

      <UDropdownMenu :items="trackMenu(track)">
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-ellipsis-vertical"
          square
          class="press min-h-12 min-w-12 shrink-0 justify-center"
          aria-label="Weitere Aktionen"
        />
      </UDropdownMenu>
    </div>
  </div>
</template>
