<script setup lang="ts">
const colorMode = useColorMode()
const { toggleDarkMode } = useAppearance()
</script>

<template>
  <UButton
    variant="ghost"
    color="neutral"
    class="min-h-11 min-w-11"
    :aria-label="colorMode.value === 'dark' ? 'Hellmodus' : 'Dunkelmodus'"
    @click="toggleDarkMode"
  >
    <FontAwesomeIcon :icon="colorMode.value === 'dark' ? 'sun' : 'moon'" />
  </UButton>
</template>
