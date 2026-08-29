import { bitToBool, toDateString } from './helpers'

// กำหนด Type ของ Config
export interface MigrationConfig {
  sourceTable: string
  targetTable: string
  targetColumns: string[]
  cursorColumn?: string // เผื่อตารางไหนไม่ได้ใช้ id เป็น Primary Key
  mapRow: (row: any) => any[] // ฟังก์ชันแปลง row จาก MySQL ให้ออกมาเป็น Array ของค่าที่ต้องการ
}

// ลิสต์ตารางที่คุณต้องการแบบ Custom
export const tableMappings: MigrationConfig[] = [
  {
    sourceTable: 'app_user',
    targetTable: 'app_user_test',
    // 1. ระบุชื่อคอลัมน์ปลายทางใน PG (เอาเฉพาะที่อยากได้)
    targetColumns: ['id', 'login_name', 'active', 'last_login', 'use_mobile_app'],

    // 2. Map ค่าทีละตัวให้ตรงกับลำดับคอลัมน์ด้านบน
    mapRow: (row) => [
      row.id,
      row.login_name,
      bitToBool(row.active),
      toDateString(row.last_login),
      bitToBool(row.use_mobile_app)
    ]
  },
  // {
  //   sourceTable: 'department',
  //   targetTable: 'department_pg',
  //   targetColumns: ['dept_id', 'dept_name', 'is_active'],
  //   cursorColumn: 'dept_id', // บอกให้ระบบรู้ว่าตารางนี้ต้อง WHERE วนลูปด้วย dept_id นะ
  //   mapRow: (row) => [
  //     row.dept_id,
  //     row.name, // ต้นทางชื่อ name ปลายทางชื่อ dept_name ก็ทำได้
  //     bitToBool(row.status_active)
  //   ]
  // }
]
