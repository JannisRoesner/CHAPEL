import { defineStore } from 'pinia'

import type { ServiceDto, ServiceTypeDto } from '#shared/types/chapel'

export const useServicesStore = defineStore('services', () => {
  const services = ref<ServiceDto[]>([])
  const serviceTypes = ref<ServiceTypeDto[]>([])
  const loading = ref(false)

  async function fetchServices() {
    loading.value = true
    try {
      services.value = await $fetch<ServiceDto[]>('/api/services')
    } finally {
      loading.value = false
    }
  }

  async function fetchServiceTypes() {
    serviceTypes.value = await $fetch<ServiceTypeDto[]>('/api/service-types')
  }

  function upsertService(service: ServiceDto) {
    const idx = services.value.findIndex(s => s.id === service.id)
    if (idx >= 0) services.value[idx] = service
    else services.value.unshift(service)
  }

  function removeService(id: number) {
    services.value = services.value.filter(s => s.id !== id)
  }

  function upsertServiceType(type: ServiceTypeDto) {
    const idx = serviceTypes.value.findIndex(t => t.id === type.id)
    if (idx >= 0) serviceTypes.value[idx] = type
    else serviceTypes.value.push(type)
  }

  function removeServiceType(id: number) {
    serviceTypes.value = serviceTypes.value.filter(t => t.id !== id)
  }

  return {
    services,
    serviceTypes,
    loading,
    fetchServices,
    fetchServiceTypes,
    upsertService,
    removeService,
    upsertServiceType,
    removeServiceType
  }
})
