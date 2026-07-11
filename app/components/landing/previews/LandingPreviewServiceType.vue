<script setup lang="ts">
import { DEMO_SERVICE_TYPE_ITEMS } from '#shared/constants/landingDemo'
</script>

<template>
  <div class="space-y-2 pointer-events-none select-none">
    <p class="text-sm font-medium mb-3">
      Sonntagsgottesdienst
    </p>

    <div
      v-for="item in DEMO_SERVICE_TYPE_ITEMS"
      :key="item.position"
      class="flex items-center gap-3 rounded-lg border border-default px-3 py-2.5"
    >
      <div class="flex flex-col gap-0.5 shrink-0">
        <UButton
          variant="ghost"
          size="xs"
          disabled
          class="p-0.5 min-w-0"
        >
          <FontAwesomeIcon icon="chevron-up" class="text-xs" />
        </UButton>
        <UButton
          variant="ghost"
          size="xs"
          disabled
          class="p-0.5 min-w-0"
        >
          <FontAwesomeIcon icon="chevron-down" class="text-xs" />
        </UButton>
      </div>

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
          {{ item.trackTitle || (item.kind === 'liturgy' ? 'Kein Track' : 'Standard optional') }}
        </p>
      </div>
    </div>
  </div>
</template>
