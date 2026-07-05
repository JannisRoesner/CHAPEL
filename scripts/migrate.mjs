import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

try {
  await import('dotenv/config')
} catch {
  // optional in production
}

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const client = postgres(dbUrl, { max: 1 })
const { drizzle } = await import('drizzle-orm/postgres-js')
const db = drizzle(client)

await migrate(db, { migrationsFolder: './server/database/migrations' })
await client.end()
console.log('Migrations complete')
