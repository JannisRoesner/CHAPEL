<script setup lang="ts">
import { APP_NAME, APP_TAGLINE } from '#shared/constants/app'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'lg'
  showTagline?: boolean
}>(), {
  size: 'sm',
  showTagline: true
})

const { branding } = useBranding()
</script>

<template>
  <div class="flex items-center gap-2 min-w-0">
    <img
      v-if="branding.hasCustomLogo"
      :src="branding.logoUrl"
      :alt="APP_NAME"
      class="rounded-md object-contain bg-elevated"
      :class="props.size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'"
    >
    <UiChapelIcon
      v-else
      :size="props.size"
    />
    <div class="leading-tight min-w-0">
      <div
        class="font-semibold"
        :class="props.size === 'lg' ? 'text-xl' : 'text-lg'"
      >
        {{ APP_NAME }}
      </div>
      <p
        v-if="props.showTagline"
        class="text-muted leading-snug"
        :class="props.size === 'lg' ? 'text-sm' : 'text-[10px] sm:text-[11px]'"
      >
        {{ APP_TAGLINE }}
      </p>
    </div>
  </div>
</template>
