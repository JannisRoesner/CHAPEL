import type { PlaylistStepDto, ServiceDto } from '#shared/types/chapel'

export const AUDIO_CACHE_NAME = 'chapel-audio-v1'

const DB_NAME = 'chapel-offline'
const STORE_NAME = 'services'
const DB_VERSION = 2

export interface OfflineServiceRecord {
  serviceId: number
  serviceName: string
  serviceDate?: string
  updatedAt?: string
  cachedAt: string
  playlist: PlaylistStepDto[]
}

export interface CachedServiceSummary {
  serviceId: number
  serviceName: string
  serviceDate: string | null
  cachedAt: string
  updatedAt: string | null
}

export interface PrepareServiceResult {
  success: boolean
  cachedTracks: number
  totalTracks: number
}

export interface PlaybackLoadResult {
  playlist: PlaylistStepDto[]
  serviceName: string
  serviceDate: string | null
  source: 'api' | 'cache'
  cachedAt: string | null
  error: string | null
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
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

async function getAllRecords(): Promise<OfflineServiceRecord[]> {
  if (!import.meta.client) return []
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result as OfflineServiceRecord[])
    req.onerror = () => reject(req.error)
  })
}

async function getRecord(serviceId: number): Promise<OfflineServiceRecord | null> {
  if (!import.meta.client) return null
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  return new Promise((resolve, reject) => {
    const req = store.get(serviceId)
    req.onsuccess = () => resolve((req.result as OfflineServiceRecord | undefined) ?? null)
    req.onerror = () => reject(req.error)
  })
}

async function putRecord(record: OfflineServiceRecord): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).put(record)
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function cachePlaylistAudio(
  playlist: PlaylistStepDto[],
  onProgress?: (percent: number) => void
): Promise<{ cachedTracks: number, totalTracks: number }> {
  const tracksWithUrls = playlist.filter(step => step.streamUrl)
  const totalTracks = tracksWithUrls.length
  let cachedTracks = 0

  if (totalTracks === 0) {
    onProgress?.(100)
    return { cachedTracks: 0, totalTracks: 0 }
  }

  const cache = await caches.open(AUDIO_CACHE_NAME)

  for (let i = 0; i < tracksWithUrls.length; i++) {
    const step = tracksWithUrls[i]!
    if (step.streamUrl) {
      try {
        const response = await fetch(step.streamUrl, { credentials: 'include' })
        if (response.ok) {
          await cache.put(step.streamUrl, response.clone())
          cachedTracks++
        }
      } catch {
        // track download failed
      }
    }
    onProgress?.(Math.round(((i + 1) / totalTracks) * 100))
  }

  return { cachedTracks, totalTracks }
}

export function useOfflineCache() {
  const preparing = ref(false)
  const progress = ref(0)
  const cachedServiceIds = ref<number[]>([])

  async function refreshCachedList() {
    if (!import.meta.client) return
    const all = await getAllRecords()
    cachedServiceIds.value = all.map(r => r.serviceId)
  }

  async function getCachedServices(): Promise<CachedServiceSummary[]> {
    const all = await getAllRecords()
    return all.map(r => ({
      serviceId: r.serviceId,
      serviceName: r.serviceName,
      serviceDate: r.serviceDate ?? null,
      cachedAt: r.cachedAt,
      updatedAt: r.updatedAt ?? null
    }))
  }

  async function getCachedService(serviceId: number): Promise<OfflineServiceRecord | null> {
    return getRecord(serviceId)
  }

  async function isServiceCached(serviceId: number): Promise<boolean> {
    await refreshCachedList()
    return cachedServiceIds.value.includes(serviceId)
  }

  async function isCacheStale(serviceId: number, serverUpdatedAt: string): Promise<boolean> {
    const record = await getRecord(serviceId)
    if (!record?.updatedAt) return false
    return serverUpdatedAt > record.updatedAt
  }

  async function prepareService(
    serviceId: number,
    serviceName: string,
    serviceDate: string,
    updatedAt: string
  ): Promise<PrepareServiceResult> {
    if (!import.meta.client) {
      return { success: false, cachedTracks: 0, totalTracks: 0 }
    }

    preparing.value = true
    progress.value = 0

    try {
      const playlist = await $fetch<PlaylistStepDto[]>(`/api/services/${serviceId}/playlist`)
      const { cachedTracks, totalTracks } = await cachePlaylistAudio(playlist, (p) => {
        progress.value = p
      })

      const success = cachedTracks === totalTracks

      if (success) {
        await putRecord({
          serviceId,
          serviceName,
          serviceDate,
          updatedAt,
          cachedAt: new Date().toISOString(),
          playlist
        })
        await refreshCachedList()
      }

      return { success, cachedTracks, totalTracks }
    } finally {
      preparing.value = false
      progress.value = 0
    }
  }

  async function loadServiceForPlayback(serviceId: number): Promise<PlaybackLoadResult> {
    if (!import.meta.client) {
      return {
        playlist: [],
        serviceName: '',
        serviceDate: null,
        source: 'cache',
        cachedAt: null,
        error: 'Nur im Browser verfügbar'
      }
    }

    const tryApi = async (): Promise<PlaybackLoadResult | null> => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return null

      try {
        const [playlist, service] = await Promise.all([
          $fetch<PlaylistStepDto[]>(`/api/services/${serviceId}/playlist`),
          $fetch<Pick<ServiceDto, 'name' | 'serviceDate' | 'updatedAt'>>(`/api/services/${serviceId}`)
        ])

        const { cachedTracks, totalTracks } = await cachePlaylistAudio(playlist)
        if (cachedTracks === totalTracks) {
          await putRecord({
            serviceId,
            serviceName: service.name,
            serviceDate: service.serviceDate,
            updatedAt: service.updatedAt,
            cachedAt: new Date().toISOString(),
            playlist
          })
          await refreshCachedList()
        }

        return {
          playlist,
          serviceName: service.name,
          serviceDate: service.serviceDate,
          source: 'api',
          cachedAt: null,
          error: null
        }
      } catch {
        return null
      }
    }

    const apiResult = await tryApi()
    if (apiResult) return apiResult

    const record = await getRecord(serviceId)
    if (!record) {
      return {
        playlist: [],
        serviceName: '',
        serviceDate: null,
        source: 'cache',
        cachedAt: null,
        error: 'Gottesdienst nicht offline vorbereitet'
      }
    }

    return {
      playlist: record.playlist,
      serviceName: record.serviceName,
      serviceDate: record.serviceDate ?? null,
      source: 'cache',
      cachedAt: record.cachedAt,
      error: null
    }
  }

  async function clearCache() {
    if (!import.meta.client) return
    await caches.delete(AUDIO_CACHE_NAME)
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
    getCachedServices,
    getCachedService,
    prepareService,
    loadServiceForPlayback,
    clearCache,
    isServiceCached,
    isCacheStale,
    getCacheSizeEstimate,
    refreshCachedList
  }
}
