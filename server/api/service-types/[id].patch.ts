import { eq } from 'drizzle-orm'

import { useDb, schema } from '../../database'
import type { ServiceTypeDto } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const body = await readBody<{ name?: string, description?: string | null }>(event)
  const db = useDb()

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (body.name?.trim()) updates.name = body.name.trim()
  if (body.description !== undefined) updates.description = body.description?.trim() || null

  const [type] = await db
    .update(schema.serviceTypes)
    .set(updates)
    .where(eq(schema.serviceTypes.id, id))
    .returning()

  if (!type) {
    throw createError({ statusCode: 404, statusMessage: 'Gottesdienst-Typ nicht gefunden' })
  }

  const dto: ServiceTypeDto = {
    id: type.id,
    name: type.name,
    description: type.description,
    createdAt: type.createdAt.toISOString(),
    updatedAt: type.updatedAt.toISOString()
  }
  broadcastEvent({ type: 'serviceType.updated', payload: dto as unknown as Record<string, unknown> })
  return dto
})
