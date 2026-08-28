<script setup lang="ts">
const { $pwa } = useNuxtApp()
const offlineCache = useOfflineCache()
const { cachedServiceIds } = offlineCache

const cacheSize = ref('…')
const cachedServices = ref<Awaited<ReturnType<typeof offlineCache.getCachedServices>>>([])
const retryingSw = ref(false)
const clearOpen = ref(false)

const isIos = computed(() => {
  if (!import.meta.client) return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
})

const swStatus = computed(() => {
  if ($pwa?.registrationError) {
    return {
      color: 'error' as const,
      text: 'Service Worker konnte nicht registriert werden. Seite neu laden oder erneut versuchen.'
    }
  }
  if ($pwa?.swActivated) {
    return {
      color: 'success' as const,
      text: 'Offline-fähig — App-Shell zwischengespeichert'
    }
  }
  return {
    color: 'neutral' as const,
    text: 'Service Worker wird initialisiert…'
  }
})

async function installPwa() {
  await $pwa?.install()
}

async function retryServiceWorker() {
  retryingSw.value = true
  try {
    if (import.meta.client) {
      window.location.reload()
    }
  } finally {
    retryingSw.value = false
  }
}

onMounted(async () => {
  cacheSize.value = await offlineCache.getCacheSizeEstimate()
  cachedServices.value = await offlineCache.getCachedServices()
})

function requestClearCache() {
  clearOpen.value = true
}

async function confirmClearCache() {
  await offlineCache.clearCache()
  cacheSize.value = await offlineCache.getCacheSizeEstimate()
  cachedServices.value = []
  clearOpen.value = false
}
</script>

<template>
  <div class="space-y-4">
    <ClientOnly>
      <div class="space-y-3 rounded-2xl border border-default p-5">
        <p class="font-medium">
          App installieren
        </p>
        <p class="text-muted leading-relaxed">
          Als installierte App startet CHAPEL direkt bei der Wiedergabe und bleibt auch ohne Netzwerk nutzbar — sofern Gottesdienste vorbereitet sind.
        </p>

        <UButton
          v-if="$pwa?.showInstallPrompt && !$pwa?.isPWAInstalled"
          variant="outline"
          class="min-h-12"
          @click="installPwa"
        >
          <FontAwesomeIcon
            icon="mobile-alt"
            class="mr-2"
          />
          App installieren
        </UButton>

        <div
          v-else-if="isIos && !$pwa?.isPWAInstalled"
          class="flex items-start gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4"
        >
          <div class="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FontAwesomeIcon
              icon="mobile-alt"
              class="text-primary"
            />
          </div>
          <div>
            <p class="font-medium">
              Zum Home-Bildschirm hinzufügen
            </p>
            <p class="text-muted mt-0.5 leading-relaxed">
              Teilen → „Zum Home-Bildschirm" — CHAPEL als App nutzen, auch ohne Netzwerk.
            </p>
          </div>
        </div>

        <p
          v-else-if="$pwa?.isPWAInstalled"
          class="text-muted"
        >
          CHAPEL ist als App installiert.
        </p>

        <div class="flex flex-wrap items-center gap-2">
          <p
            :class="swStatus.color === 'error' ? 'text-error' : swStatus.color === 'success' ? 'text-success' : 'text-muted'"
          >
            {{ swStatus.text }}
          </p>
          <UButton
            v-if="$pwa?.registrationError"
            variant="soft"
            color="error"
            class="min-h-11"
            :loading="retryingSw"
            @click="retryServiceWorker"
          >
            Seite neu laden
          </UButton>
        </div>
      </div>
    </ClientOnly>

    <p class="text-sm text-muted">
      Geschätzte Nutzung: {{ cacheSize }}
    </p>
    <p class="text-sm text-muted">
      {{ cachedServiceIds.length }} Gottesdienst(e) offline vorbereitet
    </p>

    <ul
      v-if="cachedServices.length"
      class="space-y-3"
    >
      <li
        v-for="service in cachedServices"
        :key="service.serviceId"
        class="rounded-2xl border border-default p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      >
        <div class="min-w-0 flex-1">
          <p class="font-semibold truncate">
            {{ service.serviceName }}
          </p>
          <p
            v-if="service.serviceDate"
            class="text-muted mt-0.5"
          >
            {{ formatServiceDate(service.serviceDate) }}
          </p>
          <p class="text-muted mt-0.5">
            {{ service.cachedTracks }}/{{ service.totalTracks }} Tracks
            <span v-if="service.isPartial"> (teilweise)</span>
          </p>
        </div>
        <UButton
          :to="`/playback/${service.serviceId}`"
          variant="outline"
          class="min-h-12 justify-center w-full sm:w-auto"
        >
          Zur Wiedergabe
        </UButton>
      </li>
    </ul>

    <UEmpty
      v-else
      title="Noch keine Gottesdienste offline"
      description="Öffnen Sie einen Gottesdienst und tippen Sie auf „Offline vorbereiten“."
    />

    <UButton
      color="error"
      variant="outline"
      class="min-h-12"
      :disabled="!cachedServices.length"
      @click="requestClearCache"
    >
      <FontAwesomeIcon
        icon="trash"
        class="mr-2"
      />
      Cache leeren
    </UButton>

    <UiConfirmModal
      v-model:open="clearOpen"
      title="Cache leeren"
      description="Offline-Cache wirklich leeren?"
      confirm-label="Cache leeren"
      @confirm="confirmClearCache"
    />
  </div>
</template>
