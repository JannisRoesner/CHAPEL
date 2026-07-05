import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const size = query.size === '32' ? 'favicon-32.png' : 'logo.png'

  const customLogo = await readCustomLogoFile(size)
  if (customLogo) {
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    setHeader(event, 'Content-Type', customLogo.mimeType)
    return customLogo.data
  }

  if (query.size === '32') {
    const faviconPath = join(process.cwd(), 'public', 'icons', 'icon-192.png')
    try {
      const data = await readFile(faviconPath)
      setHeader(event, 'Cache-Control', 'public, max-age=86400')
      setHeader(event, 'Content-Type', 'image/png')
      return data
    } catch {
      // fall through to SVG
    }
  }

  const faviconPath = join(process.cwd(), 'public', 'favicon.svg')
  const data = await readFile(faviconPath)
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  setHeader(event, 'Content-Type', 'image/svg+xml')
  return data
})
