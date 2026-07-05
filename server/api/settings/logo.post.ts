export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const form = await readMultipartFormData(event)
  if (!form?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Keine Datei hochgeladen' })
  }

  const filePart = form.find(part => part.name === 'file' && part.data)
  if (!filePart?.data || !filePart.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Keine Datei hochgeladen' })
  }

  const mimeType = filePart.type || 'application/octet-stream'
  validateLogoUpload(filePart.data, mimeType, filePart.filename)
  await saveCustomLogo(filePart.data, mimeType)

  return {
    hasCustomLogo: true,
    logoUrl: '/api/branding/logo',
    faviconUrl: '/api/branding/logo?size=32'
  }
})
