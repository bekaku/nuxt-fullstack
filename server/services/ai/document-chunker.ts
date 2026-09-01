export function splitTextIntoChunks(
  text: string,
  chunkSize = 1000,
  overlap = 200,
): string[] {

  if (chunkSize <= 0) {
    throw new Error('chunkSize must be greater than 0')
  }

  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error('overlap must be >= 0 and smaller than chunkSize')
  }

  const cleanText = text
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleanText) {
    return []
  }

  const chunks: string[] = []

  let i = 0

  while (i < cleanText.length) {
    chunks.push(
      cleanText.slice(i, i + chunkSize),
    )

    i += chunkSize - overlap
  }

  return chunks
}
