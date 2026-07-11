<script setup lang="ts">
defineProps<{
  title: string
  description: string
  hint?: string
  reverse?: boolean
}>()
</script>

<template>
  <section
    class="py-16 md:py-20"
    :aria-labelledby="`feature-${title.replace(/\s+/g, '-').toLowerCase()}`"
  >
    <div
      class="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 md:gap-16 items-center"
      :class="reverse ? 'md:[direction:rtl]' : ''"
    >
      <div :class="reverse ? 'md:[direction:ltr]' : ''">
        <h3
          :id="`feature-${title.replace(/\s+/g, '-').toLowerCase()}`"
          class="text-2xl md:text-3xl font-bold mb-4"
        >
          {{ title }}
        </h3>
        <p class="text-muted text-lg leading-relaxed">
          {{ description }}
        </p>
        <p
          v-if="hint"
          class="text-sm text-primary mt-4"
        >
          {{ hint }}
        </p>
      </div>

      <div
        class="scale-[0.97] md:scale-100"
        :class="reverse ? 'md:[direction:ltr]' : ''"
      >
        <div class="rounded-2xl border border-default shadow-lg bg-elevated overflow-hidden">
          <div class="flex items-center gap-1.5 px-4 py-2.5 border-b border-default bg-muted/30">
            <span class="size-2.5 rounded-full bg-red-400/80" />
            <span class="size-2.5 rounded-full bg-yellow-400/80" />
            <span class="size-2.5 rounded-full bg-green-400/80" />
          </div>
          <div class="p-4 md:p-6">
            <slot name="preview" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
