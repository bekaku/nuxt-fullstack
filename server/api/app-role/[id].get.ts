import { getRouterParam, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { ResponseEntity } from '~/types/common'
import { AppRole } from '~/types/models'
// อย่าลืม import schema และ useDb ตามโครงสร้างโปรเจกต์ของคุณ

export default defineEventHandler(async (event): Promise<ResponseEntity<AppRole>> => {

  await requirePermission(event, 'app_role_view')
  // 1. ดึงค่า ID จาก URL
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Role ID is required'
    })
  }

  const db = useDb()

  const rows = await db
      .select({
        roleId: schema.appRole.id,
        roleName: schema.appRole.name,
        roleActive: schema.appRole.active,
        permissionId: schema.rolePermission.permission, // ดึง id ของสิทธิ์มา
      })
      .from(schema.appRole)
      .leftJoin(
        schema.rolePermission,
        eq(schema.appRole.id, schema.rolePermission.appRole)
      )
      .where(eq(schema.appRole.id, BigInt(id)))

    // 2. ถ้าไม่พบข้อมูล (rows ว่างเปล่า)
    if (!rows || rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Role not found' })
    }

    // 3. แปลงข้อมูล (Mapping) กลับเป็น Object ก้อนเดียว
    const role = rows[0]
    if(!role) {
      throw createError({ statusCode: 404, statusMessage: 'Role not found' })
    }

    // ดึงเฉพาะ permissionId ที่ไม่เป็น null มาใส่ Array
    const selectedPermissions = rows
      .map(row => row.permissionId?.toString())
      .filter(Boolean) as string[] // กรองค่า null/undefined ทิ้ง

    return {
      status: 200,
      data: {
        id: role.roleId,
        name: role.roleName,
        active: role.roleActive || false,
        selectdPermissions: selectedPermissions
      }
    }
})
