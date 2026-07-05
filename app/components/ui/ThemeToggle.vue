<script setup lang="ts">
const colorMode = useColorMode()

function cycleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <UButton
    variant="ghost"
    size="sm"
    :aria-label="colorMode.value === 'dark' ? 'Hellmodus' : 'Dunkelmodus'"
    @click="cycleTheme"
  >
    <FontAwesomeIcon :icon="colorMode.value === 'dark' ? 'sun' : 'moon'" />
  </UButton>
</template>
