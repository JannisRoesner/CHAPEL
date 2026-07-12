import { PUBLIC_PATHS } from '#shared/constants/legal'
import { LOGIN_ROUTE } from '#shared/constants/app'

const PLAYBACK_ROUTE = /^\/playback(\/\d+)?$/

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

  if (import.meta.client && PLAYBACK_ROUTE.test(to.path)) {
    const offlineCache = useOfflineCache()
    const cached = await offlineCache.getCachedServices()
    if (cached.length > 0) return

    const { hadSession } = useOfflineSession()
    if (hadSession()) return
  }

  return navigateTo(LOGIN_ROUTE)
})
