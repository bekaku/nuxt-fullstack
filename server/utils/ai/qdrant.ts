import { QdrantClient } from '@qdrant/js-client-rest'

interface QdrantConfig {
  qdrantUrl: string
  qdrantApiKey?: string
  qdrantCollectionName: string
}

interface UpsertVectorInput {
  id: string
  vector: number[]
  payload: Record<string, unknown>
}

function createQdrantClient(config: QdrantConfig) {
  return new QdrantClient({
    url: config.qdrantUrl,
    apiKey: config.qdrantApiKey,
    checkCompatibility: false,
  })
}

/**
 * ฟังก์ชันตรวจสอบและสร้าง Collection อัตโนมัติหากยังไม่มี
 */
export async function ensureCollection(
  qdrant: QdrantClient,
  collectionName: string,
  vectorSize: number,
) {
  // 1. ตรวจสอบว่า Collection มีอยู่แล้วหรือไม่
  const existsResult = await qdrant.collectionExists(collectionName)

  if (!existsResult.exists) {
    // 2. ถ้ายังไม่มี ให้สร้างขึ้นมาใหม่
    await qdrant.createCollection(collectionName, {
      vectors: {
        size: vectorSize, // ขนาด dimension ของเวกเตอร์ เช่น 768, 1536
        distance: 'Cosine', // เลือกระหว่าง 'Cosine' | 'Euclid' | 'Dot'
      },
    })
  }
}

export async function upsertVectors(
  config: QdrantConfig,
  points: UpsertVectorInput[],
  batchSize = 100
) {
  if (!points.length) {
    return
  }

  const qdrant = createQdrantClient(config)

  // ดึง vector size จาก point แรกที่ส่งเข้ามาเพื่อใช้ตรวจสอบ/สร้าง
  const vectorSize = points[0]?.vector?.length

  if (!vectorSize) {
    throw new Error('Invalid vector data: unable to determine vector size.')
  }

  // สร้าง Collection อัตโนมัติถ้ายังไม่มี
  await ensureCollection(qdrant, config.qdrantCollectionName, vectorSize)

  // ไฟล์หน้าเยอะๆ (เช่น 684 หน้า -> ~1478 points, payload ~13MB JSON)
  // ส่งทีเดียวเสี่ยง timeout / payload ใหญ่เกิน ให้แบ่ง batch
  for (let i = 0; i < points.length; i += batchSize) {
    const batch = points.slice(i, i + batchSize)

    await qdrant.upsert(
      config.qdrantCollectionName,
      {
        wait: true,
        points: batch
      }
    )
  }
}

export async function deleteVectors(
  config: QdrantConfig,
  vectorIds: string[],
) {
  if (!vectorIds.length) {
    return
  }

  const qdrant = createQdrantClient(config)

  await qdrant.delete(
    config.qdrantCollectionName,
    {
      wait: true,
      points: vectorIds,
    },
  )
}
