<script setup lang="ts">
import type { ServiceItemDto } from '#shared/types/chapel'

defineProps<{
  item: ServiceItemDto
}>()

defineEmits<{
  pick: []
}>()

const { toggle, isPlaying } = useTrackPreview()
</script>

<template>
  <div class="flex items-center gap-4 px-4 py-3">
    <UBadge :color="item.kind === 'liturgy' ? 'info' : 'neutral'" variant="subtle" class="shrink-0">
      {{ kindLabel(item.kind) }}
    </UBadge>

    <div class="flex-1 min-w-0">
      <p class="font-medium truncate">{{ item.label }}</p>
      <p class="text-sm text-muted truncate">
        {{ item.track?.title || (item.kind === 'liturgy' ? 'Kein Track' : 'Noch kein Lied gewählt') }}
      </p>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <UButton
        v-if="item.kind === 'songSlot'"
        variant="outline"
        size="sm"
        @click="$emit('pick')"
      >
        {{ item.trackId ? 'Lied ändern' : 'Lied wählen' }}
      </UButton>
      <UBadge v-else variant="subtle" color="neutral">Fix</UBadge>

      <UButton
        v-if="item.trackId"
        variant="outline"
        size="sm"
        :aria-label="isPlaying(item.trackId) ? 'Wiedergabe stoppen' : 'Probehören'"
        @click="toggle(item.trackId)"
      >
        <FontAwesomeIcon :icon="isPlaying(item.trackId) ? 'stop' : 'play'" />
      </UButton>
    </div>
  </div>
</template>
