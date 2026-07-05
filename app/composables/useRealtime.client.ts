import { useWebSocket } from '@vueuse/core'

import type { ChapelEvent, TrackDto, ServiceDto, ServiceTypeDto } from '#shared/types/chapel'

export function useRealtime() {
  const libraryStore = useLibraryStore()
  const servicesStore = useServicesStore()

  const { open, close } = useWebSocket('/ws/chapel', {
    immediate: false,
    autoReconnect: {
      retries: 10,
      delay: 2000
    },
    async onMessage(_ws, event) {
      try {
        const text = typeof event.data === 'string' ? event.data : await event.data.text()
        const chapelEvent = JSON.parse(text) as ChapelEvent
        handleEvent(chapelEvent)
      } catch {
        // ignore malformed messages
      }
    }
  })

  function handleEvent(event: ChapelEvent) {
    switch (event.type) {
      case 'track.created':
      case 'track.updated':
        libraryStore.upsertTrack(event.payload as unknown as TrackDto)
        break
      case 'track.deleted':
        libraryStore.removeTrack((event.payload as { id: number }).id)
        break
      case 'service.created':
      case 'service.updated':
        servicesStore.upsertService(event.payload as unknown as ServiceDto)
        break
      case 'service.deleted':
        servicesStore.removeService((event.payload as { id: number }).id)
        break
      case 'serviceType.created':
      case 'serviceType.updated':
        servicesStore.upsertServiceType(event.payload as unknown as ServiceTypeDto)
        break
      case 'serviceType.deleted':
        servicesStore.removeServiceType((event.payload as { id: number }).id)
        break
      default:
        break
    }
  }

  onMounted(() => open())
  onUnmounted(() => close())

  return { open, close }
}
