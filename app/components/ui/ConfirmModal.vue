<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

withDefaults(defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'error' | 'primary'
  loading?: boolean
}>(), {
  confirmLabel: 'Bestätigen',
  cancelLabel: 'Abbrechen',
  confirmColor: 'error',
  loading: false
})

const emit = defineEmits<{
  confirm: []
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
  >
    <template #footer="{ close }">
      <div class="flex flex-col-reverse sm:flex-row gap-2 w-full sm:justify-end">
        <UButton
          variant="ghost"
          color="neutral"
          class="min-h-11 justify-center"
          @click="close()"
        >
          {{ cancelLabel }}
        </UButton>
        <UButton
          :color="confirmColor"
          class="min-h-11 justify-center"
          :loading="loading"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
