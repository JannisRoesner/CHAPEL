import { asc, eq, inArray } from 'drizzle-orm'

import { schema, useDb } from '../database'
import type { ElementTypeDto, ServiceTypeDto } from '#shared/types/chapel'

export const TEMPLATE_EXPORT_FORMAT = 'chapel.templates'
export const TEMPLATE_EXPORT_VERSION = 1

export interface TemplateExportTrackRef {
  title: string
  composer: string | null
  /** Dateihash wie in der Bibliothek (Tempo-Varianten: `<sha256>@<rate>`) */
  fileHash: string
  playbackRate: number
}

export interface TemplateExportFile {
  format: typeof TEMPLATE_EXPORT_FORMAT
  formatVersion: number
  exportedAt: string
  elementTypes: ElementTypeDto[]
  templates: Array<{
    name: string
    description: string | null
    items: Array<{ kind: string, label: string, defaultTrack: TemplateExportTrackRef | null }>
  }>
}

/** Exportiert Vorlagen (alle oder die angegebenen IDs) samt verwendeter Elementtypen. */
export async function exportTemplates(ids?: number[]): Promise<TemplateExportFile> {
  const db = useDb()
  const types = await db
    .select()
    .from(schema.serviceTypes)
    .where(ids?.length ? inArray(schema.serviceTypes.id, ids) : undefined)
    .orderBy(asc(schema.serviceTypes.name))

  const rows = types.length
    ? await db
        .select({ item: schema.serviceTypeItems, track: schema.tracks })
        .from(schema.serviceTypeItems)
        .leftJoin(schema.tracks, eq(schema.serviceTypeItems.defaultTrackId, schema.tracks.id))
        .where(inArray(schema.serviceTypeItems.serviceTypeId, types.map(t => t.id)))
        .orderBy(asc(schema.serviceTypeItems.position))
    : []

  const usedKinds = new Set(rows.map(r => r.item.kind))
  const elementTypes = (await listElementTypes()).filter(t => usedKinds.has(t.key))

  return {
    format: TEMPLATE_EXPORT_FORMAT,
    formatVersion: TEMPLATE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    elementTypes,
    templates: types.map(type => ({
      name: type.name,
      description: type.description,
      items: rows
        .filter(r => r.item.serviceTypeId === type.id)
        .map(({ item, track }) => ({
          kind: item.kind,
          label: item.label,
          defaultTrack: track
            ? { title: track.title, composer: track.composer, fileHash: track.fileHash, playbackRate: track.playbackRate }
            : null
        }))
    }))
  }
}

function fail(message: string): never {
  throw createError({ statusCode: 400, statusMessage: 'Ungültige Vorlagen-Datei', message })
}

/**
 * Importiert eine Exportdatei: legt fehlende Elementtypen an, erzeugt die Vorlagen
 * (bei Namensgleichheit mit Zusatz „(Import)“) und ordnet Standard-Tracks über den
 * Dateihash, ersatzweise über den Titel, der eigenen Bibliothek zu.
 */
export async function importTemplates(data: unknown) {
  const file = data as Partial<TemplateExportFile> | null
  if (!file || file.format !== TEMPLATE_EXPORT_FORMAT) fail('Keine CHAPEL-Vorlagen-Datei.')
  if (typeof file.formatVersion !== 'number' || file.formatVersion > TEMPLATE_EXPORT_VERSION) {
    fail('Diese Datei stammt aus einer neueren CHAPEL-Version.')
  }
  if (!Array.isArray(file.templates) || !file.templates.length) fail('Die Datei enthält keine Vorlagen.')

  const db = useDb()
  const tracks = await db.select().from(schema.tracks)
  const byHash = new Map(tracks.map(t => [t.fileHash, t.id]))
  const byTitle = new Map(tracks.map(t => [`${t.title.toLowerCase()}@${t.playbackRate}`, t.id]))
  const unmatchedTracks = new Set<string>()

  const result = await db.transaction(async (tx) => {
    // Elementtypen
    const known = new Map((await listElementTypes(tx)).map(t => [t.key, t]))
    let order = Math.max(0, ...[...known.values()].map(t => t.sortOrder))
    const createdTypes: string[] = []
    for (const raw of Array.isArray(file.elementTypes) ? file.elementTypes : []) {
      if (!raw || typeof raw.key !== 'string' || known.has(raw.key) || !/^[\w-]{1,40}$/.test(raw.key)) continue
      const input = validateElementTypeInput(raw, { requireLabel: true })
      const [row] = await tx.insert(schema.elementTypes).values({
        key: raw.key,
        label: input.label!,
        defaultLabel: input.defaultLabel ?? input.label!,
        fixed: input.fixed ?? false,
        color: input.color ?? 'neutral',
        icon: input.icon ?? 'i-lucide-music',
        sortOrder: ++order,
        builtin: false
      }).returning()
      known.set(row!.key, toElementTypeDto(row!))
      createdTypes.push(row!.label)
    }

    // Vorlagen
    const existingNames = new Set((await tx.select({ name: schema.serviceTypes.name }).from(schema.serviceTypes)).map(r => r.name))
    const createdTemplates: ServiceTypeDto[] = []
    for (const template of file.templates!) {
      const baseName = typeof template?.name === 'string' ? template.name.trim().slice(0, 120) : ''
      if (!baseName || !Array.isArray(template.items)) fail('Eine Vorlage hat keinen Namen oder keine Schritte.')
      let name = baseName
      for (let n = 1; existingNames.has(name); n++) name = n === 1 ? `${baseName} (Import)` : `${baseName} (Import ${n})`
      existingNames.add(name)

      const [created] = await tx.insert(schema.serviceTypes).values({
        name,
        description: typeof template.description === 'string' ? template.description.trim() || null : null
      }).returning()

      const items = template.items.map((item, position) => {
        const kind = typeof item?.kind === 'string' && known.has(item.kind) ? item.kind : SONG_KIND
        const ref = item?.defaultTrack
        let defaultTrackId: number | null = null
        if (ref && typeof ref.title === 'string') {
          defaultTrackId = (typeof ref.fileHash === 'string' ? byHash.get(ref.fileHash) : undefined)
            ?? byTitle.get(`${ref.title.toLowerCase()}@${Number(ref.playbackRate) || 1}`)
            ?? null
          if (defaultTrackId == null) unmatchedTracks.add(ref.title)
        }
        const label = typeof item?.label === 'string' && item.label.trim() ? item.label.trim().slice(0, 120) : known.get(kind)!.defaultLabel
        return { serviceTypeId: created!.id, position, kind, label, defaultTrackId }
      })
      if (items.length) await tx.insert(schema.serviceTypeItems).values(items)
      createdTemplates.push({
        id: created!.id,
        name: created!.name,
        description: created!.description,
        createdAt: created!.createdAt.toISOString(),
        updatedAt: created!.updatedAt.toISOString()
      })
    }
    return { createdTemplates, createdTypes }
  })

  return { ...result, unmatchedTracks: [...unmatchedTracks] }
}
