<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const servicesStore = useServicesStore()
const toast = useToast()
const creating = ref(false)
const newName = ref('')
const deleteOpen = ref(false)
const deleteTarget = ref<{ id: number, name: string } | null>(null)

onMounted(() => servicesStore.fetchServiceTypes())

async function createType() {
  const name = newName.value.trim()
  if (!name) return
  creating.value = true
  try {
    const type = await $fetch('/api/service-types', {
      method: 'POST',
      body: { name }
    })
    servicesStore.upsertServiceType(type)
    newName.value = ''
    toast.add({ title: 'Vorlage erstellt', color: 'success' })
    await navigateTo(`/service-types/${type.id}`)
  } finally {
    creating.value = false
  }
}

function requestDelete(id: number, name: string) {
  deleteTarget.value = { id, name }
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  await $fetch(`/api/service-types/${deleteTarget.value.id}`, { method: 'DELETE' })
  servicesStore.removeServiceType(deleteTarget.value.id)
  deleteOpen.value = false
  deleteTarget.value = null
}

function typeMenu(id: number, name: string): DropdownMenuItem[][] {
  return [[
    {
      label: 'Bearbeiten',
      icon: 'i-lucide-pencil',
      to: `/service-types/${id}`
    },
    {
      label: 'Löschen',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect: () => requestDelete(id, name)
    }
  ]]
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Gottesdienst-Vorlagen"
      description="Feste Liturgieelemente und Lied-Slots für wiederkehrende Gottesdienste"
    />

    <form
      class="flex flex-col sm:flex-row gap-3 rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5"
      @submit.prevent="createType"
    >
      <UInput
        v-model="newName"
        placeholder="Neue Vorlage, z.B. Sonntagsgottesdienst"
        class="flex-1"
        size="lg"
      />
      <UButton
        type="submit"
        class="min-h-12 justify-center"
        :loading="creating"
      >
        Anlegen
      </UButton>
    </form>

    <div
      v-if="servicesStore.serviceTypes.length"
      class="space-y-3"
    >
      <UiListCard
        v-for="type in servicesStore.serviceTypes"
        :key="type.id"
        :title="type.name"
        :meta="type.description || undefined"
        :to="`/service-types/${type.id}`"
      >
        <template #actions>
          <UButton
            :to="`/service-types/${type.id}`"
            variant="soft"
            class="min-h-12 flex-1 sm:flex-none justify-center"
          >
            Bearbeiten
          </UButton>
          <UDropdownMenu :items="typeMenu(type.id, type.name)">
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-lucide-ellipsis-vertical"
              square
              class="min-h-12 min-w-12"
              aria-label="Weitere Aktionen"
            />
          </UDropdownMenu>
        </template>
      </UiListCard>
    </div>

    <UEmpty
      v-else
      title="Keine Vorlagen"
      description="Erstellen Sie eine Vorlage für Ihren Gottesdienstablauf."
    />

    <UiConfirmModal
      v-model:open="deleteOpen"
      title="Vorlage löschen"
      :description="deleteTarget ? `„${deleteTarget.name}“ wirklich löschen?` : undefined"
      confirm-label="Löschen"
      @confirm="confirmDelete"
    />
  </div>
</template>
