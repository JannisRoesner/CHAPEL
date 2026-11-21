import { randomUUID } from 'node:crypto'

import { max } from 'drizzle-orm'

import { schema, useDb } from '../../database'
import { requireAdmin } from '../../utils/auth'
import type { ElementTypeDto } from '#shared/types/chapel'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Partial<ElementTypeDto>>(event)
  const input = validateElementTypeInput(body, { requireLabel: true })

  const db = useDb()
  const [{ value: maxOrder } = { value: 0 }] = await db.select({ value: max(schema.elementTypes.sortOrder) }).from(schema.elementTypes)
  const [row] = await db.insert(schema.elementTypes).values({
    key: `t-${randomUUID().slice(0, 8)}`,
    label: input.label!,
    defaultLabel: input.defaultLabel ?? input.label!,
    fixed: input.fixed ?? false,
    color: input.color ?? 'neutral',
    icon: input.icon ?? 'i-lucide-music',
    sortOrder: (maxOrder ?? 0) + 1,
    builtin: false
  }).returning()

  broadcastElementTypes()
  return toElementTypeDto(row!)
})
