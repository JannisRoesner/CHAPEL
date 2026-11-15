/** Kompletter Offline-Container (ZIP) mit `manifest.json` und allen Audiodateien. */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Ungültige ID' })
  }
  const manifest = await buildPackageManifest(id)
  if (!manifest) {
    throw createError({ statusCode: 404, statusMessage: 'Gottesdienst nicht gefunden' })
  }

  let zip
  try {
    zip = await createPackageZip(manifest)
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'Audiodatei fehlt auf dem Server' })
  }

  setHeader(event, 'Content-Type', 'application/zip')
  setHeader(event, 'Content-Length', zip.size)
  setHeader(event, 'ETag', `"${manifest.version}"`)
  setHeader(event, 'X-Chapel-Package-Version', manifest.version)
  setHeader(event, 'Content-Disposition', `attachment; filename="chapel-service-${id}-${manifest.version.slice(0, 8)}.zip"`)
  return sendStream(event, zip.stream)
})
