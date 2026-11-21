<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ItemKind, ServiceTypeDto, TrackDto } from '#shared/types/chapel'

interface EditableItem {
  uid: number
  /** ID des gespeicherten Vorlagen-Schritts (fehlt bei neuen Schritten) */
  id?: number
  kind: ItemKind
  label: string
  defaultTrackId: number | null
  defaultTrack?: TrackDto | null
}

const route = useRoute()
const id = Number(route.params.id)
const toast = useToast()
const libraryStore = useLibraryStore()
const servicesStore = useServicesStore()
const nameDialog = useNameDialog()

const serviceType = ref<ServiceTypeDto | null>(null)
const items = ref<EditableItem[]>([])
const savedSnapshot = ref('')
const loading = ref(true)
const saving = ref(false)
const pickerOpen = ref(false)
const pickerTargetUid = ref<number | null>(null)
const pickerFilter = ref<'hymn' | 'liturgy'>('hymn')
const listRef = ref<HTMLElement | null>(null)
let uidCounter = 0

const { toggle, isPlaying, stop } = useTrackPreview()

const DEFAULT_LABELS = ['Liturgieelement', 'Lied-Slot', 'Lied']

function snapshot() {
  return JSON.stringify(items.value.map(i => [i.kind, i.label.trim(), i.defaultTrackId]))
}
const dirty = computed(() => !loading.value && snapshot() !== savedSnapshot.value)

const sortable = useSortableList({
  container: listRef,
  count: () => items.value.length,
  move(from, to) {
    const [item] = items.value.splice(from, 1)
    items.value.splice(to, 0, item!)
  }
})

async function load() {
  loading.value = true
  try {
    await libraryStore.fetchTracks()
    serviceType.value = await $fetch<ServiceTypeDto>(`/api/service-types/${id}`)
    items.value = (serviceType.value.items || []).map(item => ({
      uid: ++uidCounter,
      id: item.id,
      kind: item.kind,
      label: item.label,
      defaultTrackId: item.defaultTrackId ?? null,
      defaultTrack: item.defaultTrack ?? null
    }))
    savedSnapshot.value = snapshot()
  } finally {
    loading.value = false
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

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})

onBeforeRouteLeave(() => {
  if (dirty.value && !window.confirm('Ungespeicherte Änderungen verwerfen?')) return false
})

async function addItem(kind: ItemKind) {
  items.value.push({
    uid: ++uidCounter,
    kind,
    label: kind === 'liturgy' ? 'Liturgieelement' : 'Lied',
    defaultTrackId: null,
    defaultTrack: null
  })
  await nextTick()
  const last = listRef.value?.lastElementChild as HTMLElement | undefined
  last?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  last?.querySelector('input')?.focus({ preventScroll: true })
}

/** Liturgie ↔ Lied-Slot; Standard-Bezeichnungen wandern mit, eigene bleiben. */
function toggleKind(item: EditableItem) {
  const next: ItemKind = item.kind === 'liturgy' ? 'songSlot' : 'liturgy'
  if (DEFAULT_LABELS.includes(item.label)) item.label = next === 'liturgy' ? 'Liturgieelement' : 'Lied'
  item.kind = next
}

function removeItem(uid: number) {
  items.value = items.value.filter(i => i.uid !== uid)
}

function openPicker(item: EditableItem) {
  pickerTargetUid.value = item.uid
  pickerFilter.value = item.kind === 'liturgy' ? 'liturgy' : 'hymn'
  pickerOpen.value = true
}

function clearTrack(item: EditableItem) {
  item.defaultTrackId = null
  item.defaultTrack = null
}

function onTrackPicked(track: TrackDto) {
  const item = items.value.find(i => i.uid === pickerTargetUid.value)
  if (!item) return
  if (!item.label.trim() || DEFAULT_LABELS.includes(item.label)) item.label = track.title
  item.defaultTrackId = track.id
  item.defaultTrack = track
  pickerTargetUid.value = null
}

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    const result = await $fetch<{ itemIds: number[] }>(`/api/service-types/${id}/items`, {
      method: 'PUT',
      body: {
        items: items.value.map((item, position) => ({
          id: item.id,
          position,
          kind: item.kind,
          label: item.label.trim() || (item.kind === 'liturgy' ? 'Liturgieelement' : 'Lied'),
          defaultTrackId: item.defaultTrackId ?? null
        }))
      }
    })
    items.value.forEach((item, index) => {
      item.id = result.itemIds[index]
    })
    savedSnapshot.value = snapshot()
    toast.add({ title: 'Vorlage gespeichert', color: 'success', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Speichern fehlgeschlagen', color: 'error' })
  } finally {
    saving.value = false
  }
}

