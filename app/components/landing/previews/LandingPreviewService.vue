<script setup lang="ts">
import { DEMO_SERVICE_ITEMS } from '#shared/constants/landingDemo'
</script>

<template>
  <div class="space-y-4 pointer-events-none select-none">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p class="font-semibold">
          Sonntagsgottesdienst
        </p>
        <p class="text-sm text-muted">
          Sonntag, 12. Juli 2026
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UBadge
          color="success"
          variant="subtle"
        >
          Gespeichert
        </UBadge>
        <UButton
          variant="outline"
          size="sm"
          disabled
        >
          <FontAwesomeIcon
            icon="download"
            class="mr-1.5"
          />
          Offline vorbereiten
        </UButton>
      </div>
    </div>

    <div class="divide-y divide-default rounded-lg border border-default overflow-hidden">
      <div
        v-for="item in DEMO_SERVICE_ITEMS"
        :key="item.id"
        class="flex items-center gap-3 px-3 py-2.5"
      >
        <UBadge
          :color="item.kind === 'liturgy' ? 'info' : 'neutral'"
          variant="subtle"
          class="shrink-0 text-xs"
        >
          {{ kindLabel(item.kind) }}
        </UBadge>

        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm truncate">
            {{ item.label }}
          </p>
          <p class="text-xs text-muted truncate">
            {{ item.track?.title || (item.kind === 'liturgy' ? 'Kein Track' : 'Noch kein Lied gewählt') }}
          </p>
        </div>

        <UButton
          v-if="item.kind === 'songSlot'"
          variant="outline"
          size="xs"
          disabled
        >
          {{ item.trackId ? 'Lied ändern' : 'Lied wählen' }}
        </UButton>
        <UBadge
          v-else
          variant="subtle"
          color="neutral"
          class="text-xs"
        >
          Fix
        </UBadge>
      </div>
    </div>
  </div>
</template>
