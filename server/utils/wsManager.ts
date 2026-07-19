import type { Peer } from 'crossws'

// เก็บข้อมูลว่า Topic ไหน มี Peer (Client) ไหน Subscribe อยู่บ้าง
const topicSubscribers = new Map<string, Set<Peer>>()

export const subscribePeer = (peer: Peer, topic: string) => {
  if (!topicSubscribers.has(topic)) {
    topicSubscribers.set(topic, new Set())
  }
  topicSubscribers.get(topic)!.add(peer)
}

// ลบ Peer ออกจากทุก Topic เมื่อ Disconnect
export const removePeerAllTopics = (peer: Peer) => {
  for (const [topic, peers] of topicSubscribers.entries()) {
    peers.delete(peer)
    // ถ้าไม่มีใครอยู่ใน Topic นี้แล้ว ให้ลบทิ้งเพื่อคืน Memory
    if (peers.size === 0) {
      topicSubscribers.delete(topic)
    }
  }
}

// ฟังก์ชันสำหรับเรียกใช้จากฝั่ง API เพื่อส่งข้อความ
export const broadcastToTopic = (topic: string, message: any) => {
  const payload = typeof message === 'string' ? message : JSON.stringify(message)
  const peers = topicSubscribers.get(topic)

  if (peers) {
    for (const peer of peers) {
      peer.send(payload)
    }
  }
}
