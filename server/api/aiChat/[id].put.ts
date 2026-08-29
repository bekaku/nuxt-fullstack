import { readValidatedBody, createError } from 'h3'
import { eq ,and} from 'drizzle-orm'
import { schema, useDb } from '~~/server/database/client'
import { z } from 'zod'
import { ResponseEntity } from '~/types/common'
import { AiChat } from '~/types/models'

const bodySchema = z.object({
  id: z.string().nullish(), // ไม่จำเป็นถ้า ID รับมาจาก URL param แต่คงไว้ไม่เสียหาย
  title: z.string().min(1, 'Title is required'), // แก้ typo
  pin: z.boolean().nullish(),
})

export default defineEventHandler(async (event): Promise<ResponseEntity<AiChat>> => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 403, statusMessage: 'Unauthorized.' }) // 401 เหมาะสมกว่าสำหรับ Unauthenticated
  }

  const id = validateID(event)
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = useDb()

  try {
    // 1. ตรวจสอบว่ามี record นี้อยู่จริงหรือไม่
    const [record] = await db
      .select({
        id: schema.aiChat.id,
      })
      .from(schema.aiChat)
      .where(and(
        eq(schema.aiChat.id, BigInt(id)),
        eq(schema.aiChat.createdUser, BigInt(auth.sub))
      ))
      .limit(1)

    if (!record) {
      throw createError({ statusCode: 404, statusMessage: 'Data not found' })
    }

    // 2. ทำการอัปเดต และใช้ .returning() เพื่อรับค่าที่ถูกอัปเดตกลับมา
    const [updatedRecord] = await db
      .update(schema.aiChat)
      .set({
        title: body.title,
        ...(body.pin !== null && body.pin !== undefined && { pin: body.pin }), // อัปเดตเฉพาะตอนที่มีค่าส่งมา
        updatedUser: BigInt(auth.sub)
      })
      .where(eq(schema.aiChat.id, BigInt(id)))
      .returning(); // Drizzle PG รองรับการคืนค่าข้อมูลที่พึ่งแก้

    // 3. ส่ง response กลับไป
    return {
      status: 200,
      data: updatedRecord as unknown as AiChat // แคสต์ Type ให้ตรงกับ ResponseEntity<AiChat>
    }

  } catch (error: any) {
    // ถ้าเป็น Error ที่เราโยนไว้เอง (เช่น 401, 404) ให้โยนต่อไปเลย
    if (error.statusCode) throw error;

    // ถ้าเป็น Error จากระบบ (เช่น DB พัง) ให้ครอบด้วย 500
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error'
    })
  }
})
