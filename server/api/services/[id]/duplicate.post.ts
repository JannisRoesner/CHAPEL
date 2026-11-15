import { asc, eq } from 'drizzle-orm'

import { useDb, schema } from '../../../database'
import type { ServiceDto } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }
  const body = await readBody<{ name?: string, serviceDate?: string }>(event)
  const name = body?.name?.trim()
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Name erforderlich' })
  }

  const db = useDb()
  const service = await db.transaction(async (tx) => {
    const [source] = await tx.select().from(schema.services).where(eq(schema.services.id, id)).limit(1)
    if (!source) {
      throw createError({ statusCode: 404, statusMessage: 'Gottesdienst nicht gefunden' })
    }
    const [created] = await tx
      .insert(schema.services)
      .values({
        serviceTypeId: source.serviceTypeId,
        name,
        serviceDate: body.serviceDate ? new Date(body.serviceDate) : source.serviceDate,
        notes: source.notes
      })
      .returning()
    const items = await tx
      .select()
      .from(schema.serviceItems)
      .where(eq(schema.serviceItems.serviceId, id))
      .orderBy(asc(schema.serviceItems.position))
    if (items.length) {
      await tx.insert(schema.serviceItems).values(items.map(item => ({
        serviceId: created!.id,
        position: item.position,
        kind: item.kind,
        label: item.label,
        trackId: item.trackId
      })))
    }
    return created!
  })

  const dto: ServiceDto = {
    id: service.id,
    serviceTypeId: service.serviceTypeId,
    name: service.name,
    serviceDate: service.serviceDate.toISOString(),
    notes: service.notes,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString()
  }
  broadcastEvent({ type: 'service.created', payload: dto as unknown as Record<string, unknown> })
  return dto
})
