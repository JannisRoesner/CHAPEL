<script setup lang="ts">
import type { TrackDto } from '#shared/types/chapel'

defineProps<{
  tracks: TrackDto[]
  loading?: boolean
}>()

defineEmits<{
  edit: [track: TrackDto]
  delete: [track: TrackDto]
}>()

const { toggle, isPlaying } = useTrackPreview()
</script>

<template>
  <div
    v-if="loading"
    class="space-y-3"
  >
    <USkeleton
      v-for="i in 5"
      :key="i"
      class="h-16 w-full"
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
    class="divide-y divide-default rounded-lg border border-default overflow-hidden"
  >
    <div
      v-for="track in tracks"
      :key="track.id"
      class="flex items-center gap-4 px-4 py-3 hover:bg-elevated/50"
    >
      <div class="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <FontAwesomeIcon
          icon="music"
          class="text-primary"
        />
      </div>

      <div class="flex-1 min-w-0">
        <p class="font-medium truncate">
          {{ track.title }}
        </p>
        <p class="text-sm text-muted truncate">
          {{ track.composer || 'Unbekannt' }} · {{ formatDuration(track.durationMs) }}
        </p>
      </div>

      <UBadge
        :color="track.category === 'liturgy' ? 'info' : 'neutral'"
        variant="subtle"
      >
        {{ categoryLabel(track.category) }}
      </UBadge>

      <div class="flex gap-1 shrink-0">
        <UButton
          variant="ghost"
          size="sm"
          :aria-label="isPlaying(track.id) ? 'Wiedergabe stoppen' : 'Probehören'"
          @click="toggle(track.id)"
        >
          <FontAwesomeIcon :icon="isPlaying(track.id) ? 'stop' : 'play'" />
        </UButton>
        <UButton
          variant="ghost"
          size="sm"
          @click="$emit('edit', track)"
        >
          <FontAwesomeIcon icon="pen" />
        </UButton>
        <UButton
          variant="ghost"
          size="sm"
          color="error"
          @click="$emit('delete', track)"
        >
          <FontAwesomeIcon icon="trash" />
        </UButton>
      </div>
    </div>
  </div>
</template>
