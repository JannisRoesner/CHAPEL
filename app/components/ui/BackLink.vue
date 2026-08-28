<script setup lang="ts">
withDefaults(defineProps<{
  to: string
  label?: string
}>(), {
  label: 'Zurück'
})
</script>

<template>
  <UButton
    :to="to"
    variant="ghost"
    color="neutral"
    icon="i-lucide-arrow-left"
    :label="label"
    class="mb-2 -ml-2 min-h-11"
  />
</template>
