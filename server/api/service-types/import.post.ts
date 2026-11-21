import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const result = await importTemplates(await readBody(event))

  for (const template of result.createdTemplates) {
    broadcastEvent({ type: 'serviceType.created', payload: template as unknown as Record<string, unknown> })
  }
  if (result.createdTypes.length) broadcastElementTypes()
  return result
})
