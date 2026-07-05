import { adminSetUserPassword, requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige Benutzer-ID' })
  }

  const body = await readBody<{
    password?: string
    mustChangePassword?: boolean
  }>(event)

  const password = body.password ?? ''
  if (!password) {
    throw createError({ statusCode: 400, statusMessage: 'Passwort erforderlich' })
  }

  return adminSetUserPassword(id, password, body.mustChangePassword ?? true)
})
