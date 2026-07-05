<script setup lang="ts">
const colorMode = useColorMode()
</script>

<template>
  <UApp :class="colorMode.value">
    <div class="min-h-screen bg-default text-default flex flex-col">
      <slot />
    </div>
  </UApp>
</template>
