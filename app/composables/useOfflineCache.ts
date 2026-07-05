import type { PlaylistStepDto } from '#shared/types/chapel'

const DB_NAME = 'chapel-offline'
const STORE_NAME = 'services'

interface OfflineServiceRecord {
  serviceId: number
  serviceName: string
  cachedAt: string
  playlist: PlaylistStepDto[]
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'serviceId' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function useOfflineCache() {
  const preparing = ref(false)
  const progress = ref(0)
  const cachedServiceIds = ref<number[]>([])

  async function refreshCachedList() {
    if (!import.meta.client) return
    const db = await openDb()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const all = await new Promise<OfflineServiceRecord[]>((resolve, reject) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result as OfflineServiceRecord[])
      req.onerror = () => reject(req.error)
    })
    cachedServiceIds.value = all.map((r) => r.serviceId)
  }

  async function isServiceCached(serviceId: number): Promise<boolean> {
    await refreshCachedList()
    return cachedServiceIds.value.includes(serviceId)
  }

  async function prepareService(serviceId: number, serviceName: string) {
    if (!import.meta.client) return

    preparing.value = true
    progress.value = 0

    try {
      const playlist = await $fetch<PlaylistStepDto[]>(`/api/services/${serviceId}/playlist`)
      const tracksWithUrls = playlist.filter((step) => step.streamUrl)

      const cache = await caches.open('chapel-audio-v1')
      let done = 0

      for (const step of tracksWithUrls) {
        if (step.streamUrl) {
          const response = await fetch(step.streamUrl, { credentials: 'include' })
          if (response.ok) {
            await cache.put(step.streamUrl, response.clone())
          }
        }
        done++
        progress.value = Math.round((done / tracksWithUrls.length) * 100)
      }

      const db = await openDb()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put({
        serviceId,
        serviceName,
        cachedAt: new Date().toISOString(),
        playlist
      } satisfies OfflineServiceRecord)

      await refreshCachedList()
    } finally {
      preparing.value = false
      progress.value = 0
    }
  }

  async function clearCache() {
    if (!import.meta.client) return
    await caches.delete('chapel-audio-v1')
    const db = await openDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).clear()
    cachedServiceIds.value = []
  }

  async function getCacheSizeEstimate(): Promise<string> {
    if (!import.meta.client || !('storage' in navigator && 'estimate' in navigator.storage)) {
      return 'Unbekannt'
    }
    const estimate = await navigator.storage.estimate()
    const usage = estimate.usage ?? 0
    if (usage < 1024 * 1024) return `${Math.round(usage / 1024)} KB`
    return `${(usage / (1024 * 1024)).toFixed(1)} MB`
  }

  onMounted(() => {
    refreshCachedList()
  })

  return {
    preparing,
    progress,
    cachedServiceIds,
    prepareService,
    clearCache,
    isServiceCached,
    getCacheSizeEstimate,
    refreshCachedList
  }
}
