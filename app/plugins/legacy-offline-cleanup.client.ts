/** Entfernt Daten des früheren Browser-Offline-Modus (Audio-Cache + IndexedDB) von bestehenden Geräten. */
export default defineNuxtPlugin(() => {
  const FLAG = 'chapel-legacy-offline-cleaned'
  try {
    if (localStorage.getItem(FLAG)) return
    localStorage.setItem(FLAG, '1')
    localStorage.removeItem('chapel-had-session')
  } catch {
    return
  }
  void caches?.delete('chapel-audio-v1').catch(() => {})
  try {
    indexedDB.deleteDatabase('chapel-offline')
  } catch {
    // ignorieren
  }
})
