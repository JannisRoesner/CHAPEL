<script setup lang="ts">
const colorMode = useColorMode()
const offlineCache = useOfflineCache()
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
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold mb-1">Einstellungen</h1>
      <p class="text-muted">Darstellung und Offline-Speicher</p>
    </div>

    <UCard>
      <template #header>
        <h2 class="font-medium">Darstellung</h2>
      </template>
      <UFormField label="Farbschema">
        <USelect
          v-model="colorMode.preference"
          :items="[
            { label: 'System', value: 'system' },
            { label: 'Hell', value: 'light' },
            { label: 'Dunkel', value: 'dark' }
          ]"
        />
      </UFormField>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-medium">Offline-Cache</h2>
      </template>
      <div class="space-y-4">
        <p class="text-sm text-muted">
          Geschätzte Nutzung: {{ cacheSize }}
        </p>
        <p class="text-sm text-muted">
          {{ offlineCache.cachedServiceIds.length }} Gottesdienst(e) offline vorbereitet
        </p>
        <UButton color="error" variant="outline" @click="clearCache">
          <FontAwesomeIcon icon="trash" class="mr-2" />
          Cache leeren
        </UButton>
      </div>
    </UCard>
  </div>
</template>
