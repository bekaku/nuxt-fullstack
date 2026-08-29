import { schema, useDb } from '#server/database/client'
import { and, count, eq } from 'drizzle-orm'
import { ApiResponse, ResponseEntity } from "~/types/common"
import { AiChat, AiChatMessage } from "~/types/models"
import { paginate } from '~~/server/utils/dbPaging'

export default defineEventHandler(async (event): Promise<ResponseEntity<ApiResponse<AiChatMessage>>> => {

  console.log('api/aiChat/index.get')
  const auth = getAuthUser(event)
  if (!auth) {
    // เปลี่ยนจาก 403 เป็น 401 (Unauthenticated) เพื่อความถูกต้องทาง Semantic
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized.' })
  }

  const id = validateID(event)
  const db = useDb()

  // 1. [เพิ่มใหม่] ตรวจสอบสิทธิ์ว่า User ปัจจุบันเป็นเจ้าของแชทนี้หรือไม่
  const [chat] = await db
    .select({ id: schema.aiChat.id })
    .from(schema.aiChat)
    .where(
      and(
        eq(schema.aiChat.id, BigInt(id)),
        eq(schema.aiChat.createdUser, BigInt(auth.sub)) // เงื่อนไขสำคัญ! ต้องเป็นของ auth.sub เท่านั้น
      )
    )
    .limit(1)

  if (!chat) {
    // ถ้าไม่เจอ (คือไม่มีแชท หรือมีแชทแต่ไม่ใช่ของตัวเอง) ให้โยน 403 Forbidden
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: You do not have permission to access this chat.'
    })
  }

  // 2. ถ้าผ่านการเช็คสิทธิ์แล้ว ค่อยมาดึงข้อมูลข้อความ (โค้ดเดิมของคุณ)
  const dataQuery = db
    .select({
      id: schema.aiChatMessage.id,
      aiRole: schema.aiChatMessage.role,
      createdDate: schema.aiChatMessage.createdDate,
      content: schema.aiChatMessage.content,
    })
    .from(schema.aiChatMessage)
    .$dynamic()

  const countQuery = db
    .select({ value: count() })
    .from(schema.aiChatMessage)
    .$dynamic()

  const data = await paginate(event, {
    dataQuery,
    countQuery,
    columns: {
      id: schema.aiChatMessage.id,
    },
    where: and(
      eq(schema.aiChatMessage.aiChat, BigInt(id)),
    ),
    defaultSort: schema.aiChatMessage.id,
    defaultSortDirection: 'desc'
  })

  return {
    status: 200,
    data
  }
})
