<script setup lang="ts">
import { APP_NAME, APP_TAGLINE } from '#shared/constants/app'

withDefaults(defineProps<{
  size?: 'sm' | 'lg'
  showTagline?: boolean
}>(), {
  size: 'sm',
  showTagline: true
})
</script>

<template>
  <div class="flex items-center gap-2 min-w-0">
    <FontAwesomeIcon
      icon="church"
      class="text-primary shrink-0"
      :class="size === 'lg' ? 'text-2xl' : 'text-lg'"
    />
    <div class="leading-tight min-w-0">
      <div
        class="font-semibold"
        :class="size === 'lg' ? 'text-xl' : 'text-lg'"
      >
        {{ APP_NAME }}
      </div>
      <p
        v-if="showTagline"
        class="text-muted leading-snug"
        :class="size === 'lg' ? 'text-sm' : 'text-[10px] sm:text-[11px]'"
      >
        {{ APP_TAGLINE }}
      </p>
    </div>
  </div>
</template>
