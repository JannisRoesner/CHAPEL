<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  backTo?: string
  backLabel?: string
}>(), {
  backLabel: 'Zurück'
})
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="min-w-0">
      <UiBackLink
        v-if="backTo"
        :to="backTo"
        :label="backLabel"
      />
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="text-muted mt-1 text-base leading-relaxed"
      >
        {{ description }}
      </p>
      <div
        v-if="$slots.below"
        class="mt-2"
      >
        <slot name="below" />
      </div>
    </div>
    <div
      v-if="$slots.actions"
      class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
