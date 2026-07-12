import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { eq } from 'drizzle-orm'
import sharp from 'sharp'

import { COPYRIGHT_HOLDER_KEY, COPYRIGHT_HOLDER_MAX_LENGTH } from '#shared/constants/branding'

import { useDb, schema } from '../database'

export const CUSTOM_LOGO_KEY = 'custom_logo'

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml'
])

const MAX_LOGO_SIZE = 2 * 1024 * 1024

export function getBrandingStoragePath(): string {
  return process.env.BRANDING_STORAGE_PATH || join(process.cwd(), 'data', 'branding')
}

export async function ensureBrandingStorage(): Promise<string> {
  const path = getBrandingStoragePath()
  await mkdir(path, { recursive: true })
  return path
}

export function getBrandingFilePath(filename: string): string {
  return join(getBrandingStoragePath(), filename)
}

export async function getCopyrightHolder(): Promise<string> {
  const db = useDb()
  const [row] = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.key, COPYRIGHT_HOLDER_KEY))
    .limit(1)
  return row?.value?.trim() ?? ''
}

export async function setCopyrightHolder(value: string): Promise<string> {
  const trimmed = value.trim()
  if (trimmed.length > COPYRIGHT_HOLDER_MAX_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Copyright-Hinweis darf maximal ${COPYRIGHT_HOLDER_MAX_LENGTH} Zeichen lang sein`
    })
  }

  const db = useDb()
  if (trimmed) {
    await db
      .insert(schema.appSettings)
      .values({ key: COPYRIGHT_HOLDER_KEY, value: trimmed })
      .onConflictDoUpdate({
        target: schema.appSettings.key,
        set: { value: trimmed }
      })
  } else {
    await db
      .delete(schema.appSettings)
      .where(eq(schema.appSettings.key, COPYRIGHT_HOLDER_KEY))
  }

  return trimmed
}

export async function getCustomLogoSetting(): Promise<string | null> {
  const db = useDb()
  const [row] = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.key, CUSTOM_LOGO_KEY))
    .limit(1)
  return row?.value ?? null
}

export async function setCustomLogoSetting(filename: string | null): Promise<void> {
  const db = useDb()
  if (filename) {
    await db
      .insert(schema.appSettings)
      .values({ key: CUSTOM_LOGO_KEY, value: filename })
      .onConflictDoUpdate({
        target: schema.appSettings.key,
        set: { value: filename }
      })
  } else {
    await db
      .delete(schema.appSettings)
      .where(eq(schema.appSettings.key, CUSTOM_LOGO_KEY))
  }
}

export function validateLogoUpload(
  data: Buffer,
  mimeType: string,
  filename: string
): void {
  if (data.length > MAX_LOGO_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'Logo zu groß (max. 2 MB)' })
  }

  const normalizedMime = mimeType.toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nur PNG-, JPEG-, WebP- und SVG-Dateien erlaubt'
    })
  }

  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'))
  if (!['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nur PNG-, JPEG-, WebP- und SVG-Dateien erlaubt'
    })
  }
}

async function writeLogoVariant(
  input: Buffer,
  filename: string,
  size: number
): Promise<void> {
  const output = await sharp(input)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 30, g: 41, b: 59, alpha: 1 }
    })
    .png()
    .toBuffer()
  await writeFile(getBrandingFilePath(filename), output)
}

export async function saveCustomLogo(data: Buffer, mimeType: string): Promise<void> {
  await ensureBrandingStorage()
  await clearCustomLogoFiles()

  const input = sharp(data, mimeType === 'image/svg+xml' ? { density: 300 } : undefined)
  const pngBuffer = await input.png().toBuffer()

  await writeFile(getBrandingFilePath('logo-original.png'), pngBuffer)
  await writeLogoVariant(pngBuffer, 'logo.png', 512)
  await writeLogoVariant(pngBuffer, 'icon-192.png', 192)
  await writeLogoVariant(pngBuffer, 'icon-512.png', 512)
  await writeLogoVariant(pngBuffer, 'favicon-32.png', 32)

  await setCustomLogoSetting('logo.png')
}

export async function clearCustomLogoFiles(): Promise<void> {
  const storagePath = getBrandingStoragePath()
  await rm(storagePath, { recursive: true, force: true })
  await ensureBrandingStorage()
}

export async function removeCustomLogo(): Promise<void> {
  await clearCustomLogoFiles()
  await setCustomLogoSetting(null)
}

export async function readCustomLogoFile(preferred = 'logo.png'): Promise<{
  data: Buffer
  mimeType: string
} | null> {
  const setting = await getCustomLogoSetting()
  if (!setting) return null

  const candidates = [preferred, 'favicon-32.png', 'logo.png', setting]
  for (const name of [...new Set(candidates)]) {
    try {
      const data = await readFile(getBrandingFilePath(name))
      return {
        data,
        mimeType: name.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
      }
    } catch {
      // try next candidate
    }
  }
  return null
}
