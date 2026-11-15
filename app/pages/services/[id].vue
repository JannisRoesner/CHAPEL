<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ServiceDto, ServiceItemDto, TrackDto } from '#shared/types/chapel'

const route = useRoute()
const id = Number(route.params.id)
const toast = useToast()
const servicesStore = useServicesStore()
const nameDialog = useNameDialog()

const service = ref<ServiceDto | null>(null)
const loading = ref(true)
const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const pickerOpen = ref(false)
const pickerItemId = ref<number | null>(null)
const trackPreview = useTrackPreview()

let savedResetTimer: ReturnType<typeof setTimeout> | undefined

async function load() {
  loading.value = true
  try {
    service.value = await $fetch<ServiceDto>(`/api/services/${id}`)
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

function rename() {
  if (!service.value) return
  nameDialog.ask({ title: 'Gottesdienst umbenennen', initialName: service.value.name }, async (name) => {
    const updated = await $fetch<ServiceDto>(`/api/services/${id}`, { method: 'PATCH', body: { name } })
    service.value = { ...service.value!, name: updated.name, updatedAt: updated.updatedAt }
    servicesStore.upsertService(updated)
  })
}

function duplicate() {
  if (!service.value) return
  nameDialog.ask({
    title: 'Gottesdienst duplizieren',
    description: 'Ablauf und Liedauswahl werden übernommen.',
    initialName: `${service.value.name} (Kopie)`,
    confirmLabel: 'Duplizieren'
  }, async (name) => {
    const copy = await $fetch<ServiceDto>(`/api/services/${id}/duplicate`, { method: 'POST', body: { name } })
    servicesStore.upsertService(copy)
    toast.add({ title: 'Gottesdienst dupliziert', color: 'success' })
    await navigateTo(`/services/${copy.id}`)
  })
}

const headerMenu = computed<DropdownMenuItem[][]>(() => [[
  { label: 'Umbenennen', icon: 'i-lucide-pencil', onSelect: rename },
  { label: 'Duplizieren', icon: 'i-lucide-copy', onSelect: duplicate }
]])
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
    class="space-y-6 pb-28"
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
      </template>
      <template #actions>
        <div class="flex gap-2">
          <UButton
            variant="soft"
            color="neutral"
            icon="i-lucide-pencil"
            class="press min-h-11 flex-1 sm:flex-none justify-center"
            @click="rename"
          >
            Umbenennen
          </UButton>
          <UDropdownMenu :items="headerMenu">
            <UButton
              variant="soft"
              color="neutral"
              icon="i-lucide-ellipsis"
              square
              class="press min-h-11 min-w-11 justify-center"
              aria-label="Weitere Aktionen"
            />
          </UDropdownMenu>
        </div>
      </template>
    </UiPageHeader>

    <ol class="space-y-3">
      <li
        v-for="(item, index) in service.items"
        :key="item.id"
      >
        <ServicesServiceItemRow
          :item="item"
          :index="index"
          @pick="openPicker(item)"
        />
      </li>
    </ol>

    <LibraryTrackPicker
      v-model:open="pickerOpen"
      category-filter="hymn"
      @pick="onTrackSelected"
    />

    <UiNameDialog
      v-model:open="nameDialog.state.open"
      :title="nameDialog.state.title"
      :description="nameDialog.state.description"
      :initial-name="nameDialog.state.initialName"
      :confirm-label="nameDialog.state.confirmLabel"
      :loading="nameDialog.state.loading"
      @confirm="nameDialog.confirm"
    />

    <UiFloatingBar>
      <UButton
        :to="`/playback/${id}`"
        class="press min-h-11 rounded-full px-5"
      >
        <FontAwesomeIcon icon="play" />
        <span>Zur Wiedergabe</span>
      </UButton>
    </UiFloatingBar>
  </div>
</template>
