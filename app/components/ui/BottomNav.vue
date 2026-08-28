<script setup lang="ts">
import type { AppNavItem } from '#shared/constants/app'

const props = defineProps<{
  items: AppNavItem[]
}>()

const route = useRoute()

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

const columnCount = computed(() => Math.max(props.items.length, 1))
</script>

<template>
  <nav
    class="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-default bg-elevated/95 backdrop-blur"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }"
    aria-label="Hauptnavigation"
  >
    <div
      class="grid px-1 pt-1"
      :style="{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }"
    >
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center gap-1 min-h-16 mx-0.5 mb-1 rounded-xl px-1 text-[11px] font-medium leading-tight text-center touch-manipulation"
        :class="isActive(item.to) ? 'text-primary bg-primary/10' : 'text-muted'"
      >
        <FontAwesomeIcon
          :icon="item.icon"
          class="size-5 shrink-0"
          :class="isActive(item.to) ? 'opacity-100' : 'opacity-70'"
        />
        {{ item.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
