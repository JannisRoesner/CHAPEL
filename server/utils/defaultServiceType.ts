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

async function insertDefaultItems(db: DbExecutor, serviceTypeId: number) {
  await db.insert(schema.serviceTypeItems).values(
    DEFAULT_SONNTAGS_GOTTESDIENST.items.map(item => ({
      serviceTypeId,
      position: item.position,
      kind: item.kind,
      label: item.label,
      defaultTrackId: null
    }))
  )
}

/**
 * Legt die Standardvorlage nur auf einer leeren Installation an (noch keine Vorlage vorhanden).
 * Bestehende Vorlagen werden nie verändert – auch nicht der „Sonntagsgottesdienst“.
 */
export async function ensureDefaultServiceType(db: DbExecutor = useDb()) {
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
