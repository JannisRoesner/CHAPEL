import { inArray } from 'drizzle-orm'

import { LEGAL_SETTING_KEYS, type LegalContent } from '#shared/constants/legal'

import { useDb, schema } from '../database'

const LEGAL_KEYS = Object.values(LEGAL_SETTING_KEYS)

export async function getLegalContent(): Promise<LegalContent> {
  const db = useDb()
  const rows = await db
    .select()
    .from(schema.appSettings)
    .where(inArray(schema.appSettings.key, LEGAL_KEYS))

  const values = Object.fromEntries(rows.map(row => [row.key, row.value]))

  return {
    impressum: values[LEGAL_SETTING_KEYS.impressum] ?? '',
    privacy: values[LEGAL_SETTING_KEYS.privacy] ?? ''
  }
}

export async function setLegalContent(partial: Partial<LegalContent>): Promise<LegalContent> {
  const db = useDb()
  const updates: Array<{ key: string, value: string }> = []

  if (partial.impressum !== undefined) {
    updates.push({ key: LEGAL_SETTING_KEYS.impressum, value: partial.impressum })
  }
  if (partial.privacy !== undefined) {
    updates.push({ key: LEGAL_SETTING_KEYS.privacy, value: partial.privacy })
  }

  for (const { key, value } of updates) {
    await db
      .insert(schema.appSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: schema.appSettings.key,
        set: { value }
      })
  }

  return getLegalContent()
}
