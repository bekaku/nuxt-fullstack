import { useMysqlDb } from '#server/database/mysql'
import * as mysqlSchema from '#server/database/mysql/schema'
import { sql } from 'drizzle-orm'


export default defineEventHandler(async (event) => {
  const mysqlDb = useMysqlDb()
  const [result] = await mysqlDb.execute(
    sql`SELECT * FROM app_user LIMIT 10`
  )
  const rawRows = result as unknown as any[]

  const rows = rawRows.map(row => ({
    ...row,
    // เช็คว่ามีค่าไหม และตัวแรกเป็น 1 หรือเปล่า
    use_mobile_app: row.use_mobile_app ? row.use_mobile_app[0] === 1 : false
  }))
  // 2. Cast type ของ rows ให้เป็น Array ของ LegacyData
  for (const row of rows) {
    console.log('id', row['id'], 'login_name', row['login_name'], 'created_date', row['created_date'], 'use_mobile_app', row['use_mobile_app'])
  }

  // get single row
  // const record = rows[0]

  // const status = 1
  // const minId = 100
  // const [filteredRows] = await mysqlDb.execute(
  //   sql`SELECT id, email FROM users WHERE is_active = ${status} AND id > ${minId}`
  // )
  // console.log(filteredRows)
  console.log(rows)

  return rows
});
