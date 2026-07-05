import { changeOwnPassword, requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = await requireUser(event)
  const body = await readBody<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>(event)

  const newPassword = body.newPassword ?? ''
  const confirmPassword = body.confirmPassword ?? ''

  if (!newPassword || !confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Neues Passwort erforderlich' })
  }

  const user = await changeOwnPassword(sessionUser.id, {
    currentPassword: body.currentPassword,
    newPassword,
    confirmPassword,
    skipCurrentCheck: sessionUser.mustChangePassword
  })

  await setUserSession(event, { user })
  return { user }
})
