<script setup lang="ts">
const colorMode = useColorMode()
</script>

<template>
  <UApp :class="colorMode.value">
    <div class="min-h-screen bg-default text-default flex flex-col w-full min-w-0 overflow-x-clip">
      <slot />
    </div>
  </UApp>
</template>