function rename() {
  if (!serviceType.value) return
  nameDialog.ask({ title: 'Vorlage umbenennen', initialName: serviceType.value.name }, async (name) => {
    const updated = await $fetch<ServiceTypeDto>(`/api/service-types/${id}`, { method: 'PATCH', body: { name } })
    serviceType.value = { ...serviceType.value!, name: updated.name }
    servicesStore.upsertServiceType(updated)
  })
}

function editDescription() {
  if (!serviceType.value) return
  nameDialog.ask({
    title: 'Beschreibung bearbeiten',
    description: 'Erscheint unter dem Namen der Vorlage. Leer lassen, um sie zu entfernen.',
    initialName: serviceType.value.description ?? '',
    multiline: true,
    optional: true,
    placeholder: 'z. B. Ablauf für den Sonntagvormittag'
  }, async (description) => {
    const updated = await $fetch<ServiceTypeDto>(`/api/service-types/${id}`, {
      method: 'PATCH',
      body: { description: description || null }
    })
    serviceType.value = { ...serviceType.value!, description: updated.description }
    servicesStore.upsertServiceType(updated)
  })
}

function duplicate() {
  if (!serviceType.value) return
  nameDialog.ask({
    title: 'Vorlage duplizieren',
    description: dirty.value ? 'Es wird der zuletzt gespeicherte Stand kopiert.' : undefined,
    initialName: `${serviceType.value.name} (Kopie)`,
    confirmLabel: 'Duplizieren'
  }, async (name) => {
    const copy = await $fetch<ServiceTypeDto>(`/api/service-types/${id}/duplicate`, { method: 'POST', body: { name } })
    servicesStore.upsertServiceType(copy)
    toast.add({ title: 'Vorlage dupliziert', color: 'success' })
    await navigateTo(`/service-types/${copy.id}`)
  })
}

