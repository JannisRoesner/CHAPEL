import { asc, eq } from 'drizzle-orm'

import { useDb, schema } from '../../../database'
import type { ServiceDto } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  const typeId = Number(getRouterParam(event, 'typeId'))
  if (!Number.isFinite(typeId)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige Typ-ID' })
  }

  const body = await readBody<{
    name?: string
    serviceDate?: string
    notes?: string | null
  }>(event)

  const db = useDb()
  const [type] = await db
    .select()
    .from(schema.serviceTypes)
    .where(eq(schema.serviceTypes.id, typeId))
    .limit(1)

  if (!type) {
    throw createError({ statusCode: 404, statusMessage: 'Gottesdienst-Typ nicht gefunden' })
  }

  const templateItems = await db
    .select()
    .from(schema.serviceTypeItems)
    .where(eq(schema.serviceTypeItems.serviceTypeId, typeId))
    .orderBy(asc(schema.serviceTypeItems.position))

  const serviceDate = body.serviceDate ? new Date(body.serviceDate) : new Date()
  const name = body.name?.trim() || `${type.name} – ${serviceDate.toLocaleDateString('de-DE')}`

  const [service] = await db
    .insert(schema.services)
    .values({
      serviceTypeId: typeId,
      name,
      serviceDate,
      notes: body.notes?.trim() || null
    })
    .returning()

  if (templateItems.length) {
    await db.insert(schema.serviceItems).values(
      templateItems.map((item) => ({
        serviceId: service!.id,
        position: item.position,
        kind: item.kind,
        label: item.label,
        trackId:
          item.kind === 'liturgy'
            ? item.defaultTrackId
            : item.defaultTrackId
      }))
    )
  }

  const dto: ServiceDto = {
    id: service!.id,
    serviceTypeId: service!.serviceTypeId,
    name: service!.name,
    serviceDate: service!.serviceDate.toISOString(),
    notes: service!.notes,
    createdAt: service!.createdAt.toISOString(),
    updatedAt: service!.updatedAt.toISOString()
  }
  broadcastEvent({ type: 'service.created', payload: dto as unknown as Record<string, unknown> })
  return dto
})
