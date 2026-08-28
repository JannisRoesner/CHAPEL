<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ServiceDto, ServiceTypeDto } from '#shared/types/chapel'

const servicesStore = useServicesStore()
const toast = useToast()
const creating = ref(false)
const createOpen = ref(false)
const selectedTypeId = ref<number | undefined>(undefined)
const serviceName = ref('')
const serviceDate = ref(new Date().toISOString().slice(0, 10))
const deleteOpen = ref(false)
const deleteTarget = ref<{ id: number, name: string } | null>(null)

onMounted(async () => {
  await Promise.all([servicesStore.fetchServices(), servicesStore.fetchServiceTypes()])
  if (servicesStore.serviceTypes.length) {
    selectedTypeId.value = servicesStore.serviceTypes[0]!.id
  }
})

function openCreate() {
  if (servicesStore.serviceTypes.length && !selectedTypeId.value) {
    selectedTypeId.value = servicesStore.serviceTypes[0]!.id
  }
  createOpen.value = true
}

function closeCreate() {
  createOpen.value = false
}

async function createService() {
  if (!selectedTypeId.value) return
  creating.value = true
  try {
    const service = await $fetch<ServiceDto>(`/api/services/from-type/${selectedTypeId.value}`, {
      method: 'POST',
      body: {
        name: serviceName.value.trim() || undefined,
        serviceDate: new Date(serviceDate.value).toISOString()
      }
    })
    servicesStore.upsertService(service)
    toast.add({ title: 'Gottesdienst erstellt', color: 'success' })
    serviceName.value = ''
    createOpen.value = false
    await navigateTo(`/services/${service.id}`)
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
  await $fetch(`/api/services/${deleteTarget.value.id}`, { method: 'DELETE' })
  servicesStore.removeService(deleteTarget.value.id)
  deleteOpen.value = false
  deleteTarget.value = null
}

function serviceMenu(service: ServiceDto): DropdownMenuItem[][] {
  return [[
    {
      label: 'Bearbeiten',
      icon: 'i-lucide-pencil',
      to: `/services/${service.id}`
    },
    {
      label: 'Löschen',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect: () => requestDelete(service.id, service.name)
    }
  ]]
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Gottesdienste"
      description="Gottesdienste aus Vorlagen erstellen"
    >
      <template #actions>
        <UButton
          class="min-h-12 justify-center w-full sm:w-auto"
          icon="i-lucide-plus"
          :disabled="!servicesStore.serviceTypes.length"
          @click="openCreate"
        >
          Gottesdienst anlegen
        </UButton>
      </template>
    </UiPageHeader>

    <div
      v-if="servicesStore.services.length"
      class="space-y-3"
    >
      <UiListCard
        v-for="service in servicesStore.services"
        :key="service.id"
        :title="service.name"
        :meta="formatServiceDate(service.serviceDate)"
        :to="`/services/${service.id}`"
      >
        <template #actions>
          <UButton
            :to="`/playback/${service.id}`"
            color="primary"
            class="min-h-12 flex-1 sm:flex-none justify-center"
            icon="i-lucide-play"
          >
            Abspielen
          </UButton>
          <UDropdownMenu :items="serviceMenu(service)">
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
      title="Keine Gottesdienste"
      description="Erstellen Sie einen Gottesdienst aus einer Vorlage."
    />

    <UModal v-model:open="createOpen">
      <template #content>
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Gottesdienst anlegen
            </h2>
            <p class="text-muted mt-1">
              Wählen Sie eine Vorlage und das Datum.
            </p>
          </template>

          <form
            class="space-y-4"
            @submit.prevent="createService"
          >
            <UFormField label="Vorlage">
              <USelect
                v-model="selectedTypeId"
                :items="servicesStore.serviceTypes.map((t: ServiceTypeDto) => ({ label: t.name, value: t.id }))"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Datum">
              <UInput
                v-model="serviceDate"
                type="date"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Name (optional)">
              <UInput
                v-model="serviceName"
                placeholder="z.B. 1. Advent"
                class="w-full"
              />
            </UFormField>
            <div class="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
              <UButton
                type="button"
                variant="ghost"
                color="neutral"
                class="min-h-11 justify-center"
                @click="closeCreate"
              >
                Abbrechen
              </UButton>
              <UButton
                type="submit"
                class="min-h-11 justify-center"
                :loading="creating"
                :disabled="!selectedTypeId"
              >
                Gottesdienst anlegen
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>

    <UiConfirmModal
      v-model:open="deleteOpen"
      title="Gottesdienst löschen"
      :description="deleteTarget ? `„${deleteTarget.name}“ wirklich löschen?` : undefined"
      confirm-label="Löschen"
      @confirm="confirmDelete"
    />
  </div>
</template>
