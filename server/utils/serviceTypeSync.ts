import { asc, eq } from 'drizzle-orm'

import { schema, useDb, type DbExecutor } from '../database'
import type { ItemKind } from '#shared/types/chapel'

export interface ServiceTypeTemplateItem {
  position: number
  kind: ItemKind
  label: string
  defaultTrackId?: number | null
  /**
   * Position, die dieser Schritt vor der Änderung hatte – damit gewählte Lieder in
   * bestehenden Gottesdiensten beim Umsortieren mitwandern.
   * `null` = neuer Schritt, `undefined` = unbekannt (Abgleich über gleiche Position).
   */
  sourcePosition?: number | null
}

function resolveTrackId(
  isFixedKind: (kind: string) => boolean,
  templateItem: ServiceTypeTemplateItem,
  oldItem: typeof schema.serviceItems.$inferSelect | undefined
): number | null {
  if (isFixedKind(templateItem.kind)) {
    return templateItem.defaultTrackId ?? null
  }

  if (oldItem && !isFixedKind(oldItem.kind)) {
    return oldItem.trackId ?? templateItem.defaultTrackId ?? null
  }

  return templateItem.defaultTrackId ?? null
}

export async function syncServicesFromTypeTemplate(
  serviceTypeId: number,
  templateItems: ServiceTypeTemplateItem[],
  db: DbExecutor = useDb()
): Promise<number[]> {
  const sortedTemplate = [...templateItems].sort((a, b) => a.position - b.position)
  const updatedServiceIds: number[] = []
  const types = await elementTypeMap(db)
  const isFixedKind = (kind: string) => types.get(kind)?.fixed ?? false

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
          trackId: resolveTrackId(
            isFixedKind,
            templateItem,
            templateItem.sourcePosition === null
              ? undefined
              : oldByPosition.get(templateItem.sourcePosition ?? templateItem.position)
          )
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
