<script setup lang="ts">
import { COLOR_SCHEMES } from '#shared/constants/colorSchemes'
import type { AppearanceMode, ColorSchemeId } from '#shared/constants/colorSchemes'

const open = defineModel<boolean>('open', { default: false })

const { colorScheme, appearanceMode, setColorScheme, setAppearanceMode } = useLandingAppearance()

const appearanceItems = [
  { label: 'System', value: 'system' as AppearanceMode },
  { label: 'Hell', value: 'light' as AppearanceMode },
  { label: 'Dunkel', value: 'dark' as AppearanceMode }
]

function selectScheme(schemeId: ColorSchemeId) {
  setColorScheme(schemeId)
}

function onAppearanceChange(mode: AppearanceMode) {
  setAppearanceMode(mode)
}

function close() {
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard class="max-w-lg">
        <template #header>
          <h3 class="font-semibold">
            Erscheinungsbild
          </h3>
          <p class="text-sm text-muted mt-1">
            Farbschema und Modus für die Vorschau anpassen
          </p>
        </template>

        <div class="space-y-6">
          <UFormField label="Modus">
            <USelect
              :model-value="appearanceMode"
              :items="appearanceItems"
              @update:model-value="onAppearanceChange"
            />
          </UFormField>

          <div>
            <p class="text-sm font-medium mb-3">
              Farbschema
            </p>
            <div class="grid gap-3 sm:grid-cols-2">
              <button
                v-for="scheme in COLOR_SCHEMES"
                :key="scheme.id"
                type="button"
                class="rounded-lg border p-4 text-left transition-colors"
                :class="colorScheme === scheme.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-default hover:bg-elevated/50'"
                @click="selectScheme(scheme.id)"
              >
                <div class="flex items-center gap-3 mb-2">
                  <span
                    v-for="(color, index) in scheme.preview"
                    :key="index"
                    class="h-6 w-6 rounded-full border border-default"
                    :style="{ backgroundColor: color }"
                  />
                </div>
                <p class="font-medium">
                  {{ scheme.name }}
                </p>
                <p class="text-sm text-muted mt-1">
                  {{ scheme.description }}
                </p>
              </button>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton @click="close">
              Schließen
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
