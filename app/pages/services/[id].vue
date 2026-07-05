<script setup lang="ts">
import type { ServiceDto, ServiceItemDto, TrackDto } from '#shared/types/chapel'

const route = useRoute()
const id = Number(route.params.id)
const toast = useToast()
const offlineCache = useOfflineCache()
const { preparing, progress, prepareService, isServiceCached } = offlineCache

const service = ref<ServiceDto | null>(null)
const loading = ref(true)
const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const pickerOpen = ref(false)
const pickerItemId = ref<number | null>(null)
const isCached = ref(false)
const trackPreview = useTrackPreview()

let savedResetTimer: ReturnType<typeof setTimeout> | undefined

async function load() {
  loading.value = true
  try {
    service.value = await $fetch<ServiceDto>(`/api/services/${id}`)
    isCached.value = await isServiceCached(id)
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
  await prepareService(id, service.value.name)
  isCached.value = true
  toast.add({ title: 'Offline vorbereitet', color: 'success' })
}
</script>

<template>
  <div
    v-if="loading"
    class="space-y-3"
  >
    <USkeleton class="h-8 w-64" />
    <USkeleton
      v-for="i in 4"
      :key="i"
      class="h-16 w-full"
    />
  </div>

  <div
    v-else-if="service"
    class="space-y-6"
  >
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <UButton
          to="/services"
          variant="ghost"
          size="sm"
          class="mb-2"
        >
          ← Zurück
        </UButton>
        <h1 class="text-2xl font-semibold">
          {{ service.name }}
        </h1>
        <p class="text-muted">
          {{ formatServiceDate(service.serviceDate) }}
        </p>
        <p
          v-if="saveState === 'saving'"
          class="text-sm text-muted mt-1"
        >
          Speichert…
        </p>
        <p
          v-else-if="saveState === 'saved'"
          class="text-sm text-success mt-1"
        >
          Gespeichert
        </p>
        <p
          v-else-if="saveState === 'error'"
          class="text-sm text-error mt-1"
        >
          Fehler beim Speichern
        </p>
        <UBadge
          v-if="isCached"
          color="success"
          variant="subtle"
          class="mt-2"
        >
          Offline bereit
        </UBadge>
      </div>
      <div class="flex gap-2">
        <UButton
          variant="outline"
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
        >
          Zur Wiedergabe
        </UButton>
      </div>
    </div>

    <UProgress
      v-if="preparing"
      :model-value="progress"
      :max="100"
    />

    <div class="divide-y divide-default rounded-lg border border-default overflow-hidden">
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
