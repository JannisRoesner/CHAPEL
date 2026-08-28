<script setup lang="ts">
import type { ServiceDto } from '#shared/types/chapel'
import { useOnline } from '@vueuse/core'

const servicesStore = useServicesStore()
const offlineCache = useOfflineCache()
const online = useOnline()

const loading = ref(true)
const cachedServices = ref<Awaited<ReturnType<typeof offlineCache.getCachedServices>>>([])

interface PlaybackServiceItem {
  id: number
  name: string
  serviceDate: string | null
  isCached: boolean
  isPartial: boolean
  playable: boolean
}

const isOffline = computed(() => !online.value)

const displayServices = computed<PlaybackServiceItem[]>(() => {
  const cachedById = new Map(cachedServices.value.map(c => [c.serviceId, c]))

  if (isOffline.value) {
    return cachedServices.value.map(c => ({
      id: c.serviceId,
      name: c.serviceName,
      serviceDate: c.serviceDate,
      isCached: true,
      isPartial: c.isPartial,
      playable: true
    }))
  }

  return servicesStore.services.map((s: ServiceDto) => {
    const cached = cachedById.get(s.id)
    return {
      id: s.id,
      name: s.name,
      serviceDate: s.serviceDate,
      isCached: !!cached,
      isPartial: cached?.isPartial ?? false,
      playable: true
    }
  })
})

async function refreshCachedServices() {
  cachedServices.value = await offlineCache.getCachedServices()
}

async function loadServices() {
  if (!online.value) return
  try {
    await servicesStore.fetchServices()
  } catch {
    // Netzwerkfehler — cachedServices bleiben verfügbar
  }
}

async function initialize() {
  loading.value = true
  await refreshCachedServices()
  await loadServices()
  loading.value = false
}

onMounted(initialize)

watch(online, async (isNowOnline) => {
  await refreshCachedServices()
  if (isNowOnline) {
    await loadServices()
  }
})
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Wiedergabe"
      description="Gottesdienst für die Wiedergabe auswählen"
    />

    <UAlert
      v-if="isOffline"
      color="warning"
      variant="subtle"
      title="Offline-Modus — nur Wiedergabe"
      description="Es werden nur offline vorbereitete Gottesdienste angezeigt. Verwaltung ist ohne Netzwerk nicht verfügbar."
    />

    <div
      v-if="loading"
      class="grid gap-3 md:grid-cols-2"
    >
      <USkeleton
        v-for="i in 2"
        :key="i"
        class="h-28 w-full rounded-2xl"
      />
    </div>

    <div
      v-else-if="displayServices.length"
      class="grid gap-3 md:grid-cols-2"
    >
      <NuxtLink
        v-for="service in displayServices"
        :key="service.id"
        :to="`/playback/${service.id}`"
        class="min-h-24 rounded-2xl border border-default bg-elevated/40 p-5 sm:p-6 hover:bg-elevated/70 transition-colors touch-manipulation flex items-center gap-4"
        :class="{ 'opacity-50 pointer-events-none': !service.playable }"
      >
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-semibold text-lg truncate">
              {{ service.name }}
            </p>
            <UBadge
              v-if="service.isCached && !service.isPartial"
              color="success"
              variant="subtle"
            >
              Offline bereit
            </UBadge>
            <UBadge
              v-else-if="service.isCached && service.isPartial"
              color="warning"
              variant="subtle"
            >
              Teilweise offline
            </UBadge>
          </div>
          <p
            v-if="service.serviceDate"
            class="text-muted mt-1"
          >
            {{ formatServiceDate(service.serviceDate) }}
          </p>
        </div>
        <div class="shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <FontAwesomeIcon
            icon="play"
            class="text-lg"
          />
        </div>
      </NuxtLink>
    </div>

    <UEmpty
      v-else-if="isOffline"
      title="Keine offline vorbereiteten Gottesdienste"
      description="Bereiten Sie einen Gottesdienst einmal online vor, um ihn ohne Netzwerk abzuspielen."
    />

    <UEmpty
      v-else
      title="Keine Gottesdienste"
      description="Erstellen Sie zuerst einen Gottesdienst."
    >
      <UButton
        to="/services"
        class="min-h-12"
      >
        Zu Gottesdiensten
      </UButton>
    </UEmpty>
  </div>
</template>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
}
</style>
