<script setup lang="ts">
import type { SettingsSectionDefinition } from '#shared/constants/settingsSections'

defineProps<{
  items: SettingsSectionDefinition[]
  defaultOpen?: string[]
}>()
</script>

<template>
  <UCard :ui="{ body: 'p-0' }">
    <UAccordion
      type="multiple"
      :unmount-on-hide="false"
      :items="items"
      :default-value="defaultOpen"
      :ui="{
        item: 'px-4 sm:px-6',
        trigger: 'py-4 text-base font-medium gap-3',
        body: 'pb-6 pt-0'
      }"
    >
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
