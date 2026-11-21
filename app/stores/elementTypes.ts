import { defineStore } from 'pinia'

import type { ElementTypeDto } from '#shared/types/chapel'

/** Elementtypen (= Bibliotheks-Kategorien). Startet mit den Grundtypen, lädt dann vom Server. */
export const useElementTypesStore = defineStore('elementTypes', () => {
  const types = ref<ElementTypeDto[]>([...BUILTIN_ELEMENT_TYPES])
  const loaded = ref(false)

  async function fetchTypes() {
    try {
      types.value = await $fetch<ElementTypeDto[]>('/api/element-types')
      loaded.value = true
    } catch {
      // nicht angemeldet / offline: Grundtypen behalten
    }
  }

  function get(key: string) {
    return resolveElementType(types.value, key)
  }

  /** Bezeichnungen, die beim Typwechsel oder bei der Track-Wahl ersetzt werden dürfen */
  const defaultLabels = computed(() => ['Liturgieelement', 'Lied-Slot', 'Lied', ...types.value.map(t => t.defaultLabel)])

  const options = computed(() => types.value.map(t => ({ label: t.label, value: t.key, icon: t.icon })))

  return { types, loaded, fetchTypes, get, defaultLabels, options }
})
