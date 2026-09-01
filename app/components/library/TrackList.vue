<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { TrackDto } from '#shared/types/chapel'

defineProps<{
  tracks: TrackDto[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [track: TrackDto]
  delete: [track: TrackDto]
}>()

const { toggle, isPlaying } = useTrackPreview()

function trackMenu(track: TrackDto): DropdownMenuItem[][] {
  return [[
    {
      label: 'Bearbeiten',
      icon: 'i-lucide-pencil',
      onSelect: () => emit('edit', track)
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
      v-for="track in tracks"
      :key="track.id"
      class="rounded-2xl border border-default bg-elevated/40 p-4 flex items-center gap-3 sm:gap-4 min-w-0 max-w-full"
    >
      <UButton
        :variant="isPlaying(track.id) ? 'solid' : 'soft'"
        :color="isPlaying(track.id) ? 'primary' : 'neutral'"
        square
        class="min-h-12 min-w-12 shrink-0"
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
        <UBadge
          class="mt-2"
          :color="track.category === 'liturgy' ? 'info' : 'neutral'"
          variant="subtle"
        >
          {{ categoryLabel(track.category) }}
        </UBadge>
      </div>

      <UDropdownMenu :items="trackMenu(track)">
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-ellipsis-vertical"
          square
          class="min-h-12 min-w-12 shrink-0"
          aria-label="Weitere Aktionen"
        />
      </UDropdownMenu>
    </div>
  </div>
</template>