const headerMenu = computed<DropdownMenuItem[][]>(() => [[
  { label: 'Umbenennen', icon: 'i-lucide-pencil', onSelect: rename },
  { label: 'Beschreibung bearbeiten', icon: 'i-lucide-text', onSelect: editDescription },
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
      class="h-28 w-full rounded-2xl"
    />
  </div>

  <div
    v-else-if="serviceType"
    class="space-y-6 pb-28"
  >
    <UiPageHeader
      :title="serviceType.name"
      back-to="/service-types"
      back-label="Zu Vorlagen"
    >
      <template #below>
        <button
          type="button"
          class="press group -ml-2 flex max-w-full items-start gap-2 rounded-lg px-2 py-1 text-left text-muted hover:bg-elevated hover:text-default"
          @click="editDescription"
        >
          <span
            class="whitespace-pre-line leading-relaxed"
            :class="serviceType.description ? '' : 'italic text-dimmed'"
          >{{ serviceType.description || 'Beschreibung hinzufügen' }}</span>
          <UIcon
            name="i-lucide-pencil"
            class="mt-1 size-3.5 shrink-0 opacity-60 group-hover:opacity-100"
          />
        </button>
        <p class="mt-1 text-sm text-dimmed">
          Reihenfolge per Griff ⋮⋮ ziehen
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

    <ol
      ref="listRef"
      class="space-y-3"
      aria-label="Ablauf"
    >
      <li
        v-for="(item, index) in items"
        :key="item.uid"
        class="sortable-item relative rounded-2xl border bg-elevated p-3 sm:p-4"
        :class="sortable.dragIndex.value === index
          ? 'border-primary ring-2 ring-primary/40 shadow-2xl shadow-black/25'
          : 'border-accented shadow-sm shadow-black/5'"
        :style="sortable.itemStyle(index)"
      >
        <div class="flex items-start gap-2 sm:gap-3">
          <button
            type="button"
            data-drag-handle
            class="drag-handle shrink-0 -my-1 -ml-1 flex min-h-12 w-10 items-center justify-center rounded-xl text-dimmed hover:text-default hover:bg-accented focus-visible:outline-2 focus-visible:outline-primary"
            :aria-label="`${item.label} verschieben (Pfeiltasten)`"
            @pointerdown="sortable.onHandlePointerDown($event, index)"
            @keydown="sortable.onHandleKeydown($event, index)"
          >
            <FontAwesomeIcon icon="grip-vertical" />
          </button>

          <div class="flex-1 min-w-0 space-y-3">
            <div class="flex items-center gap-2">
              <UBadge
                :color="item.kind === 'liturgy' ? 'secondary' : 'primary'"
                variant="subtle"
                class="shrink-0"
              >
                {{ index + 1 }} · {{ kindLabel(item.kind) }}
              </UBadge>
              <UButton
                variant="ghost"
                color="neutral"
                size="sm"
                icon="i-lucide-repeat"
                class="press min-h-9 shrink-0"
                :aria-label="`Art ändern zu ${kindLabel(item.kind === 'liturgy' ? 'songSlot' : 'liturgy')}`"
                @click="toggleKind(item)"
              >
                {{ item.kind === 'liturgy' ? 'Zu Lied-Slot' : 'Zu Liturgie' }}
              </UButton>
            </div>
            <UInput
              v-model="item.label"
              size="lg"
              class="w-full"
              :aria-label="`Bezeichnung Schritt ${index + 1}`"
            />

            <div class="flex items-center gap-2 rounded-xl bg-default/70 p-1.5 pl-3">
              <FontAwesomeIcon
                icon="music"
                class="text-dimmed shrink-0"
              />
              <p
                class="flex-1 min-w-0 truncate"
                :class="item.defaultTrack ? '' : 'text-muted'"
              >
                <template v-if="item.defaultTrack">
                  {{ item.defaultTrack.title }}
                  <span
                    v-if="item.defaultTrack.playbackRate !== 1"
                    class="text-muted"
                  >· {{ formatPlaybackRate(item.defaultTrack.playbackRate) }}</span>
                </template>
                <template v-else>
                  {{ item.kind === 'liturgy' ? 'Kein Track gewählt' : 'Kein Standard-Lied (optional)' }}
                </template>
              </p>
              <UButton
                v-if="item.defaultTrackId"
                :variant="isPlaying(item.defaultTrackId) ? 'solid' : 'ghost'"
                color="neutral"
                square
                class="press min-h-10 min-w-10 justify-center"
                :aria-label="isPlaying(item.defaultTrackId) ? 'Wiedergabe stoppen' : 'Probehören'"
                @click="toggle(item.defaultTrackId)"
              >
                <FontAwesomeIcon :icon="isPlaying(item.defaultTrackId) ? 'stop' : 'play'" />
              </UButton>
              <UButton
                v-if="item.defaultTrackId && item.kind === 'songSlot'"
                variant="ghost"
                color="neutral"
                square
                icon="i-lucide-x"
                class="press min-h-10 min-w-10 justify-center"
                aria-label="Standard-Lied entfernen"
                @click="clearTrack(item)"
              />
              <UButton
                variant="soft"
                class="press min-h-10 shrink-0"
                @click="openPicker(item)"
              >
                {{ item.defaultTrackId ? 'Ändern' : 'Wählen' }}
              </UButton>
            </div>
          </div>

          <UButton
            variant="ghost"
            color="error"
            square
            class="press min-h-11 min-w-11 shrink-0 justify-center -mr-1 -mt-1"
            aria-label="Schritt entfernen"
            @click="removeItem(item.uid)"
          >
            <FontAwesomeIcon icon="trash" />
          </UButton>
        </div>
      </li>
    </ol>

    <UEmpty
      v-if="!items.length"
      icon="i-lucide-list-plus"
      title="Noch keine Schritte"
      description="Fügen Sie unten Liturgieelemente und Lieder hinzu."
    />

    <LibraryTrackPicker
      v-model:open="pickerOpen"
      :category-filter="pickerFilter"
      @pick="onTrackPicked"
    />

    <UiNameDialog
      v-model:open="nameDialog.state.open"
      :title="nameDialog.state.title"
      :description="nameDialog.state.description"
      :initial-name="nameDialog.state.initialName"
      :confirm-label="nameDialog.state.confirmLabel"
      :multiline="nameDialog.state.multiline"
      :optional="nameDialog.state.optional"
      :placeholder="nameDialog.state.placeholder"
      :loading="nameDialog.state.loading"
      @confirm="nameDialog.confirm"
    />

    <UiFloatingBar>
      <UButton
        to="/service-types"
        variant="ghost"
        color="neutral"
        square
        icon="i-lucide-arrow-left"
        class="press size-11 shrink-0 justify-center rounded-full"
        aria-label="Zu Vorlagen"
        title="Zu Vorlagen"
      />
      <span
        class="h-6 w-px shrink-0 bg-border"
        aria-hidden="true"
      />
      <UButton
        variant="ghost"
        color="neutral"
        class="press min-h-11 rounded-full px-3 sm:px-4"
        @click="addItem('liturgy')"
      >
        <FontAwesomeIcon icon="plus" />
        <span>Liturgie<span class="hidden sm:inline">element</span></span>
      </UButton>
      <UButton
        variant="ghost"
        color="neutral"
        class="press min-h-11 rounded-full px-3 sm:px-4"
        @click="addItem('songSlot')"
      >
        <FontAwesomeIcon icon="plus" />
        <span>Lied</span>
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
        <span class="hidden min-[440px]:inline">Speichern</span>
        <span
          v-if="dirty"
          class="size-2 rounded-full bg-current opacity-90"
          aria-hidden="true"
        />
      </UButton>
    </UiFloatingBar>
  </div>
</template>

<style scoped>
.sortable-item {
  transition: transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 200ms ease, border-color 200ms ease;
  will-change: transform;
}

.drag-handle {
  touch-action: none;
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

@media (prefers-reduced-motion: reduce) {
  .sortable-item {
    transition: none;
  }
}
</style>
