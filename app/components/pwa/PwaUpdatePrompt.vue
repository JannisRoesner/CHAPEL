<script setup lang="ts">
const { $pwa } = useNuxtApp()

async function dismissOfflineReady() {
  await $pwa?.cancelPrompt()
}

async function updateApp() {
  await $pwa?.updateServiceWorker(true)
}
</script>

<template>
  <ClientOnly>
    <div
      v-if="$pwa?.offlineReady || $pwa?.needRefresh"
      class="fixed bottom-4 left-4 right-4 z-[100] max-w-lg mx-auto space-y-2"
    >
      <UAlert
        v-if="$pwa?.offlineReady"
        color="success"
        variant="subtle"
        title="Offline bereit"
        description="CHAPEL kann ohne Netzwerk genutzt werden."
      >
        <UButton
          size="sm"
          variant="soft"
          @click="dismissOfflineReady"
        >
          OK
        </UButton>
      </UAlert>
      <UAlert
        v-if="$pwa?.needRefresh"
        color="primary"
        variant="subtle"
        title="Neue Version verfügbar"
        description="Eine aktualisierte Version von CHAPEL ist bereit."
      >
        <UButton
          size="sm"
          @click="updateApp"
        >
          Aktualisieren
        </UButton>
      </UAlert>
    </div>
  </ClientOnly>
</template>
