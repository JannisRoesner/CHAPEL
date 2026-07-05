export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/logout') || path.startsWith('/api/auth/me')) {
    return
  }
  if (path.startsWith('/api/branding')) {
    return
  }
  if (path.startsWith('/api/') || path.startsWith('/ws/')) {
    if (path.startsWith('/ws/')) {
      return
    }

    const session = await getUserSession(event)
    const user = session.user as { mustChangePassword?: boolean } | undefined
    const allowedWhenMustChangePassword = path.startsWith('/api/auth/change-password')
      || path.startsWith('/api/_auth/session')
    if (user?.mustChangePassword && !allowedWhenMustChangePassword) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Passwort muss zuerst geändert werden'
      })
    }

    await requireUser(event)
  }
})
