<script setup lang="ts">
import { APP_NAME, APP_TAGLINE } from '#shared/constants/app'
import { formatCopyrightNotice } from '#shared/utils/copyright'

const props = defineProps<{
  showTagline?: boolean
}>()

const { branding } = useBranding()

const copyrightText = computed(() => formatCopyrightNotice(branding.value.copyrightHolder))
</script>

<template>
  <p>
    <template v-if="props.showTagline">
      {{ APP_NAME }} — {{ APP_TAGLINE }} · {{ copyrightText }}
    </template>
    <template v-else>
      {{ copyrightText }}
    </template>
  </p>
</template>
