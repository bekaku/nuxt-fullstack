import { broadcastToTopic } from "../utils/wsManager";
export default defineEventHandler(async (event) => {
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
  return { success: true }
})
