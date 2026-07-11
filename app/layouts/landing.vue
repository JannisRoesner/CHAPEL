<script setup lang="ts">
const colorMode = useColorMode()

useLandingAppearance()

useHead({
  htmlAttrs: {
    lang: 'de'
  }
})
</script>

<template>
  <UApp :class="colorMode.value">
    <div class="min-h-screen bg-default text-default flex flex-col">
      <LandingHeader />
      <main class="flex-1">
        <slot />
      </main>
      <LandingFooter />
    </div>
  </UApp>
</template>
