import { desc } from 'drizzle-orm'

import { useDb, schema } from '../../database'
import type { PackageSummaryDto } from '#shared/types/chapel'

/** Liste aller herunterladbaren Gottesdienst-Pakete inkl. Inhalts-Version. */
export default defineEventHandler(async (event) => {
  await requireUser(event)
  const rows = await useDb()
    .select({ id: schema.services.id })
    .from(schema.services)
    .orderBy(desc(schema.services.serviceDate))

  const result: PackageSummaryDto[] = []
  for (const row of rows) {
    const manifest = await buildPackageManifest(row.id)
    if (!manifest) continue
    result.push({
      serviceId: manifest.service.id,
      name: manifest.service.name,
      serviceDate: manifest.service.serviceDate,
      version: manifest.version,
      updatedAt: manifest.service.updatedAt,
      stepCount: manifest.steps.length,
      totalAudioBytes: manifest.totalAudioBytes,
      manifestUrl: `/api/packages/${row.id}`,
      downloadUrl: `/api/packages/${row.id}/download`
    })
  }
  return result
})
