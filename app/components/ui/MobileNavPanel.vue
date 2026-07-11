<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}
</script>

<template>
  <UButton
    class="md:hidden shrink-0 min-w-11 min-h-11"
    variant="ghost"
    :aria-label="open ? 'Menü schließen' : 'Menü öffnen'"
    :aria-expanded="open"
    @click="toggle"
  >
    <FontAwesomeIcon :icon="open ? 'xmark' : 'bars'" />
  </UButton>

  <div
    v-if="open"
    class="md:hidden w-full basis-full mt-2"
  >
    <div class="rounded-xl border border-default bg-elevated p-2 shadow-sm">
      <nav class="flex flex-col gap-1.5">
        <slot :close="close" />
      </nav>
      <div
        v-if="$slots.footer"
        class="mt-2 pt-2 border-t border-default flex flex-col gap-1.5"
      >
        <slot
          name="footer"
          :close="close"
        />
      </div>
    </div>
  </div>
</template>
