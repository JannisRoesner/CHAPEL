import { asc, eq } from 'drizzle-orm'

import { useDb, schema } from '../../../database'
import type { ServiceTypeDto } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }
  const body = await readBody<{ name?: string }>(event)
  const name = body?.name?.trim()
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Name erforderlich' })
  }

  const db = useDb()
  const type = await db.transaction(async (tx) => {
    const [source] = await tx.select().from(schema.serviceTypes).where(eq(schema.serviceTypes.id, id)).limit(1)
    if (!source) {
      throw createError({ statusCode: 404, statusMessage: 'Vorlage nicht gefunden' })
    }
    const [created] = await tx
      .insert(schema.serviceTypes)
      .values({ name, description: source.description })
      .returning()
    const items = await tx
      .select()
      .from(schema.serviceTypeItems)
      .where(eq(schema.serviceTypeItems.serviceTypeId, id))
      .orderBy(asc(schema.serviceTypeItems.position))
    if (items.length) {
      await tx.insert(schema.serviceTypeItems).values(items.map(item => ({
        serviceTypeId: created!.id,
        position: item.position,
        kind: item.kind,
        label: item.label,
        defaultTrackId: item.defaultTrackId
      })))
    }
    return created!
  })

  const dto: ServiceTypeDto = {
    id: type.id,
    name: type.name,
    description: type.description,
    createdAt: type.createdAt.toISOString(),
    updatedAt: type.updatedAt.toISOString()
  }
  broadcastEvent({ type: 'serviceType.created', payload: dto as unknown as Record<string, unknown> })
  return dto
})
