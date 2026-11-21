import { asc } from 'drizzle-orm'

import { schema, useDb, type DbExecutor } from '../database'
import type { ElementTypeDto } from '#shared/types/chapel'

export function toElementTypeDto(row: typeof schema.elementTypes.$inferSelect): ElementTypeDto {
  return {
    key: row.key,
    label: row.label,
    defaultLabel: row.defaultLabel,
    fixed: row.fixed,
    color: isElementTypeColor(row.color) ? row.color : 'neutral',
    icon: row.icon,
    sortOrder: row.sortOrder,
    builtin: row.builtin
  }
}

export async function listElementTypes(db: DbExecutor = useDb()): Promise<ElementTypeDto[]> {
  const rows = await db.select().from(schema.elementTypes).orderBy(asc(schema.elementTypes.sortOrder), asc(schema.elementTypes.label))
  return rows.length ? rows.map(toElementTypeDto) : [...BUILTIN_ELEMENT_TYPES]
}

/** Schlüssel → Typ, für Prüfungen (fest/wählbar, gültige Kategorie). */
export async function elementTypeMap(db: DbExecutor = useDb()) {
  return new Map((await listElementTypes(db)).map(t => [t.key, t]))
}

/** Unbekannte oder fehlende Kategorie → „Lied“. */
export async function parseTrackCategory(value: unknown): Promise<string> {
  const map = await elementTypeMap()
  return typeof value === 'string' && map.has(value) ? value : SONG_KIND
}

export function broadcastElementTypes() {
  broadcastEvent({ type: 'elementTypes.updated', payload: {} })
}

/** Prüft und bereinigt Eingaben für Anlegen/Bearbeiten eines Elementtyps. */
export function validateElementTypeInput(body: Partial<ElementTypeDto> | null | undefined, opts: { requireLabel: boolean }) {
  const label = typeof body?.label === 'string' ? body.label.trim() : undefined
  if (opts.requireLabel && !label) {
    throw createError({ statusCode: 400, statusMessage: 'Name erforderlich' })
  }
  if (label !== undefined && (!label || label.length > 60)) {
    throw createError({ statusCode: 400, statusMessage: 'Name muss 1–60 Zeichen lang sein' })
  }
  const defaultLabel = typeof body?.defaultLabel === 'string' ? body.defaultLabel.trim().slice(0, 80) || undefined : undefined
  if (body?.color !== undefined && !isElementTypeColor(body.color)) {
    throw createError({ statusCode: 400, statusMessage: 'Unbekannte Farbe' })
  }
  if (body?.icon !== undefined && (typeof body.icon !== 'string' || !/^i-[a-z0-9-]+$/.test(body.icon))) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültiges Symbol' })
  }
  return {
    label,
    defaultLabel,
    fixed: typeof body?.fixed === 'boolean' ? body.fixed : undefined,
    color: body?.color,
    icon: body?.icon
  }
}
