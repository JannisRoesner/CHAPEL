/** Vorlagen als JSON-Datei; `?ids=1,2` für eine Auswahl, sonst alle. */
export default defineEventHandler(async (event) => {
  const raw = getQuery(event).ids
  const ids = typeof raw === 'string'
    ? raw.split(',').map(Number).filter(Number.isFinite)
    : undefined

  const data = await exportTemplates(ids)
  const date = data.exportedAt.slice(0, 10)
  setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="chapel-vorlagen-${date}.json"`)
  return JSON.stringify(data, null, 2)
})
