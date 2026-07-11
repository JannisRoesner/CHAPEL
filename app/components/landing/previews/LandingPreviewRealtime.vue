<script setup lang="ts">
import { DEMO_TRACKS } from '#shared/constants/landingDemo'

const existingTracks = DEMO_TRACKS.slice(0, 3)
const newTrack = {
  title: 'Jesus, meine Zuversicht',
  composer: 'Johann Crüger',
  durationMs: 212000
}
</script>

<template>
  <div class="grid sm:grid-cols-2 gap-4 pointer-events-none select-none">
    <UCard>
      <div class="mb-4">
        <p class="font-medium text-sm">
          Nutzer A — Bibliothek
        </p>
      </div>

      <div class="rounded-lg border border-success/30 bg-success/5 px-3 py-2 mb-3 text-sm">
        Lied hochgeladen
      </div>

      <div class="divide-y divide-default rounded-lg border border-default overflow-hidden">
        <div
          v-for="track in existingTracks"
          :key="track.id"
          class="flex items-center gap-3 px-3 py-2"
        >
          <div class="shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
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
              {{ track.composer }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 px-3 py-2 bg-success/5">
          <div class="shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <FontAwesomeIcon
              icon="music"
              class="text-primary text-xs"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate">
              {{ newTrack.title }}
            </p>
            <p class="text-xs text-muted truncate">
              {{ newTrack.composer }}
            </p>
          </div>
          <UBadge
            color="success"
            variant="subtle"
            class="text-xs shrink-0"
          >
            Gerade hinzugefügt
          </UBadge>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="mb-4">
        <p class="font-medium text-sm">
          Nutzer B — Bibliothek
        </p>
      </div>

      <div class="divide-y divide-default rounded-lg border border-default overflow-hidden">
        <div
          v-for="track in existingTracks"
          :key="track.id"
          class="flex items-center gap-3 px-3 py-2"
        >
          <div class="shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
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
              {{ track.composer }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3 px-3 py-2 bg-primary/5 border-l-2 border-primary">
          <div class="shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <FontAwesomeIcon
              icon="music"
              class="text-primary text-xs"
            />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate">
              {{ newTrack.title }}
            </p>
            <p class="text-xs text-muted truncate">
              {{ newTrack.composer }}
            </p>
          </div>
          <UBadge
            color="primary"
            variant="subtle"
            class="text-xs shrink-0"
          >
            Automatisch aktualisiert
          </UBadge>
        </div>
      </div>
    </UCard>
  </div>
</template>
