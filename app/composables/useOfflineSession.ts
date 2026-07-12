const OFFLINE_SESSION_KEY = 'chapel-had-session'

export function useOfflineSession() {
  function markHadSession() {
    if (import.meta.client) {
      localStorage.setItem(OFFLINE_SESSION_KEY, '1')
    }
  }

  function clearHadSession() {
    if (import.meta.client) {
      localStorage.removeItem(OFFLINE_SESSION_KEY)
    }
  }

  function hadSession(): boolean {
    if (!import.meta.client) return false
    return localStorage.getItem(OFFLINE_SESSION_KEY) === '1'
  }

  return {
    markHadSession,
    clearHadSession,
    hadSession
  }
}
