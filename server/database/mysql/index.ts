import { drizzle } from 'drizzle-orm/mysql2'
import type { MySql2Database } from 'drizzle-orm/mysql2' // นำเข้า Type ของ Drizzle สำหรับ MySQL
import mysql from 'mysql2/promise'
import * as schema from './schema'

let _pool: mysql.Pool | null = null
// ใช้ MySql2Database เป็น Type หลักแทน ReturnType
let _db: MySql2Database<typeof schema> | null = null

/**
 * Use the singleton pattern because Nitro (dev mode) might import this file multiple times.
 */
export function useMysqlDb() {
  if (_db) return _db

  // const config = useRuntimeConfig()
  // const connectionString = config.mysqlDatabaseUrl

  if (!process.env.NUXT_MYSQL_DATABASE_URL) {
    throw new Error('NUXT_MYSQL_DATABASE_URL is not set. Configure mysqlDatabaseUrl in nuxt config / .env.')
  }

  _pool = mysql.createPool({
    uri: process.env.NUXT_MYSQL_DATABASE_URL,
    connectionLimit: 10,
  })

  // ใช้ as unknown as MySql2Database เพื่อบอกให้ TypeScript ข้ามการตรวจสอบ Type ของ Pool ที่ไม่ตรงกัน
  _db = drizzle(_pool, {
    schema,
    mode: 'default',
    logger: process.env.NODE_ENV === 'development'
  }) as unknown as MySql2Database<typeof schema>

  return _db
}

export { schema }
