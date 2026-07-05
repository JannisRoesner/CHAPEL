import { asc, eq } from 'drizzle-orm'

import { schema, useDb, type DbExecutor } from '../database'
import type { ItemKind } from '#shared/types/chapel'

export const DEFAULT_SONNTAGS_GOTTESDIENST = {
  name: 'Sonntagsgottesdienst',
  description: 'Standardvorlage für den Sonntagsgottesdienst',
  items: [
    { position: 0, kind: 'songSlot' as ItemKind, label: 'Eröffnungslied' },
    { position: 1, kind: 'liturgy' as ItemKind, label: 'Kyrie' },
    { position: 2, kind: 'liturgy' as ItemKind, label: 'Gloria' },
    { position: 3, kind: 'songSlot' as ItemKind, label: 'Prediglied' },
    { position: 4, kind: 'songSlot' as ItemKind, label: 'Schlusslied' }
  ]
}

type ExistingItem = typeof schema.serviceTypeItems.$inferSelect

function liturgyTrackByPositionKind(items: ExistingItem[]) {
  return new Map(
    items
      .filter(item => item.kind === 'liturgy' && item.defaultTrackId != null)
      .map(item => [`${item.position}:${item.kind}`, item.defaultTrackId] as const)
  )
}

async function insertDefaultItems(
  db: DbExecutor,
  serviceTypeId: number,
  preserveTracksFrom: ExistingItem[] = []
) {
  const preserved = liturgyTrackByPositionKind(preserveTracksFrom)

  await db.insert(schema.serviceTypeItems).values(
    DEFAULT_SONNTAGS_GOTTESDIENST.items.map(item => ({
      serviceTypeId,
      position: item.position,
      kind: item.kind,
      label: item.label,
      defaultTrackId:
        item.kind === 'liturgy'
          ? (preserved.get(`${item.position}:${item.kind}`) ?? null)
          : null
    }))
  )
}

export async function ensureDefaultServiceType(db: DbExecutor = useDb()) {
  const [existingByName] = await db
    .select()
    .from(schema.serviceTypes)
    .where(eq(schema.serviceTypes.name, DEFAULT_SONNTAGS_GOTTESDIENST.name))
    .limit(1)

  if (existingByName) {
    const items = await db
      .select()
      .from(schema.serviceTypeItems)
      .where(eq(schema.serviceTypeItems.serviceTypeId, existingByName.id))
      .orderBy(asc(schema.serviceTypeItems.position))

    if (items.length === DEFAULT_SONNTAGS_GOTTESDIENST.items.length) {
      return
    }

    const preservedTracks = liturgyTrackByPositionKind(items)

    await db
      .delete(schema.serviceTypeItems)
      .where(eq(schema.serviceTypeItems.serviceTypeId, existingByName.id))
    await insertDefaultItems(db, existingByName.id, items)
    await db
      .update(schema.serviceTypes)
      .set({
        description: DEFAULT_SONNTAGS_GOTTESDIENST.description,
        updatedAt: new Date()
      })
      .where(eq(schema.serviceTypes.id, existingByName.id))

    await syncServicesFromTypeTemplate(
      existingByName.id,
      DEFAULT_SONNTAGS_GOTTESDIENST.items.map(item => ({
        ...item,
        defaultTrackId:
          item.kind === 'liturgy'
            ? (preservedTracks.get(`${item.position}:${item.kind}`) ?? null)
            : null
      })),
      db
    )

    console.info('[CHAPEL] Restored default Sonntagsgottesdienst template')
    return
  }

  const [anyType] = await db.select({ id: schema.serviceTypes.id }).from(schema.serviceTypes).limit(1)
  if (anyType) return

  const [type] = await db
    .insert(schema.serviceTypes)
    .values({
      name: DEFAULT_SONNTAGS_GOTTESDIENST.name,
      description: DEFAULT_SONNTAGS_GOTTESDIENST.description
    })
    .returning()

  await insertDefaultItems(db, type!.id)
  console.info('[CHAPEL] Seeded default Sonntagsgottesdienst template')
}
