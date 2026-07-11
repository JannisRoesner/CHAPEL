<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  rows?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeTab = ref<'edit' | 'preview'>('edit')

const localValue = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const tabs = [
  { label: 'Bearbeiten', value: 'edit' as const },
  { label: 'Vorschau', value: 'preview' as const }
]
</script>

<template>
  <div class="border border-default rounded-lg overflow-hidden">
    <div class="flex border-b border-default bg-elevated/50">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="activeTab === tab.value
          ? 'text-primary border-b-2 border-primary -mb-px bg-default'
          : 'text-muted hover:text-default'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="p-3">
      <UTextarea
        v-if="activeTab === 'edit'"
        v-model="localValue"
        :rows="rows ?? 12"
        :placeholder="placeholder"
        class="w-full font-mono text-sm"
        autoresize
      />
      <div
        v-else
        class="min-h-[12rem] p-3 rounded-md bg-elevated/30"
      >
        <UiMarkdownContent
          v-if="localValue.trim()"
          :content="localValue"
        />
        <p
          v-else
          class="text-sm text-muted"
        >
          Noch kein Inhalt — wechseln Sie zu „Bearbeiten“, um Markdown einzugeben.
        </p>
      </div>
    </div>
  </div>
</template>
