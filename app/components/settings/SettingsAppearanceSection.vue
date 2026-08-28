<script setup lang="ts">
import { COLOR_SCHEMES } from '#shared/constants/colorSchemes'
import type { ColorSchemeId } from '#shared/constants/colorSchemes'

const toast = useToast()
const { user } = useUserSession()
const { colorScheme, appearanceMode, colorMode, savePreferences } = useAppearance()

const savingAppearance = ref(false)

const appearanceItems = [
  { label: 'System', value: 'system' },
  { label: 'Hell', value: 'light' },
  { label: 'Dunkel', value: 'dark' }
]

watch(() => colorMode.preference, async (value) => {
  if (!user.value || savingAppearance.value) return
  if (value === appearanceMode.value) return
  await updateAppearanceMode(value as 'system' | 'light' | 'dark')
})

async function updateAppearanceMode(mode: 'system' | 'light' | 'dark') {
  savingAppearance.value = true
  try {
    await savePreferences({ appearanceMode: mode })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Darstellung konnte nicht gespeichert werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    savingAppearance.value = false
  }
}

async function selectColorScheme(schemeId: ColorSchemeId) {
  if (schemeId === colorScheme.value) return
  savingAppearance.value = true
  try {
    await savePreferences({ colorScheme: schemeId })
    toast.add({ title: 'Farbschema gespeichert', color: 'success' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }, statusMessage?: string }
    toast.add({
      title: 'Farbschema konnte nicht gespeichert werden',
      description: err.data?.message || err.statusMessage,
      color: 'error'
    })
  } finally {
    savingAppearance.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <UFormField label="Modus">
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="item in appearanceItems"
          :key="item.value"
          type="button"
          class="min-h-12 rounded-xl border px-3 font-medium transition-colors"
          :class="colorMode.preference === item.value
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-default text-muted hover:bg-elevated/60'"
          :disabled="savingAppearance"
          @click="colorMode.preference = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </UFormField>

    <div>
      <p class="font-medium mb-3">
        Farbschema
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <button
          v-for="scheme in COLOR_SCHEMES"
          :key="scheme.id"
          type="button"
          class="rounded-2xl border p-5 text-left transition-colors min-h-24"
          :class="colorScheme === scheme.id
            ? 'border-primary bg-primary/5 ring-1 ring-primary'
            : 'border-default hover:bg-elevated/50'"
          :disabled="savingAppearance"
          @click="selectColorScheme(scheme.id)"
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
</template>
