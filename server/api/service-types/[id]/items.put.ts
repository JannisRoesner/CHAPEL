import { eq } from 'drizzle-orm'

import { useDb, schema } from '../../../database'
import type { ItemKind } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  const serviceTypeId = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(serviceTypeId)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const body = await readBody<{
    items: Array<{
      id?: number
      position: number
      kind: ItemKind
      label: string
      defaultTrackId?: number | null
    }>
  }>(event)

  if (!Array.isArray(body.items)) {
    throw createError({ statusCode: 400, statusMessage: 'Items erforderlich' })
  }

  const db = useDb()
  const [type] = await db
    .select({ id: schema.serviceTypes.id })
    .from(schema.serviceTypes)
    .where(eq(schema.serviceTypes.id, serviceTypeId))
    .limit(1)

  if (!type) {
    throw createError({ statusCode: 404, statusMessage: 'Gottesdienst-Typ nicht gefunden' })
  }

  const result = await db.transaction(async (tx) => {
    // Bisherige Positionen der Schritte merken, damit Lieder beim Umsortieren mitwandern
    const previous = await tx
      .select({ id: schema.serviceTypeItems.id, position: schema.serviceTypeItems.position })
      .from(schema.serviceTypeItems)
      .where(eq(schema.serviceTypeItems.serviceTypeId, serviceTypeId))
    const previousPosition = new Map(previous.map(item => [item.id, item.position]))

    const templateItems = body.items.map(item => ({
      position: item.position,
      kind: item.kind,
      label: item.label.trim(),
      defaultTrackId: item.defaultTrackId ?? null,
      sourcePosition: item.id != null ? previousPosition.get(item.id) ?? null : null
    }))

    await tx
      .delete(schema.serviceTypeItems)
      .where(eq(schema.serviceTypeItems.serviceTypeId, serviceTypeId))

    let inserted: Array<{ id: number, position: number }> = []
    if (templateItems.length) {
      inserted = await tx.insert(schema.serviceTypeItems).values(
        templateItems.map(item => ({
          serviceTypeId,
          position: item.position,
          kind: item.kind,
          label: item.label,
          defaultTrackId: item.defaultTrackId
        }))
      ).returning({ id: schema.serviceTypeItems.id, position: schema.serviceTypeItems.position })
    }

    await tx
      .update(schema.serviceTypes)
      .set({ updatedAt: new Date() })
      .where(eq(schema.serviceTypes.id, serviceTypeId))

    const updatedServiceIds = await syncServicesFromTypeTemplate(serviceTypeId, templateItems, tx)
    return { updatedServiceIds, inserted }
  })
  const { updatedServiceIds, inserted } = result

  broadcastEvent({ type: 'serviceType.updated', payload: { id: serviceTypeId } })
  for (const serviceId of updatedServiceIds) {
    broadcastEvent({ type: 'service.updated', payload: { id: serviceId } })
  }
  // Neue IDs in Positionsreihenfolge – der Editor braucht sie für den nächsten Speichervorgang
  return { ok: true, itemIds: inserted.sort((a, b) => a.position - b.position).map(item => item.id) }
})
