import type { LegalContent } from '#shared/constants/legal'

import { setLegalContent } from '../../utils/legal'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Partial<LegalContent>>(event)

  if (body?.impressum === undefined && body?.privacy === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Mindestens eines der Felder impressum oder privacy erforderlich'
    })
  }

  return setLegalContent({
    impressum: body.impressum,
    privacy: body.privacy
  })
})
