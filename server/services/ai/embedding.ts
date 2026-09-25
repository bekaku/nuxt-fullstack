import { embedMany } from 'ai'
import { createOllama } from 'ollama-ai-provider-v2'

interface GenerateEmbeddingsOptions {
  chunks: string[]
  baseURL?: string
  model?: string
  batchSize?: number
}

export async function generateEmbeddings({
  chunks,
  baseURL = 'http://localhost:11434/api',
  model = 'bge-m3',
  batchSize = 32
}: GenerateEmbeddingsOptions): Promise<number[][]> {

  if (!chunks.length) {
    return []
  }

  const ollama = createOllama({
    baseURL
  })

  // Large documents (e.g. 684 pages -> ~1478 chunks) overwhelm Ollama's
  // tokenizer when sent as a single embedMany call
  // (read tcp .../tokenize: read: connection reset by peer).
  // Send in small sequential batches instead.
  const allEmbeddings: number[][] = []

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)

    const { embeddings } = await embedMany({
      model: ollama.embeddingModel(model),
      values: batch
    })

    embeddings.forEach((embedding, batchIndex) => {
      if (!embedding) {
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to generate embedding for chunk ${i + batchIndex}`
        })
      }

      allEmbeddings.push(embedding as number[])
    })
  }

  return allEmbeddings
}
