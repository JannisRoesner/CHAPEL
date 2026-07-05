import { asc, eq } from 'drizzle-orm'

import { useDb, schema } from '../../../database'

export default defineEventHandler(async (event) => {
  const serviceId = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(serviceId)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const body = await readBody<{
    items: Array<{
      id: number
      trackId?: number | null
    }>
  }>(event)

  if (!Array.isArray(body.items)) {
    throw createError({ statusCode: 400, statusMessage: 'Items erforderlich' })
  }

  const db = useDb()
  const existingItems = await db
    .select()
    .from(schema.serviceItems)
    .where(eq(schema.serviceItems.serviceId, serviceId))
    .orderBy(asc(schema.serviceItems.position))

  if (!existingItems.length) {
    throw createError({ statusCode: 404, statusMessage: 'Gottesdienst nicht gefunden' })
  }

  const itemMap = new Map(existingItems.map(item => [item.id, item]))

  for (const update of body.items) {
    const existing = itemMap.get(update.id)
    if (!existing) continue

    if (existing.kind === 'liturgy') {
      continue
    }

    if (update.trackId !== undefined) {
      await db
        .update(schema.serviceItems)
        .set({ trackId: update.trackId })
        .where(eq(schema.serviceItems.id, update.id))
    }
  }

  await db
    .update(schema.services)
    .set({ updatedAt: new Date() })
    .where(eq(schema.services.id, serviceId))

  broadcastEvent({ type: 'service.updated', payload: { id: serviceId } })
  return { ok: true }
})
