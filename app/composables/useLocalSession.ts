import type { SessionUser } from '#shared/types/chapel'

const LOCAL_SESSION_KEY = 'chapel-local-session'
const LEGACY_OFFLINE_SESSION_KEY = 'chapel-had-session'

export interface LocalSessionSnapshot {
  user: SessionUser
  savedAt: string
}

export function useLocalSession() {
  function saveLocalSession(user: SessionUser) {
    if (!import.meta.client) return
    const snapshot: LocalSessionSnapshot = {
      user,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(snapshot))
    localStorage.removeItem(LEGACY_OFFLINE_SESSION_KEY)
  }

  function clearLocalSession() {
    if (!import.meta.client) return
    localStorage.removeItem(LOCAL_SESSION_KEY)
    localStorage.removeItem(LEGACY_OFFLINE_SESSION_KEY)
  }

  function getLocalSession(): LocalSessionSnapshot | null {
    if (!import.meta.client) return null
    const raw = localStorage.getItem(LOCAL_SESSION_KEY)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as LocalSessionSnapshot
      if (!parsed?.user?.id || !parsed.savedAt) return null
      return parsed
    } catch {
      return null
    }
  }

  function hadValidSession(): boolean {
    if (getLocalSession()) return true
    if (!import.meta.client) return false
    return localStorage.getItem(LEGACY_OFFLINE_SESSION_KEY) === '1'
  }

  async function canUseOfflinePlayback(): Promise<boolean> {
    if (!import.meta.client) return false
    if (hadValidSession()) return true
    const cached = await useOfflineCache().getCachedServices()
    return cached.length > 0
  }

  return {
    saveLocalSession,
    clearLocalSession,
    getLocalSession,
    hadValidSession,
    canUseOfflinePlayback
  }
}
