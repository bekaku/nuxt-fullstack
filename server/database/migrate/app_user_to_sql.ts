import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { join } from 'path'
import { mkdir, writeFile, appendFile } from 'fs/promises'
import { useMysqlDb } from '../mysql'
import { bitToBool, escapeSql, toDateString } from '../../utils/serverUtils'

//  npx tsx server/database/migrate/app_user_to_sql.ts


// 1. Interface สำหรับโครงสร้างข้อมูลจาก MySQL (Raw Query)
interface MysqlAppUser {
  id: number | bigint
  login_name: string
  password: string
  salt: string | null
  req_token: string | null
  req_token_expire: Date | null
  last_login: Date | null
  teacher: number | null
  establishment: number | null
  department_group: number | null
  college_official: Buffer | null
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

// 3. Main Migration Function
export async function runMigrateAppUserToSqlFile() {
  const cdnDirectory = process.env.NUXT_CDN_DIRECTORY

  if (!cdnDirectory) {
    throw new Error('NUXT_CDN_DIRECTORY is not set in .env')
  }

  const targetDir = join(cdnDirectory, 'migrate-sql')
  const filePath = join(targetDir, 'V1__init_app_user.sql')

  // สร้างโฟลเดอร์ปลายทาง
  await mkdir(targetDir, { recursive: true })

  // รีเซ็ต/สร้างไฟล์ .sql ใหม่
  await writeFile(filePath, '-- Migration Script: MySQL app_user -> PostgreSQL app_user_test\n\n', 'utf-8')

  const mysqlDb = useMysqlDb()
  const batchSize = 1000
  let lastId: number | bigint = 0
  let totalMigrated = 0

  console.log(`Starting SQL generation to: ${filePath}`)

  while (true) {
    const [result] = await mysqlDb.execute(
      sql`SELECT * FROM app_user WHERE id > ${lastId} ORDER BY id ASC LIMIT ${batchSize}`
    )

    const rows = result as unknown as MysqlAppUser[]
    if (rows.length === 0) break

    const valuesArray = rows.map((row) => {
      const reqTokenExpire = row.req_token_expire ? new Date(row.req_token_expire) : null
      const lastLogin = toDateString(row.last_login)
      const collegeOfficial = bitToBool(row.college_official)
      const active = bitToBool(row.active)
      const useMobileApp = bitToBool(row.use_mobile_app)
      const useManagerApp = bitToBool(row.use_manager_app)

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

    await appendFile(filePath, insertQuery, 'utf-8')

    lastId = rows[rows.length - 1]!.id
    totalMigrated += rows.length

    console.log(`Exported ${totalMigrated} rows... (Last ID: ${lastId})`)
  }

  console.log(`\nSQL file generated successfully at:\n${filePath}`)
}

// 4. สั่ง Execute อัตโนมัติเมื่อเรียกไฟล์นี้โดยตรงผ่าน CLI
runMigrateAppUserToSqlFile()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
