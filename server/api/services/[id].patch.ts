import { eq } from 'drizzle-orm'

import { useDb, schema } from '../../database'
import type { ServiceDto } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const body = await readBody<{
    name?: string
    serviceDate?: string
    notes?: string | null
  }>(event)

  const db = useDb()
  const [service] = await db
    .update(schema.services)
    .set({
      name: body.name?.trim(),
      serviceDate: body.serviceDate ? new Date(body.serviceDate) : undefined,
      notes: body.notes !== undefined ? (body.notes?.trim() || null) : undefined,
      updatedAt: new Date()
    })
    .where(eq(schema.services.id, id))
    .returning()

  if (!service) {
    throw createError({ statusCode: 404, statusMessage: 'Gottesdienst nicht gefunden' })
  }

  const dto: ServiceDto = {
    id: service.id,
    serviceTypeId: service.serviceTypeId,
    name: service.name,
    serviceDate: service.serviceDate.toISOString(),
    notes: service.notes,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString()
  }
  broadcastEvent({ type: 'service.updated', payload: dto as unknown as Record<string, unknown> })
  return dto
})
