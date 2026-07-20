import { ResponseEntity } from "~/types/common";
import { broadcastToTopic } from "../utils/wsManager";
export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {
  const body = await readBody(event)
  const topicName = body.topic

  const savedMessage = {
    id: '123',
    text: body.text,
    senderId: body.senderId,
    createdAt: new Date().toISOString()
  }
  const broadcastPayload = {
    socketType: 'CHAT_MESSAGE',
    topic: topicName,
    data: savedMessage
  }

  broadcastToTopic(topicName, broadcastPayload)
  return {
    status: 200,
  }
})
