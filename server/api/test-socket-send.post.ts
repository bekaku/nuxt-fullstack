import { z } from "zod";
import type { ResponseEntity } from "~/types/common";
import { broadcastToTopic } from "../utils/wsManager";

const bodySchema = z.object({
  topic: z.string().trim().min(1).max(255),
  text: z.string().max(5000),
});

/** Demo endpoint for app/pages/example/websocket.vue: broadcast a message to a WS topic (login required). */
export default defineEventHandler(async (event): Promise<ResponseEntity<void>> => {
  const auth = getAuthUser(event)
  const body = await readValidatedBody(event, bodySchema.parse)
  const topicName = body.topic

  const savedMessage = {
    id: '123',
    text: body.text,
    senderId: auth.sub, // from the session, not the request body (prevents sender spoofing)
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
