<script setup lang="ts">
const offlineCache = useOfflineCache()
const { cachedServiceIds } = offlineCache

const cacheSize = ref('…')
const cachedServices = ref<Awaited<ReturnType<typeof offlineCache.getCachedServices>>>([])

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
