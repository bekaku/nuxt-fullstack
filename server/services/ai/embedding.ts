import { embedMany } from 'ai'
import { createOllama } from 'ollama-ai-provider-v2'

interface GenerateEmbeddingsOptions {
  chunks: string[]
  baseURL?: string
  model?: string
}

export async function generateEmbeddings({
  chunks,
  baseURL = 'http://localhost:11434/api',
  model = 'bge-m3',
}: GenerateEmbeddingsOptions): Promise<number[][]> {

  if (!chunks.length) {
    return []
  }

  const ollama = createOllama({
    baseURL,
  })

  const { embeddings } = await embedMany({
    model: ollama.embeddingModel(model),
    values: chunks,
  })

  return embeddings.map((embedding, index) => {
    if (!embedding) {
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to generate embedding for chunk ${index}`,
      })
    }

    return embedding as number[]
  })
}
