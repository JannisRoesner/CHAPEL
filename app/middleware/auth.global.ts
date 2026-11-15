import { PUBLIC_PATHS } from '#shared/constants/legal'
import { LOGIN_ROUTE } from '#shared/constants/app'

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_PATHS.includes(to.path as typeof PUBLIC_PATHS[number])) return

  const { loggedIn, fetch: fetchSession } = useUserSession()

  try {
    await fetchSession()
  } catch {
    // Netzwerkfehler: bestehenden Session-State behalten
  }

  if (!loggedIn.value) return navigateTo(LOGIN_ROUTE)
})
