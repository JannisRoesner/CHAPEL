import { and, desc, eq, ilike, or } from 'drizzle-orm'

import { useDb, schema } from '../../database'
import type { TrackDto } from '#shared/types/chapel'

export function toTrackDto(track: typeof schema.tracks.$inferSelect): TrackDto {
  return {
    id: track.id,
    title: track.title,
    composer: track.composer,
    durationMs: track.durationMs,
    category: track.category,
    categoryId: track.categoryId,
    fileHash: track.fileHash,
    originalFilename: track.originalFilename,
    mimeType: track.mimeType,
    fileSizeBytes: track.fileSizeBytes,
    createdAt: track.createdAt.toISOString(),
    updatedAt: track.updatedAt.toISOString()
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const category = typeof query.category === 'string' ? query.category : undefined

  const db = useDb()
  const conditions = []

  if (search) {
    conditions.push(
      or(
        ilike(schema.tracks.title, `%${search}%`),
        ilike(schema.tracks.composer, `%${search}%`),
        ilike(schema.tracks.originalFilename, `%${search}%`)
      )
    )
  }

  if (category === 'hymn' || category === 'liturgy') {
    conditions.push(eq(schema.tracks.category, category))
  }

  const rows = await db
    .select()
    .from(schema.tracks)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.tracks.updatedAt))

  return rows.map(toTrackDto)
})
