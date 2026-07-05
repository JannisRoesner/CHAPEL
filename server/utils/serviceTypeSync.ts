import { asc, eq } from 'drizzle-orm'

import { schema, useDb } from '../database'
import type { ItemKind } from '#shared/types/chapel'

export interface ServiceTypeTemplateItem {
  position: number
  kind: ItemKind
  label: string
  defaultTrackId?: number | null
}

type DbClient = ReturnType<typeof useDb>

function resolveTrackId(
  templateItem: ServiceTypeTemplateItem,
  oldItem: typeof schema.serviceItems.$inferSelect | undefined
): number | null {
  if (templateItem.kind === 'liturgy') {
    return templateItem.defaultTrackId ?? null
  }

  if (oldItem?.kind === 'songSlot') {
    return oldItem.trackId ?? templateItem.defaultTrackId ?? null
  }

  return templateItem.defaultTrackId ?? null
}

export async function syncServicesFromTypeTemplate(
  serviceTypeId: number,
  templateItems: ServiceTypeTemplateItem[],
  db: DbClient = useDb()
): Promise<number[]> {
  const sortedTemplate = [...templateItems].sort((a, b) => a.position - b.position)
  const updatedServiceIds: number[] = []

  const services = await db
    .select({ id: schema.services.id })
    .from(schema.services)
    .where(eq(schema.services.serviceTypeId, serviceTypeId))

  for (const service of services) {
    const oldItems = await db
      .select()
      .from(schema.serviceItems)
      .where(eq(schema.serviceItems.serviceId, service.id))
      .orderBy(asc(schema.serviceItems.position))

    const oldByPosition = new Map(oldItems.map(item => [item.position, item]))

    await db.delete(schema.serviceItems).where(eq(schema.serviceItems.serviceId, service.id))

    if (sortedTemplate.length) {
      await db.insert(schema.serviceItems).values(
        sortedTemplate.map(templateItem => ({
          serviceId: service.id,
          position: templateItem.position,
          kind: templateItem.kind,
          label: templateItem.label.trim(),
          trackId: resolveTrackId(templateItem, oldByPosition.get(templateItem.position))
        }))
      )
    }

    await db
      .update(schema.services)
      .set({ updatedAt: new Date() })
      .where(eq(schema.services.id, service.id))

    updatedServiceIds.push(service.id)
  }

  return updatedServiceIds
}
