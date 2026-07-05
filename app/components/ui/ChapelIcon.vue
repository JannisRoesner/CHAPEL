<script setup lang="ts">
import { CHAPEL_ICON_PATH, CHAPEL_ICON_VIEWBOX } from '#shared/constants/chapelIcon'

withDefaults(defineProps<{
  size?: 'sm' | 'lg' | 'xl'
}>(), {
  size: 'sm'
})
</script>

<template>
  <svg
    :viewBox="CHAPEL_ICON_VIEWBOX"
    class="shrink-0"
    :class="size === 'xl' ? 'h-16 w-16' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'"
    role="img"
    aria-hidden="true"
  >
    <path
      :d="CHAPEL_ICON_PATH"
      class="fill-[var(--color-green-500,#00C16A)]"
    />
  </svg>
</template>
