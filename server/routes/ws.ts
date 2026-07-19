// server/routes/ws.ts

import { broadcastToTopic, removePeerAllTopics, subscribePeer } from "../utils/wsManager"

// กำหนดโครงสร้าง Type สำหรับ Request ที่จะรับมาจาก Client
interface SubscribeRequest {
  action: 'SUBSCRIBE'
  type: string
  topic: string
}

interface BroadcastRequest {
  action: 'BROADCAST'
  payload: {
    topic?: string
    [key: string]: any // อนุญาตให้มี property อื่นๆ จาก WebSocketBroadcastRequest ได้
  }
}

type WsClientRequest = SubscribeRequest | BroadcastRequest
export default defineWebSocketHandler({
  open(peer) {
    console.log(`[WS] Client Connected: ${peer.id}`)
  },

  message(peer, message) {
    try {
      const rawText = message.text()
      if (rawText === 'ping') {
        peer.send('pong')
        return
      }

      // Convert text from Client.
      const request = message.json() as WsClientRequest

      // 1. In the case of a client requesting to subscribe (join a room/follow a topic).
      if (request.action === 'SUBSCRIBE') {
        const { type, topic } = request
        if (topic) {
          // peer.subscribe(topic)
          subscribePeer(peer, topic)

          console.log(`[WS] ${peer.id} subscribed to ${topic} (Type: ${type})`)
        }
        return
      }

      // 2. When a client sends a broadcast message (chat, reaction, read, etc.).
      if (request.action === 'BROADCAST') {
        const payload = request.payload // Matches the WebSocketBroadcast interface<T>
        const { topic } = payload

        if (topic) {
          // Spread the message to everyone who subscribed to this topic (except the sender).
          // peer.publish(topic, JSON.stringify(payload))

          // Optional: To have the sender's side receive confirmation as well, send it back to the peer.
          // peer.send(JSON.stringify(payload))
          broadcastToTopic(topic, payload)
        }
      }
    } catch (error) {
      console.error('[WS] Invalid JSON payload:', error)
    }
  },

  close(peer) {
    removePeerAllTopics(peer)
    console.log(`[WS] Client Disconnected: ${peer.id}`)
  },
  error(peer, error) {
    console.error(`[WS] Error on peer ${peer.id}:`, error)
  }
})
