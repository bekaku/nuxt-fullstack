import { readValidatedBody, createError } from 'h3'
import { eq, and, ne } from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { z } from 'zod'
import { ResponseEntity } from '~/types/common'
import { Permission } from '~/types/models'

// ใช้ z.enum() เพื่อ Validate ค่าให้ตรงกับ Type PermissionType
const bodySchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, 'Code is required'),
  description: z.string().nullable().optional(),
  module: z.string().nullable().optional(),
  operationType: z.enum(['CRUD', 'REPORT', 'OTHER', 'FEATURE']).optional(),
})

export default defineEventHandler(async (event): Promise<ResponseEntity<Permission>> => {

  await requireAnyPermission(event, ['permission_add', 'permission_edit'])

  const body = await readValidatedBody(event, bodySchema.parse)
  //test

   return {
      status: 200,
      data: body
    }

  // const { id, code, module, description, operationType } = body

  // const db = useDb()

  // try {
  //   const result = await db.transaction(async (tx) => {

  //     // 1. เช็ค code ซ้ำ (เหมือนตอนเช็ค name ของ Role)
  //     const codeCheckConditions = id
  //       ? and(eq(schema.permission.code, code), ne(schema.permission.id, BigInt(id)))
  //       : eq(schema.permission.code, code);

  //     const existingPermission = await tx.query.permission.findFirst({
  //       where: codeCheckConditions,
  //       columns: { id: true }
  //     });

  //     if (existingPermission) {
  //       throw createError({
  //         statusCode: 400,
  //         statusMessage: 'Permission code already exists'
  //       })
  //     }

  //     let currentPermissionId: bigint | null;

  //     // 2. บันทึกข้อมูล
  //     if (id) {
  //       // Mode: Update
  //       currentPermissionId = BigInt(id);
  //       await tx
  //         .update(schema.permission)
  //         .set({
  //           code,
  //           module,
  //           description,
  //           operationType
  //         })
  //         .where(eq(schema.permission.id, currentPermissionId));

  //     } else {
  //       // Mode: Insert
  //       const [newPermission] = await tx
  //         .insert(schema.permission)
  //         .values({
  //           code,
  //           module,
  //           description,
  //           operationType
  //         })
  //         .returning({ id: schema.permission.id });

  //       currentPermissionId = newPermission ? newPermission.id : null;
  //     }

  //     return {
  //       id: currentPermissionId?.toString() as string,
  //       code,
  //       module,
  //       description,
  //       operationType: operationType as any // แคสต์ให้ตรงกับ Type ใน Interface
  //     };
  //   })

  //   return {
  //     status: 200,
  //     data: result
  //   }

  // } catch (error: any) {
  //   if (error.statusCode) throw error;

  //   throw createError({
  //     statusCode: 500,
  //     statusMessage: error.message || 'Internal Server Error'
  //   })
  // }
})
