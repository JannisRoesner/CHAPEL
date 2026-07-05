import { asc, eq } from 'drizzle-orm'

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

  const templateItems = body.items.map((item) => ({
    position: item.position,
    kind: item.kind,
    label: item.label.trim(),
    defaultTrackId: item.defaultTrackId ?? null
  }))

  const updatedServiceIds = await db.transaction(async (tx) => {
    await tx
      .delete(schema.serviceTypeItems)
      .where(eq(schema.serviceTypeItems.serviceTypeId, serviceTypeId))

    if (templateItems.length) {
      await tx.insert(schema.serviceTypeItems).values(
        templateItems.map((item) => ({
          serviceTypeId,
          position: item.position,
          kind: item.kind,
          label: item.label,
          defaultTrackId: item.defaultTrackId
        }))
      )
    }

    await tx
      .update(schema.serviceTypes)
      .set({ updatedAt: new Date() })
      .where(eq(schema.serviceTypes.id, serviceTypeId))

    return syncServicesFromTypeTemplate(serviceTypeId, templateItems, tx)
  })

  broadcastEvent({ type: 'serviceType.updated', payload: { id: serviceTypeId } })
  for (const serviceId of updatedServiceIds) {
    broadcastEvent({ type: 'service.updated', payload: { id: serviceId } })
  }
  return { ok: true }
})
