import { PUBLIC_PATHS } from '#shared/constants/legal'
import { DEFAULT_ROUTE, LOGIN_ROUTE } from '#shared/constants/app'

const PLAYBACK_ROUTE = /^\/playback(\/\d+)?$/
const OFFLINE_ALLOWED = /^\/(playback(\/\d+)?|settings)$/

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_PATHS.includes(to.path as typeof PUBLIC_PATHS[number])) return

  const { loggedIn, fetch: fetchSession } = useUserSession()

  try {
    await fetchSession()
  } catch {
    // offline: bestehenden Session-State behalten
  }

  if (loggedIn.value) return

  const isOnline = import.meta.client
    ? navigator.onLine
    : true

  if (isOnline) {
    return navigateTo(LOGIN_ROUTE)
  }

  // Offline-Wiedergabe-Modus
  if (!import.meta.client) {
    return navigateTo(LOGIN_ROUTE)
  }

  const { canUseOfflinePlayback } = useLocalSession()
  const allowed = await canUseOfflinePlayback()

  if (OFFLINE_ALLOWED.test(to.path)) {
    if (allowed) return
    return navigateTo('/offline')
  }

  // Andere geschützte Routen offline: zu Playback oder Hinweis
  if (allowed) {
    if (PLAYBACK_ROUTE.test(to.path)) return
    return navigateTo(DEFAULT_ROUTE)
  }

  return navigateTo('/offline')
})
