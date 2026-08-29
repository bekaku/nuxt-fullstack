import { useMysqlDb } from '#server/database/mysql'
import { sql } from 'drizzle-orm'
import { join } from 'path'
import { mkdir, writeFile, appendFile } from 'fs/promises'
import { bitToBool, escapeSql, toDateString } from '~~/server/utils/serverUtils'
interface MysqlAppUser {
  id: number
  login_name: string
  password: string
  salt: string | null
  req_token: string | null
  req_token_expire: Date | null
  last_login: Date | null
  teacher: number | null
  establishment: number | null
  department_group: number | null
  college_official: Buffer | null // BIT(1) จะคืนค่ามาเป็น Buffer
  active: Buffer | null
  poll_data: string | null
  image_name: string | null
  use_mobile_app: Buffer | null
  use_manager_app: Buffer | null
  created_user: number | null
  created_date: Date
  updated_user: number | null
  updated_date: Date
}

// Helper Function: ป้องกัน SQL Injection และจัด Format ข้อมูลสำหรับใส่ใน Raw SQL

export default defineEventHandler(async (event) => {
  const mysqlDb = useMysqlDb()

  const config = useRuntimeConfig()
  // 1. จัดการ Path และสร้างโฟลเดอร์ปลายทาง
  if (!config.cdnDirectory) {
    throw new Error('cdnDirectory is not defined in runtime config.')
  }

  const targetDir = join(config.cdnDirectory, 'migrate-sql')
  const filePath = join(targetDir, 'V1__init_app_user.sql')

  // สร้างโฟลเดอร์ถ้ายังไม่มี
  await mkdir(targetDir, { recursive: true })

  // สร้าง/เคลียร์ไฟล์เดิมทิ้ง เพื่อเริ่มเขียนใหม่
  await writeFile(filePath, '-- Migration Script: app_user to app_user_test\n\n', 'utf-8')

  const batchSize = 1000
  let lastId = 0
  let totalMigrated = 0

  console.log(`Starting SQL generation at: ${filePath}`)

  while (true) {
    const [result] = await mysqlDb.execute(
      sql`SELECT * FROM app_user WHERE id > ${lastId} ORDER BY id ASC LIMIT ${batchSize}`
    )

    const rows = result as unknown as MysqlAppUser[]
    if (rows.length === 0) break

    // 2. แปลงข้อมูลและเตรียมสร้าง Values
    const valuesArray = rows.map((row) => {
      // ดึงค่าและจัด Format ก่อนเข้า escapeSql
      const reqTokenExpire = row.req_token_expire ? new Date(row.req_token_expire) : null
      const lastLogin = toDateString(row.last_login) //ได้เป็น 'YYYY-MM-DD' String
      const collegeOfficial = bitToBool(row.college_official)
      const active = bitToBool(row.active)
      const useMobileApp = bitToBool(row.use_mobile_app)
      const useManagerApp = bitToBool(row.use_manager_app)

      // นำค่าทั้งหมดมาประกอบเป็น (val1, val2, ...)
      return `(
        ${escapeSql(row.id)},
        ${escapeSql(row.login_name)},
        ${escapeSql(row.password)},
        ${escapeSql(row.salt)},
        ${escapeSql(row.req_token)},
        ${escapeSql(reqTokenExpire)},
        ${escapeSql(lastLogin)},
        ${escapeSql(row.teacher)},
        ${escapeSql(row.establishment)},
        ${escapeSql(row.department_group)},
        ${escapeSql(collegeOfficial)},
        ${escapeSql(active)},
        ${escapeSql(row.poll_data)},
        ${escapeSql(row.image_name)},
        ${escapeSql(useMobileApp)},
        ${escapeSql(useManagerApp)},
        ${escapeSql(row.created_user)},
        ${escapeSql(new Date(row.created_date))},
        ${escapeSql(row.updated_user)},
        ${escapeSql(new Date(row.updated_date))}
      )`
    })

    // 3. สร้างคำสั่ง INSERT ชุดละ 1,000 แถว
    const insertQuery = `
INSERT INTO app_user_test (
  id, login_name, password, salt, req_token, req_token_expire, last_login,
  teacher, establishment, department_group, college_official, active,
  poll_data, image_name, use_mobile_app, use_manager_app,
  created_user, created_date, updated_user, updated_date
) VALUES
${valuesArray.join(',\n')}
ON CONFLICT (id) DO NOTHING;
    `.trim() + '\n\n'

    // 4. เขียนต่อท้ายไฟล์ (Append) ทีละ Batch เพื่อไม่ให้กิน RAM
    await appendFile(filePath, insertQuery, 'utf-8')

    lastId = rows[rows.length - 1]!.id
    totalMigrated += rows.length

    console.log(`Exported ${totalMigrated} rows to SQL... (Last ID: ${lastId})`)
  }
  console.log('SQL Generation completed successfully!')
});
