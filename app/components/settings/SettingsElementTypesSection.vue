<script setup lang="ts">
import type { ElementTypeColor, ElementTypeDto } from '#shared/types/chapel'

const toast = useToast()
const store = useElementTypesStore()

const editOpen = ref(false)
const editing = ref<ElementTypeDto | null>(null)
const saving = ref(false)
const form = reactive({
  label: '',
  defaultLabel: '',
  fixed: false,
  color: 'neutral' as ElementTypeColor,
  icon: 'i-lucide-music'
})

const deleteTarget = ref<ElementTypeDto | null>(null)
const deleteOpen = ref(false)

const colorOptions = ELEMENT_TYPE_COLORS.map(c => ({ label: c.label, value: c.value }))

onMounted(() => store.fetchTypes())

function errorText(e: unknown) {
  const err = e as { data?: { message?: string, statusMessage?: string }, statusMessage?: string }
  return err.data?.message || err.data?.statusMessage || err.statusMessage
}

function openCreate() {
  editing.value = null
  Object.assign(form, { label: '', defaultLabel: '', fixed: false, color: 'neutral', icon: 'i-lucide-music' })
  editOpen.value = true
}

function openEdit(type: ElementTypeDto) {
  editing.value = type
  Object.assign(form, { label: type.label, defaultLabel: type.defaultLabel, fixed: type.fixed, color: type.color, icon: type.icon })
  editOpen.value = true
}

