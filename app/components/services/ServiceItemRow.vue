<script setup lang="ts">
import type { ServiceItemDto } from '#shared/types/chapel'

const props = defineProps<{
  item: ServiceItemDto
  index: number
}>()

const type = computed(() => elementType(props.item.kind))

defineEmits<{
  pick: []
}>()

const { toggle, isPlaying } = useTrackPreview()
</script>

<template>
  <div
    class="type-card-plain rounded-2xl border border-default p-3 sm:p-4 space-y-3"
    :style="{ '--type': typeColorVar(item.kind) }"
  >
    <div class="flex items-center gap-2">
      <UBadge
        :color="type.color"
        variant="solid"
        :icon="type.icon"
        class="shrink-0"
      >
        {{ index + 1 }} · {{ kindLabel(item.kind) }}
      </UBadge>
      <p class="font-semibold truncate min-w-0">
        {{ item.label }}
      </p>
      <FontAwesomeIcon
        v-if="type.fixed"
        icon="lock"
        class="ml-auto text-dimmed text-sm shrink-0"
        title="Fest durch Vorlage"
      />
    </div>

    <div class="flex items-center gap-2 rounded-xl bg-elevated/60 p-1.5 pl-3">
      <FontAwesomeIcon
        icon="music"
        class="text-dimmed shrink-0"
      />
      <p
        class="flex-1 min-w-0 truncate"
        :class="item.track ? '' : 'text-muted'"
      >
        <template v-if="item.track">
          {{ item.track.title }}
          <span
            v-if="item.track.playbackRate !== 1"
            class="text-muted"
          >· {{ formatPlaybackRate(item.track.playbackRate) }}</span>
        </template>
        <template v-else>
          {{ type.fixed ? 'Kein Track' : 'Noch nichts gewählt' }}
        </template>
      </p>
      <UButton
        v-if="item.trackId"
        :variant="isPlaying(item.trackId) ? 'solid' : 'ghost'"
        color="neutral"
        square
        class="press min-h-10 min-w-10 justify-center"
        :aria-label="isPlaying(item.trackId) ? 'Wiedergabe stoppen' : 'Probehören'"
        @click="toggle(item.trackId)"
      >
        <FontAwesomeIcon :icon="isPlaying(item.trackId) ? 'stop' : 'play'" />
      </UButton>
      <UButton
        v-if="!type.fixed"
        :variant="item.trackId ? 'soft' : 'solid'"
        class="press min-h-10 shrink-0"
        @click="$emit('pick')"
      >
        {{ item.trackId ? 'Ändern' : 'Wählen' }}
      </UButton>
    </div>
  </div>
</template>
