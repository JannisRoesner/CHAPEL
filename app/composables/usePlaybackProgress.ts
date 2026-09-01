const STORAGE_PREFIX = 'chapel-playback-progress'
const TTL_MS = 24 * 60 * 60 * 1000

export interface PlaybackProgressSnapshot {
  currentIndex: number
  playedIndices: number[]
  savedAt: number
}

function storageKey(serviceId: number) {
  return `${STORAGE_PREFIX}:${serviceId}`
}

function readSnapshot(serviceId: number): PlaybackProgressSnapshot | null {
  if (!import.meta.client) return null
  const raw = localStorage.getItem(storageKey(serviceId))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as PlaybackProgressSnapshot
    if (
      typeof parsed?.currentIndex !== 'number'
      || !Array.isArray(parsed.playedIndices)
      || typeof parsed.savedAt !== 'number'
    ) {
      return null
    }
    if (Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(storageKey(serviceId))
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function usePlaybackProgress(serviceId: number) {
  function load() {
    return readSnapshot(serviceId)
  }

  function save(currentIndex: number, playedIndices: number[]) {
    if (!import.meta.client) return
    const snapshot: PlaybackProgressSnapshot = {
      currentIndex,
      playedIndices: [...playedIndices],
      savedAt: Date.now()
    }
    localStorage.setItem(storageKey(serviceId), JSON.stringify(snapshot))
  }

  function clear() {
    if (!import.meta.client) return
    localStorage.removeItem(storageKey(serviceId))
  }

  return {
    load,
    save,
    clear
  }
}
