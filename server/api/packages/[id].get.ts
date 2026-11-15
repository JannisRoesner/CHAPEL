/** Manifest eines Gottesdienst-Pakets. Unterstützt `If-None-Match` (ETag = Version). */
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
  const etag = `"${manifest.version}"`
  setHeader(event, 'ETag', etag)
  setHeader(event, 'Cache-Control', 'private, no-cache')
  if (getRequestHeader(event, 'if-none-match') === etag) {
    setResponseStatus(event, 304)
    return null
  }
  return manifest
})
