<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  meta?: string
  to?: string
}>(), {
  to: undefined,
  meta: undefined
})

const NuxtLink = resolveComponent('NuxtLink')
const bodyTag = computed(() => props.to ? NuxtLink : 'div')
</script>

<template>
  <div class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-center hover:bg-elevated/70 transition-colors">
    <component
      :is="bodyTag"
      :to="to"
      class="flex-1 min-w-0 flex items-start gap-3"
      :class="to ? 'rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary' : ''"
    >
      <div
        v-if="$slots.leading"
        class="shrink-0"
      >
        <slot name="leading" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-lg font-semibold truncate">
          {{ title }}
        </p>
        <p
          v-if="meta"
          class="text-muted mt-0.5"
        >
          {{ meta }}
        </p>
        <div
          v-if="$slots.badge"
          class="mt-2 flex flex-wrap gap-2"
        >
          <slot name="badge" />
        </div>
      </div>
    </component>

    <div
      v-if="$slots.actions"
      class="flex items-center gap-2 shrink-0 w-full sm:w-auto"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
