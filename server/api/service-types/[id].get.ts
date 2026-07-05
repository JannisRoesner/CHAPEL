import { asc, eq, inArray } from 'drizzle-orm'

import { useDb, schema } from '../../database'
import { toTrackDto } from '../tracks/index.get'
import type { ServiceTypeDto, ServiceTypeItemDto } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const db = useDb()
  const [type] = await db
    .select()
    .from(schema.serviceTypes)
    .where(eq(schema.serviceTypes.id, id))
    .limit(1)

  if (!type) {
    throw createError({ statusCode: 404, statusMessage: 'Gottesdienst-Typ nicht gefunden' })
  }

  const items = await db
    .select()
    .from(schema.serviceTypeItems)
    .where(eq(schema.serviceTypeItems.serviceTypeId, id))
    .orderBy(asc(schema.serviceTypeItems.position))

  const trackIds = items
    .map((item) => item.defaultTrackId)
    .filter((trackId): trackId is number => trackId != null)

  const allTracks = trackIds.length
    ? await db.select().from(schema.tracks).where(inArray(schema.tracks.id, trackIds))
    : []

  const trackMap = new Map(allTracks.map((t) => [t.id, toTrackDto(t)]))

  const itemDtos: ServiceTypeItemDto[] = items.map((item) => ({
    id: item.id,
    serviceTypeId: item.serviceTypeId,
    position: item.position,
    kind: item.kind,
    label: item.label,
    defaultTrackId: item.defaultTrackId,
    defaultTrack: item.defaultTrackId ? trackMap.get(item.defaultTrackId) ?? null : null
  }))

  const dto: ServiceTypeDto = {
    id: type.id,
    name: type.name,
    description: type.description,
    items: itemDtos,
    createdAt: type.createdAt.toISOString(),
    updatedAt: type.updatedAt.toISOString()
  }
  return dto
})
