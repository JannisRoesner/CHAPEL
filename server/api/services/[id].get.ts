import { asc, eq, inArray } from 'drizzle-orm'

import { useDb, schema } from '../../database'
import { toTrackDto } from '../tracks/index.get'
import type { ServiceDto, ServiceItemDto } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const db = useDb()
  const [service] = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, id))
    .limit(1)

  if (!service) {
    throw createError({ statusCode: 404, statusMessage: 'Gottesdienst nicht gefunden' })
  }

  const [serviceType] = await db
    .select()
    .from(schema.serviceTypes)
    .where(eq(schema.serviceTypes.id, service.serviceTypeId))
    .limit(1)

  const items = await db
    .select()
    .from(schema.serviceItems)
    .where(eq(schema.serviceItems.serviceId, id))
    .orderBy(asc(schema.serviceItems.position))

  const trackIds = items
    .map(item => item.trackId)
    .filter((trackId): trackId is number => trackId != null)

  const tracks = trackIds.length
    ? await db.select().from(schema.tracks).where(inArray(schema.tracks.id, trackIds))
    : []

  const trackMap = new Map(tracks.map(t => [t.id, toTrackDto(t)]))

  const itemDtos: ServiceItemDto[] = items.map(item => ({
    id: item.id,
    serviceId: item.serviceId,
    position: item.position,
    kind: item.kind,
    label: item.label,
    trackId: item.trackId,
    track: item.trackId ? trackMap.get(item.trackId) ?? null : null
  }))

  const dto: ServiceDto = {
    id: service.id,
    serviceTypeId: service.serviceTypeId,
    name: service.name,
    serviceDate: service.serviceDate.toISOString(),
    notes: service.notes,
    serviceType: serviceType
      ? {
          id: serviceType.id,
          name: serviceType.name,
          description: serviceType.description,
          createdAt: serviceType.createdAt.toISOString(),
          updatedAt: serviceType.updatedAt.toISOString()
        }
      : undefined,
    items: itemDtos,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString()
  }
  return dto
})
