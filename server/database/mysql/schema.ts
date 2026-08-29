// server/db/mysql/schema.ts
import { mysqlTable, bigint, varchar, tinyint, datetime } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  // หาก ID ต้นทางใช้เป็นเลข BigInt อยู่แล้ว ให้ระบุ mode: 'bigint'
  // (แต่ถ้า MySQL 5 เดิมใช้ INT ธรรมดา สามารถเปลี่ยนเป็น int('id') ได้)
  id: bigint('id', { mode: 'bigint', unsigned: true }).primaryKey(),

  email: varchar('email', { length: 255 }).notNull(),

  // MySQL 5 ไม่มี Native Boolean จึงนิยมใช้ TINYINT(1)
  isActive: tinyint('is_active').default(1),

  // ใช้ datetime หรือ timestamp ตาม Data Type เดิมใน MySQL 5
  createdAt: datetime('created_at', { mode: 'date' }),
})
