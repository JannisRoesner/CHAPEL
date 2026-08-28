<script setup lang="ts">
import type { ServiceDto, ServiceItemDto, TrackDto } from '#shared/types/chapel'

const route = useRoute()
const id = Number(route.params.id)
const toast = useToast()
const offlineCache = useOfflineCache()
const { preparing, progress, progressLabel, prepareService } = offlineCache

const service = ref<ServiceDto | null>(null)
const loading = ref(true)
const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const pickerOpen = ref(false)
const pickerItemId = ref<number | null>(null)
const isCached = ref(false)
const isPartialCache = ref(false)
const isCacheStaleFlag = ref(false)
const trackPreview = useTrackPreview()

let savedResetTimer: ReturnType<typeof setTimeout> | undefined

async function load() {
  loading.value = true
  try {
    service.value = await $fetch<ServiceDto>(`/api/services/${id}`)
    const cachedRecord = await offlineCache.getCachedService(id)
    isCached.value = !!cachedRecord
    isPartialCache.value = cachedRecord?.isPartial ?? false
    if (isCached.value && service.value) {
      isCacheStaleFlag.value = await offlineCache.isCacheStale(id, service.value.updatedAt)
    } else {
      isCacheStaleFlag.value = false
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)
onUnmounted(() => trackPreview.stop())

function openPicker(item: ServiceItemDto) {
  if (item.kind === 'liturgy') return
  pickerItemId.value = item.id
  pickerOpen.value = true
}

async function onTrackSelected(track: TrackDto) {
  if (!pickerItemId.value || !service.value?.items) return
  saveState.value = 'saving'
  try {
    await $fetch(`/api/services/${id}/items`, {
      method: 'PATCH',
      body: {
        items: [{ id: pickerItemId.value, trackId: track.id }]
      }
    })
    const item = service.value.items.find(i => i.id === pickerItemId.value)
    if (item) {
      item.trackId = track.id
      item.track = track
    }
    pickerOpen.value = false
    pickerItemId.value = null
    saveState.value = 'saved'
    clearTimeout(savedResetTimer)
    savedResetTimer = setTimeout(() => {
      if (saveState.value === 'saved') saveState.value = 'idle'
    }, 2000)
  } catch {
    saveState.value = 'error'
    toast.add({ title: 'Speichern fehlgeschlagen', color: 'error' })
  }
}

async function prepareOffline() {
  if (!service.value) return
  const result = await prepareService(
    id,
    service.value.name,
    service.value.serviceDate,
    service.value.updatedAt
  )

  if (result.success) {
    isCached.value = true
    isPartialCache.value = false
    isCacheStaleFlag.value = false
    toast.add({ title: 'Offline vorbereitet', color: 'success' })
  } else if (result.partial) {
    isCached.value = true
    isPartialCache.value = true
    isCacheStaleFlag.value = false
    const failedHint = result.failedTitles.length
      ? ` Fehlgeschlagen: ${result.failedTitles.slice(0, 3).join(', ')}${result.failedTitles.length > 3 ? '…' : ''}`
      : ''
    toast.add({
      title: 'Teilweise vorbereitet',
      description: `${result.cachedTracks} von ${result.totalTracks} Tracks zwischengespeichert.${failedHint}`,
      color: 'warning'
    })
  } else {
    isCached.value = false
    isPartialCache.value = false
    toast.add({
      title: 'Vorbereitung fehlgeschlagen',
      description: result.errorMessage ?? undefined,
      color: 'error'
    })
  }
}
</script>

<template>
  <div
    v-if="loading"
    class="space-y-3"
  >
    <USkeleton class="h-8 w-64 rounded-xl" />
    <USkeleton
      v-for="i in 4"
      :key="i"
      class="h-24 w-full rounded-2xl"
    />
  </div>

  <div
    v-else-if="service"
    class="space-y-6"
  >
    <UiPageHeader
      :title="service.name"
      :description="formatServiceDate(service.serviceDate)"
      back-to="/services"
      back-label="Zu Gottesdiensten"
    >
      <template #below>
        <p
          v-if="saveState === 'saving'"
          class="text-muted"
        >
          Speichert…
        </p>
        <p
          v-else-if="saveState === 'saved'"
          class="text-success"
        >
          Gespeichert
        </p>
        <p
          v-else-if="saveState === 'error'"
          class="text-error"
        >
          Fehler beim Speichern
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
          <UBadge
            v-if="isCached && !isPartialCache && !isCacheStaleFlag"
            color="success"
            variant="subtle"
          >
            Offline bereit
          </UBadge>
          <UBadge
            v-if="isCached && isPartialCache && !isCacheStaleFlag"
            color="warning"
            variant="subtle"
          >
            Teilweise offline
          </UBadge>
          <UBadge
            v-if="isCached && isCacheStaleFlag"
            color="warning"
            variant="subtle"
          >
            Cache veraltet — erneut vorbereiten
          </UBadge>
        </div>
      </template>
      <template #actions>
        <UButton
          variant="outline"
          class="min-h-12 justify-center w-full sm:w-auto"
          :loading="preparing"
          @click="prepareOffline"
        >
          <FontAwesomeIcon
            icon="cloud-arrow-down"
            class="mr-2"
          />
          Offline vorbereiten
        </UButton>
        <UButton
          :to="`/playback/${id}`"
          color="primary"
          class="min-h-12 justify-center w-full sm:w-auto"
        >
          Zur Wiedergabe
        </UButton>
      </template>
    </UiPageHeader>

    <UProgress
      v-if="preparing"
      :model-value="progress"
      :max="100"
    />
    <p
      v-if="preparing && progressLabel"
      class="text-muted"
    >
      Speichere: {{ progressLabel }} ({{ progress }}%)
    </p>

    <div class="space-y-3">
      <ServicesServiceItemRow
        v-for="item in service.items"
        :key="item.id"
        :item="item"
        @pick="openPicker(item)"
      />
    </div>

    <LibraryTrackPicker
      v-model:open="pickerOpen"
      category-filter="hymn"
      @pick="onTrackSelected"
    />
  </div>
</template>
