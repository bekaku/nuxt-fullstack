import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let _queryClient: ReturnType<typeof postgres> | null = null
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

/**
* Use the singleton pattern because Nitro (dev mode) might import this file multiple times.
* Also, postgres.js already has its own connection pool, so it shouldn't be created repeatedly for every request.
*/
export function useDb() {
  if (_db) return _db

  const config = useRuntimeConfig()
  const connectionString = config.databaseUrl

  if (!connectionString) {
    throw new Error('NUXT_DATABASE_URL is not set. Copy .env.example to .env and configure it.')
  }

  _queryClient = postgres(connectionString, { max: 10 })
  _db = drizzle(_queryClient, { schema, logger: process.env.NODE_ENV === 'development' })

  return _db
}

export { schema }
