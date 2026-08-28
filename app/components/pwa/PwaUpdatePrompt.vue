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
      class="fixed left-4 right-4 z-[100] max-w-lg mx-auto space-y-2 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] md:bottom-4"
    >
      <UAlert
        v-if="$pwa?.offlineReady"
        color="success"
        variant="subtle"
        title="App-Shell bereit"
        description="CHAPEL ist installierbar und die Oberfläche ist lokal zwischengespeichert. Für Gottesdienste zusätzlich „Offline vorbereiten“ nutzen."
      >
        <template #actions>
          <UButton
            variant="soft"
            class="min-h-11"
            @click="dismissOfflineReady"
          >
            OK
          </UButton>
        </template>
      </UAlert>
      <UAlert
        v-if="$pwa?.needRefresh"
        color="primary"
        variant="subtle"
        title="Update verfügbar"
        description="Eine neue Version von CHAPEL ist bereit. Bitte aktualisieren, um Fehlerbehebungen und Verbesserungen zu erhalten."
      >
        <template #actions>
          <UButton
            class="min-h-11"
            @click="updateApp"
          >
            Jetzt aktualisieren
          </UButton>
        </template>
      </UAlert>
    </div>
  </ClientOnly>
</template>
