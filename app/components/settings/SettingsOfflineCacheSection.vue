<script setup lang="ts">
const offlineCache = useOfflineCache()
const { cachedServiceIds } = offlineCache

const cacheSize = ref('…')

onMounted(async () => {
  cacheSize.value = await offlineCache.getCacheSizeEstimate()
})

async function clearCache() {
  if (!confirm('Offline-Cache wirklich leeren?')) return
  await offlineCache.clearCache()
  cacheSize.value = await offlineCache.getCacheSizeEstimate()
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
