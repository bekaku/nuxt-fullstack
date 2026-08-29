import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { join } from 'path'
import { mkdir, writeFile, appendFile } from 'fs/promises'
import { useMysqlDb } from '../mysql'
import { escapeSql } from './helpers'
import { tableMappings } from './mappings' // นำเข้า Config 100 ตาราง

// npx tsx server/database/migrate/run-engine.ts
  /**
   * ก. การจัดการลำดับ Foreign Key (Dependency Order)
    วิธีที่ 1 (แนะนำสำหรับ Bulk Migration): ปิดการตรวจสอบ Foreign Key ชั่วคราวใน PostgreSQL ระหว่างนำเข้าข้อมูล:

    SQL
    SET session_replication_role = 'replica';
    -- ทำการย้ายข้อมูลทั้งหมด --
    SET session_replication_role = 'origin';
    วิธีที่ 2: ย้ายตารางแม่ (Parent Tables) ก่อนตารางลูก (Child Tables) ตามลำดับความสัมพันธ์
   */

export async function runEngine() {
  const cdnDirectory = process.env.NUXT_CDN_DIRECTORY
  if (!cdnDirectory) throw new Error('NUXT_CDN_DIRECTORY is not set')

  const targetDir = join(cdnDirectory, 'migrate-sql')
  await mkdir(targetDir, { recursive: true })

  const mysqlDb = useMysqlDb()
  const batchSize = 1000

  console.log(`Starting Engine for ${tableMappings.length} tables...`)

  for (let i = 0; i < tableMappings.length; i++) {
    const config = tableMappings[i]!
    const cursorCol = config.cursorColumn || 'id'

    const filePrefix = String(i + 1).padStart(3, '0')
    const filePath = join(targetDir, `V1_${filePrefix}__init_${config.sourceTable}.sql`)

    console.log(`\n[${i + 1}/${tableMappings.length}] Exporting: ${config.sourceTable} -> ${config.targetTable}`)
    await writeFile(filePath, `-- Custom Migration for ${config.sourceTable}\n\n`, 'utf-8')

    let lastCursorValue: any = 0
    let totalMigrated = 0

    while (true) {
      // ดึงข้อมูลตาม cursor column (เช่น id > 0)
      const [result] = await mysqlDb.execute(
        sql.raw(`SELECT * FROM ${config.sourceTable} WHERE ${cursorCol} > ${lastCursorValue} ORDER BY ${cursorCol} ASC LIMIT ${batchSize}`)
      )

      const rows = result as unknown as any[]
      if (rows.length === 0) break

      // ใช้ mapRow ที่คุณเขียนไว้แบบ manual แปลงค่าทีละบรรทัด
      const valuesArray = rows.map((row) => {
        const mappedValues = config.mapRow(row) // จะได้ array ของคอลัมน์ที่ต้องการ
        const escapedValues = mappedValues.map(val => escapeSql(val))
        return `(${escapedValues.join(', ')})`
      })

      // ประกอบคำสั่ง INSERT INTO แบบไดนามิก
      const insertQuery = `
INSERT INTO ${config.targetTable} (${config.targetColumns.join(', ')})
VALUES
${valuesArray.join(',\n')}
ON CONFLICT (${cursorCol}) DO NOTHING;
      `.trim() + '\n\n'

      await appendFile(filePath, insertQuery, 'utf-8')

      // อัปเดตค่า Cursor เพื่อใช้วนลูปรอบถัดไป
      lastCursorValue = rows[rows.length - 1][cursorCol]
      totalMigrated += rows.length

      console.log(`  - Exported ${totalMigrated} rows... (Last ${cursorCol}: ${lastCursorValue})`)
    }
  }

  console.log(`\n🎉 Success! All customized SQL files are generated at ${targetDir}`)
}

runEngine()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Engine failed:', err)
    process.exit(1)
  })
