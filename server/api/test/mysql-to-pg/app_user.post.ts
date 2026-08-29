import { useMysqlDb } from '#server/database/mysql'
import { sql } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { bitToBool, toDateString } from '~~/server/utils/serverUtils'

// 1. ประกาศ Type สำหรับข้อมูลที่ได้จาก MySQL (Raw Query)
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

export default defineEventHandler(async (event) => {
  const mysqlDb = useMysqlDb()
  const pgDb = useDb()

    const config = useRuntimeConfig()
  const cdnDirectory = config.cdnDirectory


  // 2. Helper Function: แปลง Buffer(BIT) เป็น Boolean
  const batchSize = 1000
  let lastId = 0
  let totalMigrated = 0

  console.log('Starting migration for app_user...')

  while (true) {
    // 4. ดึงข้อมูลจาก MySQL (แบ่งดึงทีละ 1,000 แถว โดยใช้ id ล่าสุดเป็นตัวตาม)
    const [result] = await mysqlDb.execute(
      sql`SELECT * FROM app_user WHERE id > ${lastId} ORDER BY id ASC LIMIT ${batchSize}`
    )

    const rows = result as unknown as MysqlAppUser[]

    // ถ้าไม่มีข้อมูลแล้ว ให้ออกจาก Loop
    if (rows.length === 0) break

    // 5. Transform ข้อมูลให้ตรงกับ Schema ของ PostgreSQL (CamelCase & Types)
    const transformedData = rows.map((row) => ({
      id: row.id,
      loginName: row.login_name,
      password: row.password,
      salt: row.salt,
      reqToken: row.req_token,
      // timestamp ใช้ Object Date ได้เลย
      reqTokenExpire: row.req_token_expire ? new Date(row.req_token_expire) : null,
      // date (default mode ของ Drizzle PG คือ string) ต้องแปลงเป็น 'YYYY-MM-DD'
      lastLogin: toDateString(row.last_login),
      teacher: row.teacher,
      establishment: row.establishment,
      departmentGroup: row.department_group,
      // แปลง Buffer ให้กลายเป็น Boolean true/false
      collegeOfficial: bitToBool(row.college_official),
      active: bitToBool(row.active),
      pollData: row.poll_data,
      imageName: row.image_name,
      useMobileApp: bitToBool(row.use_mobile_app),
      useManagerApp: bitToBool(row.use_manager_app),
      createdUser: row.created_user,
      createdDate: new Date(row.created_date),
      updatedUser: row.updated_user,
      updatedDate: new Date(row.updated_date),
    }))

    // 6. Insert ลง PostgreSQL
    // onConflictDoNothing: ป้องกัน Error เผื่อรันสคริปต์ซ้ำ (แถวที่ id ซ้ำจะถูกข้าม)
    await pgDb
      .insert(schema.appUserTest)
      .values(transformedData)
      .onConflictDoNothing({ target: schema.appUserTest.id })

    // อัปเดตค่า lastId สำหรับไปค้นหารอบถัดไป
    lastId = rows[rows.length - 1]!.id
    totalMigrated += rows.length

    console.log(`Migrated ${totalMigrated} rows... (Last ID: ${lastId})`)
  }

  console.log('Migration completed successfully!')

  /**
   * (Optional) 7. อัปเดต Sequence ถ้าย้ายข้อมูลเสร็จแล้ว
   * ถ้าใน PostgreSQL คอลัมน์ id มีการทำ Auto-increment (เช่นใช้ serial หรือ generatedAlwaysAsIdentity)
   * คุณต้องอัปเดตเลข Sequence ให้รันต่อจาก ID สูงสุดที่ย้ายเข้ามา
   *
   * ก. การจัดการลำดับ Foreign Key (Dependency Order)
    วิธีที่ 1 (แนะนำสำหรับ Bulk Migration): ปิดการตรวจสอบ Foreign Key ชั่วคราวใน PostgreSQL ระหว่างนำเข้าข้อมูล:

    SQL
    SET session_replication_role = 'replica';
    -- ทำการย้ายข้อมูลทั้งหมด --
    SET session_replication_role = 'origin';
    วิธีที่ 2: ย้ายตารางแม่ (Parent Tables) ก่อนตารางลูก (Child Tables) ตามลำดับความสัมพันธ์
   */


  /*
  await pgDb.execute(sql`
    SELECT setval(
      pg_get_serial_sequence('app_user_test', 'id'),
      COALESCE((SELECT MAX(id) FROM app_user_test), 1)
    );
  `)
  */
});