async function save() {
  if (!form.label.trim()) return
  saving.value = true
  try {
    const body = { ...form, defaultLabel: form.defaultLabel.trim() || form.label.trim() }
    if (editing.value) {
      await $fetch(`/api/element-types/${editing.value.key}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/element-types', { method: 'POST', body })
    }
    await store.fetchTypes()
    editOpen.value = false
    toast.add({ title: editing.value ? 'Elementtyp gespeichert' : 'Elementtyp angelegt', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Speichern fehlgeschlagen', description: errorText(e), color: 'error' })
  } finally {
    saving.value = false
  }
}

async function move(index: number, delta: number) {
  const keys = store.types.map(t => t.key)
  const target = index + delta
  if (target < 0 || target >= keys.length) return
  ;[keys[index], keys[target]] = [keys[target]!, keys[index]!]
  store.types = await $fetch<ElementTypeDto[]>('/api/element-types/order', { method: 'PUT', body: { keys } })
}

function requestDelete(type: ElementTypeDto) {
  deleteTarget.value = type
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  try {
    await $fetch(`/api/element-types/${deleteTarget.value.key}`, { method: 'DELETE' })
    await store.fetchTypes()
    toast.add({ title: 'Elementtyp gelöscht', color: 'success' })
  } catch (e) {
    toast.add({ title: 'Löschen nicht möglich', description: errorText(e), color: 'error' })
  } finally {
    deleteOpen.value = false
    deleteTarget.value = null
  }
}
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-muted">
      Elementtypen bestimmen, welche Art von Schritt in Vorlagen und Gottesdiensten vorkommt – zugleich sind sie die Kategorien der Bibliothek.
      „Fest“ heißt: Der Track kommt aus der Vorlage. „Wählbar“ heißt: Er wird pro Gottesdienst ausgesucht.
    </p>

    <ul class="space-y-2">
      <li
        v-for="(type, index) in store.types"
        :key="type.key"
        class="flex items-center gap-3 rounded-2xl border border-default bg-default p-3"
      >
        <div class="flex flex-col">
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            icon="i-lucide-chevron-up"
            class="press"
            :disabled="index === 0"
            :aria-label="`${type.label} nach oben`"
            @click="move(index, -1)"
          />
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            icon="i-lucide-chevron-down"
            class="press"
            :disabled="index === store.types.length - 1"
            :aria-label="`${type.label} nach unten`"
            @click="move(index, 1)"
          />
        </div>
        <UBadge
          :color="type.color"
          variant="subtle"
          :icon="type.icon"
          size="lg"
          class="shrink-0"
        />
        <div class="min-w-0 flex-1">
          <p class="font-semibold truncate">
            {{ type.label }}
          </p>
          <p class="text-sm text-muted line-clamp-2">
            {{ type.fixed ? 'Fest in der Vorlage' : 'Pro Gottesdienst wählbar' }} · „{{ type.defaultLabel }}“
            <template v-if="type.builtin">
              · Grundtyp
            </template>
          </p>
        </div>
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-pencil"
          class="press min-h-11 min-w-11 justify-center"
          :aria-label="`${type.label} bearbeiten`"
          @click="openEdit(type)"
        />
        <UButton
          v-if="!type.builtin"
          variant="ghost"
          color="error"
          icon="i-lucide-trash-2"
          class="press min-h-11 min-w-11 justify-center"
          :aria-label="`${type.label} löschen`"
          @click="requestDelete(type)"
        />
      </li>
    </ul>

    <UButton
      icon="i-lucide-plus"
      class="press min-h-11 w-full sm:w-auto justify-center"
      @click="openCreate"
    >
      Elementtyp hinzufügen
    </UButton>

    <UModal
      v-model:open="editOpen"
      :title="editing ? 'Elementtyp bearbeiten' : 'Neuer Elementtyp'"
    >
      <template #body>
        <form
          class="space-y-4"
          @submit.prevent="save"
        >
          <UFormField
            label="Name"
            required
          >
            <UInput
              v-model="form.label"
              placeholder="z. B. Musik zur Taufe"
              class="w-full"
              autofocus
            />
          </UFormField>
          <UFormField
            label="Standard-Bezeichnung neuer Schritte"
            :help="form.label ? `Leer lassen für „${form.label}“` : undefined"
          >
            <UInput
              v-model="form.defaultLabel"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Track"
            :help="editing?.builtin ? 'Bei Grundtypen nicht änderbar.' : undefined"
          >
            <div class="grid grid-cols-2 gap-1 rounded-xl bg-elevated p-1">
              <button
                v-for="opt in [{ v: false, l: 'Pro Gottesdienst wählbar' }, { v: true, l: 'Fest in der Vorlage' }]"
                :key="String(opt.v)"
                type="button"
                class="press min-h-11 rounded-lg px-2 text-sm font-medium disabled:opacity-50"
                :class="form.fixed === opt.v ? 'bg-default text-highlighted shadow-sm' : 'text-muted'"
                :disabled="editing?.builtin"
                :aria-pressed="form.fixed === opt.v"
                @click="form.fixed = opt.v"
              >
                {{ opt.l }}
              </button>
            </div>
          </UFormField>
          <UFormField label="Farbe">
            <USelect
              v-model="form.color"
              :items="colorOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Symbol">
            <div class="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
              <button
                v-for="icon in ELEMENT_TYPE_ICONS"
                :key="icon"
                type="button"
                class="press flex aspect-square items-center justify-center rounded-lg border"
                :class="form.icon === icon ? 'border-primary bg-primary/10 text-primary' : 'border-default text-muted hover:bg-elevated'"
                :aria-label="icon.replace('i-lucide-', '')"
                :aria-pressed="form.icon === icon"
                @click="form.icon = icon"
              >
                <UIcon
                  :name="icon"
                  class="size-5"
                />
              </button>
            </div>
          </UFormField>
          <div class="flex items-center gap-2 pt-1">
            <span class="text-sm text-muted">Vorschau:</span>
            <UBadge
              :color="form.color"
              variant="subtle"
              :icon="form.icon"
            >
              {{ form.label || 'Elementtyp' }}
            </UBadge>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <UButton
            variant="ghost"
            color="neutral"
            class="min-h-11 justify-center"
            @click="editOpen = false"
          >
            Abbrechen
          </UButton>
          <UButton
            class="min-h-11 justify-center"
            :loading="saving"
            :disabled="!form.label.trim()"
            @click="save"
          >
            Speichern
          </UButton>
        </div>
      </template>
    </UModal>

    <UiConfirmModal
      v-model:open="deleteOpen"
      title="Elementtyp löschen"
      :description="deleteTarget ? `„${deleteTarget.label}“ löschen? Das geht nur, wenn ihn keine Vorlage, kein Gottesdienst und kein Track mehr verwendet.` : undefined"
      confirm-label="Löschen"
      @confirm="confirmDelete"
    />
  </div>
</template>
