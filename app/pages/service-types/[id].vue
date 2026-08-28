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
    <USkeleton class="h-8 w-64 rounded-xl" />
    <USkeleton
      v-for="i in 4"
      :key="i"
      class="h-28 w-full rounded-2xl"
    />
  </div>

  <div
    v-else-if="serviceType"
    class="space-y-6 pb-24 md:pb-0"
  >
    <UiPageHeader
      :title="serviceType.name"
      description="Ablauf der Vorlage bearbeiten"
      back-to="/service-types"
      back-label="Zu Vorlagen"
    >
      <template #actions>
        <UButton
          class="min-h-12 justify-center w-full sm:w-auto"
          :loading="saving"
          @click="save"
        >
          Speichern
        </UButton>
      </template>
    </UiPageHeader>

    <div class="flex flex-col sm:flex-row gap-2">
      <UButton
        variant="outline"
        class="min-h-12 justify-center w-full sm:w-auto"
        @click="addItem('liturgy')"
      >
        + Liturgieelement
      </UButton>
      <UButton
        variant="outline"
        class="min-h-12 justify-center w-full sm:w-auto"
        @click="addItem('songSlot')"
      >
        + Lied-Slot
      </UButton>
    </div>

    <div class="space-y-3">
      <div
        v-for="(item, index) in items"
        :key="`${item.position}-${index}`"
        class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5"
      >
        <div class="flex items-start gap-3">
          <div class="flex flex-col gap-2 shrink-0">
            <UButton
              variant="ghost"
              color="neutral"
              square
              class="min-h-11 min-w-11"
              :disabled="index === 0"
              aria-label="Nach oben"
              @click="moveItem(index, -1)"
            >
              <FontAwesomeIcon icon="chevron-up" />
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              square
              class="min-h-11 min-w-11"
              :disabled="index === items.length - 1"
              aria-label="Nach unten"
              @click="moveItem(index, 1)"
            >
              <FontAwesomeIcon icon="chevron-down" />
            </UButton>
          </div>

          <div class="flex-1 min-w-0 space-y-4">
            <div class="flex flex-col gap-3">
              <UBadge
                :color="item.kind === 'liturgy' ? 'info' : 'neutral'"
                variant="subtle"
                class="self-start"
              >
                {{ kindLabel(item.kind) }}
              </UBadge>
              <UInput
                v-model="item.label"
                class="w-full"
              />
            </div>

            <div class="flex flex-col gap-2">
              <p class="text-muted truncate">
                <template v-if="item.kind === 'liturgy'">
                  {{ item.defaultTrack?.title || 'Kein Track gewählt' }}
                </template>
                <template v-else>
                  Optional: {{ item.defaultTrack?.title || 'Kein Standard-Lied' }}
                </template>
              </p>
              <div class="flex flex-col sm:flex-row gap-2">
                <UButton
                  v-if="item.defaultTrackId"
                  variant="soft"
                  color="neutral"
                  class="min-h-12 justify-center w-full sm:w-auto"
                  :aria-label="isPlaying(item.defaultTrackId) ? 'Wiedergabe stoppen' : 'Probehören'"
                  @click="toggle(item.defaultTrackId)"
                >
                  <FontAwesomeIcon
                    :icon="isPlaying(item.defaultTrackId) ? 'stop' : 'play'"
                    class="mr-2"
                  />
                  {{ isPlaying(item.defaultTrackId) ? 'Stoppen' : 'Probehören' }}
                </UButton>
                <UButton
                  variant="outline"
                  class="min-h-12 justify-center w-full sm:w-auto"
                  @click="openPicker(index, item.kind)"
                >
                  <template v-if="item.kind === 'liturgy'">
                    {{ item.defaultTrackId ? 'Track ändern' : 'Track wählen' }}
                  </template>
                  <template v-else>
                    Standard setzen
                  </template>
                </UButton>
              </div>
            </div>
          </div>

          <UButton
            variant="ghost"
            color="error"
            square
            class="min-h-11 min-w-11 shrink-0"
            aria-label="Schritt entfernen"
            @click="removeItem(index)"
          >
            <FontAwesomeIcon icon="trash" />
          </UButton>
        </div>
      </div>
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

    <div
      class="md:hidden fixed inset-x-0 z-30 border-t border-default bg-elevated/95 backdrop-blur px-4 py-3"
      :style="{ bottom: 'calc(5.25rem + env(safe-area-inset-bottom))' }"
    >
      <UButton
        block
        size="lg"
        class="min-h-12"
        :loading="saving"
        @click="save"
      >
        Speichern
      </UButton>
    </div>
  </div>
</template>
