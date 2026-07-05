import { createUser, requireAdmin } from '../../utils/auth'

import type { UserRole } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{
    email?: string
    name?: string
    password?: string
    role?: UserRole
  }>(event)

  return createUser({
    email: body.email ?? '',
    name: body.name ?? '',
    password: body.password ?? '',
    role: body.role
  })
})
