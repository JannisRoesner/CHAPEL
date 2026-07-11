<script setup lang="ts">
import { DEMO_TRACKS } from '#shared/constants/landingDemo'
</script>

<template>
  <div class="space-y-4 pointer-events-none select-none">
    <div class="rounded-lg border-2 border-dashed border-default bg-muted/20 p-6 text-center">
      <FontAwesomeIcon
        icon="cloud-upload-alt"
        class="text-2xl text-muted mb-2"
      />
      <p class="text-sm text-muted">
        Dateien hier ablegen oder auswählen
      </p>
      <p class="text-xs text-muted mt-1">
        MP3, WAV, FLAC, OGG
      </p>
    </div>

    <div class="flex flex-wrap gap-2">
      <div class="flex-1 min-w-32 rounded-md border border-default bg-default px-3 py-2 text-sm text-muted">
        Suchen…
      </div>
      <div class="w-28 rounded-md border border-default bg-default px-3 py-2 text-sm text-muted">
        Alle
      </div>
    </div>

    <div class="divide-y divide-default rounded-lg border border-default overflow-hidden">
      <div
        v-for="track in DEMO_TRACKS"
        :key="track.id"
        class="flex items-center gap-3 px-3 py-2.5"
      >
        <div class="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FontAwesomeIcon
            icon="music"
            class="text-primary text-xs"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate">
            {{ track.title }}
          </p>
          <p class="text-xs text-muted truncate">
            {{ track.composer }} · {{ formatDuration(track.durationMs) }}
          </p>
        </div>
        <UBadge
          variant="subtle"
          :color="track.category === 'liturgy' ? 'info' : 'neutral'"
          class="text-xs shrink-0"
        >
          {{ categoryLabel(track.category) }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
