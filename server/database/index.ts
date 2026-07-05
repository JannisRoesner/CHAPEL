import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

let client: ReturnType<typeof postgres> | null = null
let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (!db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw createError({
        statusCode: 500,
        statusMessage: 'DATABASE_URL is not configured'
      })
    }
    client = postgres(url, { max: 10 })
    db = drizzle(client, { schema })
  }
  return db
}

export type DbClient = ReturnType<typeof useDb>
export type DbTransaction = Parameters<Parameters<DbClient['transaction']>[0]>[0]
export type DbExecutor = DbClient | DbTransaction

export async function closeDb() {
  if (client) {
    await client.end()
    client = null
    db = null
  }
}

export { schema }
