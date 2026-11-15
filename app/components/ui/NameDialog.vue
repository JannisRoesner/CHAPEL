<script setup lang="ts">
/** Kleiner Dialog für Umbenennen / Duplizieren / Beschreibung – einzeilig oder mehrzeilig. */
const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(defineProps<{
  title: string
  description?: string
  initialName?: string
  confirmLabel?: string
  loading?: boolean
  /** Mehrzeiliges Textfeld statt Eingabezeile */
  multiline?: boolean
  /** Leere Eingabe erlauben (z. B. Beschreibung entfernen) */
  optional?: boolean
  placeholder?: string
}>(), {
  multiline: false,
  optional: false,
  placeholder: undefined,
  description: undefined,
  initialName: '',
  confirmLabel: 'Speichern',
  loading: false
})

const emit = defineEmits<{
  confirm: [name: string]
}>()

const name = ref('')
const inputRef = useTemplateRef<{ inputRef?: HTMLInputElement, textareaRef?: HTMLTextAreaElement }>('input')

watch(open, async (isOpen) => {
  if (!isOpen) return
  name.value = props.initialName
  await nextTick()
  inputRef.value?.inputRef?.select()
  inputRef.value?.textareaRef?.focus()
})

function submit() {
  const trimmed = name.value.trim()
  if (trimmed || props.optional) emit('confirm', trimmed)
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
  >
    <template #body>
      <form
        id="name-dialog-form"
        @submit.prevent="submit"
      >
        <UTextarea
          v-if="multiline"
          ref="input"
          v-model="name"
          size="xl"
          class="w-full"
          :rows="3"
          autoresize
          :maxrows="8"
          :placeholder="placeholder"
        />
        <UInput
          v-else
          ref="input"
          v-model="name"
          size="xl"
          class="w-full"
          autofocus
          enterkeyhint="done"
          :placeholder="placeholder"
        />
      </form>
    </template>
    <template #footer="{ close }">
      <div class="flex flex-col-reverse sm:flex-row gap-2 w-full sm:justify-end">
        <UButton
          variant="ghost"
          color="neutral"
          class="min-h-11 justify-center"
          @click="close()"
        >
          Abbrechen
        </UButton>
        <UButton
          type="submit"
          form="name-dialog-form"
          class="min-h-11 justify-center"
          :loading="loading"
          :disabled="!optional && !name.trim()"
        >
          {{ confirmLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
