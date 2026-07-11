<script setup lang="ts">
import { LEGAL_ROUTES } from '#shared/constants/legal'
</script>

<template>
  <nav class="flex flex-wrap items-center gap-x-4 gap-y-1">
    <NuxtLink
      :to="LEGAL_ROUTES.impressum"
      class="text-primary hover:underline"
    >
      Impressum
    </NuxtLink>
    <NuxtLink
      :to="LEGAL_ROUTES.privacy"
      class="text-primary hover:underline"
    >
      Datenschutz
    </NuxtLink>
  </nav>
</template>
