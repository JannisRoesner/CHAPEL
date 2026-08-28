<script setup lang="ts">
const colorMode = useColorMode()

function cycleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <UButton
    variant="ghost"
    color="neutral"
    class="min-h-11 min-w-11"
    :aria-label="colorMode.value === 'dark' ? 'Hellmodus' : 'Dunkelmodus'"
    @click="cycleTheme"
  >
    <FontAwesomeIcon :icon="colorMode.value === 'dark' ? 'sun' : 'moon'" />
  </UButton>
</template>
