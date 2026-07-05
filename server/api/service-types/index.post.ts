import { useDb, schema } from '../../database'
import type { ServiceTypeDto } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string, description?: string | null }>(event)
  if (!body.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name erforderlich' })
  }

  const db = useDb()
  const [type] = await db
    .insert(schema.serviceTypes)
    .values({
      name: body.name.trim(),
      description: body.description?.trim() || null
    })
    .returning()

  const dto: ServiceTypeDto = {
    id: type!.id,
    name: type!.name,
    description: type!.description,
    createdAt: type!.createdAt.toISOString(),
    updatedAt: type!.updatedAt.toISOString()
  }
  broadcastEvent({ type: 'serviceType.created', payload: dto as unknown as Record<string, unknown> })
  return dto
})
