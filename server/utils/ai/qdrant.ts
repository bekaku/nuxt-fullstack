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

export async function upsertVectors(
  config: QdrantConfig,
  points: UpsertVectorInput[],
) {
  if (!points.length) {
    return
  }

  const qdrant = createQdrantClient(config)

  await qdrant.upsert(
    config.qdrantCollectionName,
    {
      wait: true,
      points,
    },
  )
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
