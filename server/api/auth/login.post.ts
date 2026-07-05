import { findUserByEmail, toSessionUser, verifyUserPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string, password?: string }>(event)
  const email = body.email?.trim()
  const password = body.password

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'E-Mail und Passwort erforderlich' })
  }

  const user = await findUserByEmail(email)
  if (!user || !(await verifyUserPassword(password, user.passwordHash))) {
    throw createError({ statusCode: 401, statusMessage: 'Ungültige Anmeldedaten' })
  }

  await setUserSession(event, { user: toSessionUser(user) })
  return { user: toSessionUser(user) }
})
