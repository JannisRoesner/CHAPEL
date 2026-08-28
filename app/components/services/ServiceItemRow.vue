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
  <div class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5 flex flex-col gap-4">
    <div class="flex items-start gap-3">
      <UBadge
        :color="item.kind === 'liturgy' ? 'info' : 'neutral'"
        variant="subtle"
        class="shrink-0 mt-0.5"
      >
        {{ kindLabel(item.kind) }}
      </UBadge>
      <div class="min-w-0 flex-1">
        <p class="font-semibold">
          {{ item.label }}
        </p>
        <p class="text-muted mt-0.5">
          {{ item.track?.title || (item.kind === 'liturgy' ? 'Kein Track' : 'Noch kein Lied gewählt') }}
        </p>
      </div>
      <UBadge
        v-if="item.kind === 'liturgy'"
        variant="subtle"
        color="neutral"
        class="shrink-0"
      >
        Fix
      </UBadge>
    </div>

    <div class="flex flex-col sm:flex-row gap-2">
      <UButton
        v-if="item.kind === 'songSlot'"
        variant="outline"
        class="min-h-12 justify-center w-full sm:w-auto"
        @click="$emit('pick')"
      >
        {{ item.trackId ? 'Lied ändern' : 'Lied wählen' }}
      </UButton>

      <UButton
        v-if="item.trackId"
        variant="soft"
        color="neutral"
        class="min-h-12 justify-center w-full sm:w-auto"
        :aria-label="isPlaying(item.trackId) ? 'Wiedergabe stoppen' : 'Probehören'"
        @click="toggle(item.trackId)"
      >
        <FontAwesomeIcon
          :icon="isPlaying(item.trackId) ? 'stop' : 'play'"
          class="mr-2"
        />
        {{ isPlaying(item.trackId) ? 'Stoppen' : 'Probehören' }}
      </UButton>
    </div>
  </div>
</template>
