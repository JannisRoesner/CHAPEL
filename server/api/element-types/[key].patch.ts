import { eq } from 'drizzle-orm'

import { schema, useDb } from '../../database'
import { requireAdmin } from '../../utils/auth'
import type { ElementTypeDto } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const key = getRouterParam(event, 'key') ?? ''
  const input = validateElementTypeInput(await readBody<Partial<ElementTypeDto>>(event), { requireLabel: false })

  const db = useDb()
  const [existing] = await db.select().from(schema.elementTypes).where(eq(schema.elementTypes.key, key)).limit(1)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Elementtyp nicht gefunden' })
  }
  if (existing.builtin && input.fixed !== undefined && input.fixed !== existing.fixed) {
    throw createError({ statusCode: 400, statusMessage: 'Verhalten der Grundtypen ist fest' })
  }

  const [row] = await db.update(schema.elementTypes).set({
    label: input.label ?? existing.label,
    defaultLabel: input.defaultLabel ?? existing.defaultLabel,
    fixed: input.fixed ?? existing.fixed,
    color: input.color ?? existing.color,
    icon: input.icon ?? existing.icon
  }).where(eq(schema.elementTypes.key, key)).returning()

  broadcastElementTypes()
  return toElementTypeDto(row!)
})
