<script setup lang="ts">
import type { TrackDto } from '#shared/types/chapel'

const props = defineProps<{
  track: TrackDto | null
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: [track: TrackDto]
}>()

const title = ref('')
const composer = ref('')
const category = ref<'hymn' | 'liturgy'>('hymn')
const saving = ref(false)

watch(
  () => props.track,
  (track) => {
    if (track) {
      title.value = track.title
      composer.value = track.composer || ''
      category.value = track.category
    }
  },
  { immediate: true }
)

async function save() {
  if (!props.track) return
  saving.value = true
  try {
    const updated = await $fetch<TrackDto>(`/api/tracks/${props.track.id}`, {
      method: 'PATCH',
      body: {
        title: title.value.trim(),
        composer: composer.value.trim() || null,
        category: category.value
      }
    })
    emit('saved', updated)
    emit('update:open', false)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal :open="open" @update:open="emit('update:open', $event)">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="font-semibold">Track bearbeiten</h3>
        </template>

        <div class="space-y-4">
          <UFormField label="Titel">
            <UInput v-model="title" required />
          </UFormField>
          <UFormField label="Komponist">
            <UInput v-model="composer" />
          </UFormField>
          <UFormField label="Kategorie">
            <USelect
              v-model="category"
              :items="[
                { label: 'Lied', value: 'hymn' },
                { label: 'Liturgie', value: 'liturgy' }
              ]"
            />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="emit('update:open', false)">Abbrechen</UButton>
            <UButton :loading="saving" @click="save">Speichern</UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
