<script setup lang="ts">
import type { SettingsSectionDefinition } from '#shared/constants/settingsSections'

defineProps<{
  items: SettingsSectionDefinition[]
  defaultOpen?: string[]
}>()
</script>

<template>
  <UCard :ui="{ root: 'rounded-2xl overflow-hidden', body: 'p-0' }">
    <UAccordion
      type="multiple"
      :unmount-on-hide="false"
      :items="items"
      :default-value="defaultOpen"
      :ui="{
        item: 'px-4 sm:px-6',
        trigger: 'py-5 text-base sm:text-lg font-semibold gap-3 min-h-14',
        body: 'pb-6 pt-0'
      }"
    >
      <template #leading="{ item }">
        <div class="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <UIcon
            :name="item.icon || 'i-lucide-settings'"
            class="size-5 text-primary"
          />
        </div>
      </template>
      <template
        v-for="item in items"
        :key="item.value"
        #[item.slot]
      >
        <slot :name="item.slot" />
      </template>
    </UAccordion>
  </UCard>
</template>
