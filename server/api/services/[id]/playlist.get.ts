import { asc, eq } from 'drizzle-orm'

import { useDb, schema } from '../../../database'
import type { PlaylistStepDto } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  const serviceId = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(serviceId)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }

  const db = useDb()
  const items = await db
    .select({
      id: schema.serviceItems.id,
      position: schema.serviceItems.position,
      kind: schema.serviceItems.kind,
      label: schema.serviceItems.label,
      trackId: schema.serviceItems.trackId,
      title: schema.tracks.title,
      composer: schema.tracks.composer,
      durationMs: schema.tracks.durationMs
    })
    .from(schema.serviceItems)
    .leftJoin(schema.tracks, eq(schema.serviceItems.trackId, schema.tracks.id))
    .where(eq(schema.serviceItems.serviceId, serviceId))
    .orderBy(asc(schema.serviceItems.position))

  const steps: PlaylistStepDto[] = items.map(item => ({
    id: item.id,
    position: item.position,
    kind: item.kind,
    label: item.label,
    trackId: item.trackId,
    title: item.title,
    composer: item.composer,
    durationMs: item.durationMs,
    streamUrl: item.trackId ? `/api/tracks/${item.trackId}/stream` : null
  }))

  return steps
})
