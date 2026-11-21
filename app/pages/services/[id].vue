<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ServiceDto, ServiceItemDto, TrackCategory, TrackDto } from '#shared/types/chapel'

const route = useRoute()
const id = Number(route.params.id)
const toast = useToast()
const servicesStore = useServicesStore()
const nameDialog = useNameDialog()

const service = ref<ServiceDto | null>(null)
const loading = ref(true)
const saving = ref(false)
/** Zuletzt gespeicherte Track-Zuordnung je Schritt – Grundlage für „ungespeichert“ */
const savedTracks = ref(new Map<number, number | null>())
const pickerOpen = ref(false)
const pickerItemId = ref<number | null>(null)
const pickerCategory = ref<TrackCategory>(SONG_KIND)
const trackPreview = useTrackPreview()

function rememberSaved() {
  savedTracks.value = new Map((service.value?.items ?? []).map(i => [i.id, i.trackId]))
}

const changedItems = computed(() =>
  (service.value?.items ?? []).filter(i => savedTracks.value.get(i.id) !== i.trackId)
)
const dirty = computed(() => changedItems.value.length > 0)

async function load() {
  loading.value = true
  try {
    service.value = await $fetch<ServiceDto>(`/api/services/${id}`)
    rememberSaved()
  } finally {
    loading.value = false
  }
}

async function save() {
  if (saving.value || !dirty.value) return
  saving.value = true
  try {
    await $fetch(`/api/services/${id}/items`, {
      method: 'PATCH',
      body: { items: changedItems.value.map(i => ({ id: i.id, trackId: i.trackId })) }
    })
    rememberSaved()
    toast.add({ title: 'Gottesdienst gespeichert', color: 'success', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Speichern fehlgeschlagen', color: 'error' })
  } finally {
    saving.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void save()
  }
}

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (dirty.value) event.preventDefault()
}

onMounted(() => {
  void load()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
})

onUnmounted(() => {
  trackPreview.stop()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})

onBeforeRouteLeave(() => {
  if (dirty.value && !window.confirm('Ungespeicherte Änderungen verwerfen?')) return false
})

function openPicker(item: ServiceItemDto) {
  if (isFixedKind(item.kind)) return
  pickerItemId.value = item.id
  pickerCategory.value = item.kind
  pickerOpen.value = true
}

function onTrackSelected(track: TrackDto) {
  const item = service.value?.items?.find(i => i.id === pickerItemId.value)
  if (item) {
    item.trackId = track.id
    item.track = track
  }
  pickerOpen.value = false
  pickerItemId.value = null
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
          v-if="dirty"
          class="text-warning font-medium"
        >
          Ungespeicherte Änderungen
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
      :category-filter="pickerCategory"
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
        to="/services"
        variant="ghost"
        color="neutral"
        square
        icon="i-lucide-arrow-left"
        class="press size-11 shrink-0 justify-center rounded-full"
        aria-label="Zu Gottesdiensten"
        title="Zu Gottesdiensten"
      />
      <span
        class="h-6 w-px shrink-0 bg-border"
        aria-hidden="true"
      />
      <UButton
        :to="`/playback/${id}`"
        variant="ghost"
        color="neutral"
        class="press min-h-11 rounded-full px-3 sm:px-4"
      >
        <FontAwesomeIcon icon="play" />
        <span>Wiedergabe</span>
      </UButton>
      <UButton
        class="press min-h-11 rounded-full px-4 sm:px-5"
        :loading="saving"
        :aria-label="dirty ? 'Speichern (ungespeicherte Änderungen)' : 'Speichern'"
        title="Speichern (Strg/⌘ + S)"
        @click="save"
      >
        <FontAwesomeIcon
          v-if="!saving"
          icon="floppy-disk"
        />
        <span class="hidden min-[400px]:inline">Speichern</span>
        <span
          v-if="dirty"
          class="size-2 rounded-full bg-current opacity-90"
          aria-hidden="true"
        />
      </UButton>
    </UiFloatingBar>
  </div>
</template>
