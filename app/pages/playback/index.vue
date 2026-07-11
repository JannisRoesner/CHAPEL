<script setup lang="ts">
import type { ServiceDto } from '#shared/types/chapel'

const servicesStore = useServicesStore()
const offlineCache = useOfflineCache()

const loading = ref(true)
const isOffline = ref(false)
const cachedServices = ref<Awaited<ReturnType<typeof offlineCache.getCachedServices>>>([])

interface PlaybackServiceItem {
  id: number
  name: string
  serviceDate: string | null
  isCached: boolean
}

const displayServices = computed<PlaybackServiceItem[]>(() => {
  if (isOffline.value) {
    return cachedServices.value.map(c => ({
      id: c.serviceId,
      name: c.serviceName,
      serviceDate: c.serviceDate,
      isCached: true
    }))
  }

  const cachedIds = new Set(cachedServices.value.map(c => c.serviceId))
  return servicesStore.services.map((s: ServiceDto) => ({
    id: s.id,
    name: s.name,
    serviceDate: s.serviceDate,
    isCached: cachedIds.has(s.id)
  }))
})

onMounted(async () => {
  loading.value = true
  isOffline.value = typeof navigator !== 'undefined' && !navigator.onLine

  cachedServices.value = await offlineCache.getCachedServices()

  if (!isOffline.value) {
    try {
      await servicesStore.fetchServices()
    } catch {
      isOffline.value = true
    }
  }

  loading.value = false
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
      >
        <div class="flex items-start justify-between gap-2">
          <p class="font-semibold text-lg">
            {{ service.name }}
          </p>
          <UBadge
            v-if="service.isCached"
            color="success"
            variant="subtle"
            size="sm"
          >
            Offline bereit
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
