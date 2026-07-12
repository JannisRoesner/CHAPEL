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
    <div>
      <h1 class="text-2xl font-semibold mb-1">
        Wiedergabe
      </h1>
      <p class="text-muted">
        Gottesdienst für die Wiedergabe auswählen
      </p>
    </div>

    <UAlert
      v-if="isOffline"
      color="warning"
      variant="subtle"
      title="Offline-Modus"
      description="Es werden nur offline vorbereitete Gottesdienste angezeigt."
    />

    <div
      v-if="loading"
      class="grid gap-3 md:grid-cols-2"
    >
      <USkeleton
        v-for="i in 2"
        :key="i"
        class="h-24 w-full"
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
        class="block rounded-xl border border-default bg-elevated/30 p-6 hover:bg-elevated/60 transition-colors touch-manipulation"
        :class="{ 'opacity-50 pointer-events-none': !service.playable }"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="font-semibold text-lg">
            {{ service.name }}
          </p>
          <UBadge
            v-if="service.isCached && !service.isPartial"
            color="success"
            variant="subtle"
            size="sm"
          >
            Offline bereit
          </UBadge>
          <UBadge
            v-else-if="service.isCached && service.isPartial"
            color="warning"
            variant="subtle"
            size="sm"
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
      <UButton to="/services">
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
