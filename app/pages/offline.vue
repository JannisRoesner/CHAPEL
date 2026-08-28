<script setup lang="ts">
import { LOGIN_ROUTE } from '#shared/constants/app'
import { useOnline } from '@vueuse/core'

definePageMeta({
  layout: 'landing'
})

const online = useOnline()

watch(online, async (isOnline) => {
  if (isOnline) {
    await navigateTo(LOGIN_ROUTE, { replace: true })
  }
})

useSeoMeta({
  title: 'Offline — CHAPEL',
  description: 'CHAPEL ist offline. Melden Sie sich einmal online an und bereiten Sie einen Gottesdienst vor.'
})
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center space-y-6">
      <UiAppLogo size="lg" />

      <div class="space-y-2">
        <h1 class="text-2xl font-semibold">
          Keine Offline-Daten
        </h1>
        <p class="text-muted">
          CHAPEL ist gerade ohne Netzwerk. Melden Sie sich einmal online an und
          bereiten Sie einen Gottesdienst unter „Offline vorbereiten“ vor —
          danach funktioniert die Wiedergabe auch ohne Internet.
        </p>
      </div>

      <UAlert
        color="info"
        variant="subtle"
        title="Tipp"
        description="Installieren Sie CHAPEL als App (PWA), damit die Oberfläche auch offline verfügbar bleibt."
      />

      <UButton
        v-if="online"
        :to="LOGIN_ROUTE"
        block
      >
        Zur Anmeldung
      </UButton>
    </div>
  </div>
</template>
