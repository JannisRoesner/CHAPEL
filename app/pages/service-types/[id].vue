<script setup lang="ts">
import type { ItemKind, ServiceTypeDto, TrackDto } from '#shared/types/chapel'

const route = useRoute()
const id = Number(route.params.id)
const toast = useToast()
const libraryStore = useLibraryStore()

const serviceType = ref<ServiceTypeDto | null>(null)
const items = ref<Array<{
  id?: number
  position: number
  kind: ItemKind
  label: string
  defaultTrackId: number | null
  defaultTrack?: TrackDto | null
}>>([])
const loading = ref(true)
const saving = ref(false)
const pickerOpen = ref(false)
const pickerTargetIndex = ref<number | null>(null)
const pickerFilter = ref<'hymn' | 'liturgy'>('hymn')

const { toggle, isPlaying } = useTrackPreview()

async function load() {
  loading.value = true
  try {
    await libraryStore.fetchTracks()
    serviceType.value = await $fetch<ServiceTypeDto>(`/api/service-types/${id}`)
    items.value = (serviceType.value.items || []).map(item => ({
      ...item,
      defaultTrackId: item.defaultTrackId ?? null
    }))
  } finally {
    loading.value = false
  }
}

onMounted(load)

function addItem(kind: ItemKind) {
  items.value.push({
    position: items.value.length,
    kind,
    label: kind === 'liturgy' ? 'Liturgieelement' : 'Lied-Slot',
    defaultTrackId: null,
    defaultTrack: null
  })
  reindex()
}

function removeItem(index: number) {
  items.value.splice(index, 1)
  reindex()
}

function moveItem(index: number, direction: -1 | 1) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= items.value.length) return
  const [item] = items.value.splice(index, 1)
  items.value.splice(newIndex, 0, item!)
  reindex()
}

function reindex() {
  items.value = items.value.map((item, position) => ({ ...item, position }))
}

function openPicker(index: number, kind: ItemKind) {
  pickerTargetIndex.value = index
  pickerFilter.value = kind === 'liturgy' ? 'liturgy' : 'hymn'
  pickerOpen.value = true
}

function onTrackPicked(track: TrackDto) {
  const index = pickerTargetIndex.value
  if (index == null) return
  const item = items.value[index]
  if (!item) return

  const label
    = !item.label || item.label === 'Liturgieelement' || item.label === 'Lied-Slot'
      ? track.title
      : item.label

  items.value = items.value.map((entry, i) =>
    i === index
      ? { ...entry, defaultTrackId: track.id, defaultTrack: track, label }
      : entry
  )
  pickerTargetIndex.value = null
}

async function save() {
  saving.value = true
  try {
    await $fetch(`/api/service-types/${id}/items`, {
      method: 'PUT',
      body: {
        items: items.value.map(item => ({
          position: item.position,
          kind: item.kind,
          label: item.label,
          defaultTrackId: item.defaultTrackId ?? null
        }))
      }
    })
    toast.add({ title: 'Vorlage gespeichert', color: 'success' })
    await load()
  } catch {
    toast.add({ title: 'Speichern fehlgeschlagen', color: 'error' })
  } finally {
    saving.value = false
  }
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
      class="h-20 w-full"
    />
  </div>

  <div
    v-else-if="serviceType"
    class="space-y-6"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <UButton
          to="/service-types"
          variant="ghost"
          size="sm"
          class="mb-2"
        >
          ← Zurück
        </UButton>
        <h1 class="text-2xl font-semibold">
          {{ serviceType.name }}
        </h1>
        <p class="text-muted">
          Ablauf der Vorlage bearbeiten
        </p>
      </div>
      <UButton
        :loading="saving"
        @click="save"
      >
        Speichern
      </UButton>
    </div>

    <div class="flex gap-2">
      <UButton
        variant="outline"
        @click="addItem('liturgy')"
      >
        + Liturgieelement
      </UButton>
      <UButton
        variant="outline"
        @click="addItem('songSlot')"
      >
        + Lied-Slot
      </UButton>
    </div>

    <div class="space-y-3">
      <UCard
        v-for="(item, index) in items"
        :key="`${item.position}-${index}`"
      >
        <div class="flex flex-wrap items-start gap-3">
          <div class="flex flex-col gap-1 shrink-0">
            <UButton
              size="xs"
              variant="ghost"
              :disabled="index === 0"
              @click="moveItem(index, -1)"
            >
              ↑
            </UButton>
            <UButton
              size="xs"
              variant="ghost"
              :disabled="index === items.length - 1"
              @click="moveItem(index, 1)"
            >
              ↓
            </UButton>
          </div>

          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex flex-wrap gap-3 items-center">
              <UBadge
                :color="item.kind === 'liturgy' ? 'info' : 'neutral'"
                variant="subtle"
              >
                {{ kindLabel(item.kind) }}
              </UBadge>
              <UInput
                v-model="item.label"
                class="flex-1 min-w-48"
              />
            </div>

            <div
              v-if="item.kind === 'liturgy'"
              class="flex items-center gap-3"
            >
              <p class="text-sm flex-1 truncate">
                {{ item.defaultTrack?.title || 'Kein Track gewählt' }}
              </p>
              <UButton
                v-if="item.defaultTrackId"
                variant="outline"
                size="sm"
                :aria-label="isPlaying(item.defaultTrackId) ? 'Wiedergabe stoppen' : 'Probehören'"
                @click="toggle(item.defaultTrackId)"
              >
                <FontAwesomeIcon :icon="isPlaying(item.defaultTrackId) ? 'stop' : 'play'" />
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                @click="openPicker(index, item.kind)"
              >
                {{ item.defaultTrackId ? 'Track ändern' : 'Track wählen' }}
              </UButton>
            </div>

            <div
              v-else
              class="flex items-center gap-3 text-sm text-muted"
            >
              <p class="flex-1 truncate">
                Optional: {{ item.defaultTrack?.title || 'Kein Standard-Lied' }}
              </p>
              <UButton
                v-if="item.defaultTrackId"
                variant="outline"
                size="sm"
                :aria-label="isPlaying(item.defaultTrackId) ? 'Wiedergabe stoppen' : 'Probehören'"
                @click="toggle(item.defaultTrackId)"
              >
                <FontAwesomeIcon :icon="isPlaying(item.defaultTrackId) ? 'stop' : 'play'" />
              </UButton>
              <UButton
                size="xs"
                variant="ghost"
                @click="openPicker(index, item.kind)"
              >
                Standard setzen
              </UButton>
            </div>
          </div>

          <UButton
            variant="ghost"
            color="error"
            size="sm"
            @click="removeItem(index)"
          >
            <FontAwesomeIcon icon="trash" />
          </UButton>
        </div>
      </UCard>
    </div>

    <UEmpty
      v-if="!items.length"
      title="Keine Schritte"
      description="Fügen Sie Liturgieelemente und Lied-Slots hinzu."
    />

    <LibraryTrackPicker
      v-model:open="pickerOpen"
      :category-filter="pickerFilter"
      @pick="onTrackPicked"
    />
  </div>
</template>
