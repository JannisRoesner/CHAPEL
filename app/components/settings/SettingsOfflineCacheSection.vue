<script setup lang="ts">
const { $pwa } = useNuxtApp()
const offlineCache = useOfflineCache()
const { cachedServiceIds } = offlineCache

const cacheSize = ref('…')
const cachedServices = ref<Awaited<ReturnType<typeof offlineCache.getCachedServices>>>([])

const isIos = computed(() => {
  if (!import.meta.client) return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
})

const swStatus = computed(() => {
  if ($pwa?.registrationError) {
    return { color: 'error' as const, text: 'Service Worker konnte nicht registriert werden — Seite neu laden' }
  }
  if ($pwa?.swActivated) {
    return { color: 'success' as const, text: 'Offline-fähig — App-Shell zwischengespeichert' }
  }
  return { color: 'neutral' as const, text: 'Service Worker wird initialisiert…' }
})

async function installPwa() {
  await $pwa?.install()
}

onMounted(async () => {
  cacheSize.value = await offlineCache.getCacheSizeEstimate()
  cachedServices.value = await offlineCache.getCachedServices()
})

async function clearCache() {
  if (!confirm('Offline-Cache wirklich leeren?')) return
  await offlineCache.clearCache()
  cacheSize.value = await offlineCache.getCacheSizeEstimate()
  cachedServices.value = []
}
</script>

<template>
  <div class="space-y-4">
    <ClientOnly>
      <div class="space-y-3 rounded-lg border border-default p-4">
        <p class="font-medium text-sm">
          App installieren
        </p>

        <UButton
          v-if="$pwa?.showInstallPrompt && !$pwa?.isPWAInstalled"
          variant="outline"
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
          class="flex items-start gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4"
        >
          <div class="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FontAwesomeIcon
              icon="mobile-alt"
              class="text-primary"
            />
          </div>
          <div>
            <p class="font-medium text-sm">
              Zum Home-Bildschirm hinzufügen
            </p>
            <p class="text-xs text-muted mt-0.5">
              Teilen → „Zum Home-Bildschirm" — CHAPEL als App nutzen, auch ohne Netzwerk.
            </p>
          </div>
        </div>

        <p
          v-else-if="$pwa?.isPWAInstalled"
          class="text-sm text-muted"
        >
          CHAPEL ist als App installiert.
        </p>

        <p
          class="text-xs"
          :class="swStatus.color === 'error' ? 'text-error' : swStatus.color === 'success' ? 'text-success' : 'text-muted'"
        >
          {{ swStatus.text }}
        </p>
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
      class="divide-y divide-default rounded-lg border border-default overflow-hidden"
    >
      <li
        v-for="service in cachedServices"
        :key="service.serviceId"
        class="flex items-center justify-between gap-3 px-4 py-3"
      >
        <div class="min-w-0">
          <p class="font-medium truncate">
            {{ service.serviceName }}
          </p>
          <p
            v-if="service.serviceDate"
            class="text-sm text-muted"
          >
            {{ formatServiceDate(service.serviceDate) }}
          </p>
          <p class="text-xs text-muted mt-0.5">
            {{ service.cachedTracks }}/{{ service.totalTracks }} Tracks
            <span v-if="service.isPartial"> (teilweise)</span>
          </p>
        </div>
        <UButton
          :to="`/playback/${service.serviceId}`"
          variant="outline"
          size="sm"
        >
          Zur Wiedergabe
        </UButton>
      </li>
    </ul>

    <UButton
      color="error"
      variant="outline"
      @click="clearCache"
    >
      <FontAwesomeIcon
        icon="trash"
        class="mr-2"
      />
      Cache leeren
    </UButton>
  </div>
</template>
