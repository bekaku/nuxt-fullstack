---
name: ai-rag
description: Use when changing AI chat streaming, chat tools, document ingestion, parsing, chunking, embeddings, Qdrant vectors, or AI provider/model configuration under server/services/ai/, server/utils/ai/, server/utils/tools/, server/api/aiChat/, server/api/aiDocumentMeta/, or app/composables/useAiChat.ts.
---

# AI and RAG

Read `AGENTS.md` first. Load `nitro-backend` for endpoint edits, `drizzle-database`
for SQL/schema edits, `nuxt-frontend` for chat UI edits.

## 1. Flow A — document ingestion (admin, permission `ai_document_meta_*`)

```
UI app/pages/ai-document-meta/  → upload via fileManager → POST /api/aiDocumentMeta/ingest/:fileId
server/api/aiDocumentMeta/ingest/[id].post.ts   guard ai_document_meta_add, read file from cdnDirectory
  └─ server/services/ai/document-ingestion.ts  ingestDocument()
       1. remember existing ai_document_meta ids with the SAME fileName (replace-by-name is intended)
       2-3. document-parser.ts parseDocument(buffer, mime) (PDF, DOCX, PPTX, XLSX, text, HTML; no OCR)
       4. document-chunker.ts  chunk 1000 / overlap 200
       5. embedding.ts         Ollama embeddings, batches of 32
       6-7. server/utils/ai/qdrant.ts upsertVectors (creates collection if missing, batches of 100)
            on failure → deleteVectors() of the batches already written
       8. PG transaction: ai_document_meta + ai_document_vector_ids (batches of 500) + ai_document_metadata
            on failure → deleteVectors() of the new vectors
       9. only now: deleteIngestedDocument() for each OLD id (failure = logged duplicate, never data loss)
  └─ then deletes the uploaded source file (failure only logged)
Delete: server/api/aiDocumentMeta/[id].delete.ts → deleteIngestedDocument(id):
        Qdrant points first, then PG rows in one transaction (retry-safe), 404 if missing
```

## 2. Flow B — chat stream (user-scoped, `getAuthUser`)

```
app/composables/useAiChat.ts  DefaultChatTransport → useApi().raw('/api/aiChat/stream')
server/api/aiChat/stream.post.ts
  1. Zod body { messages, conversationId, filterNames }
  2. embed last user text (local Ollama, runtime ollamaEmbeddingModel) → Qdrant search limit 4, optional filterNames
  3. create or load ai_chat (owner = auth.sub), insert user ai_chat_messages row
  4. createUIMessageStream: writes `data-chat-id`, streams text/reasoning/sources, `data-chat-title` for new chats
  5. tools from server/utils/tools/{chart,weather,webSearch}.ts
  6. onFinish: insert assistant message
Other chat endpoints: server/api/aiChat/{index.get,[id].put}.ts, messages/[id].get.ts
```

Chat model comes from runtime config: `ollamaChatBaseUrl` (default Ollama cloud
`https://ollama.com/api`) + `ollamaChatModel` (default `gpt-oss:120b`), used by `getModel()` in
`stream.post.ts`. Embeddings use `ollamaBaseUrl` + `ollamaEmbeddingModel`.

## 3. Configuration (all in `nuxt.config.ts` runtimeConfig, overridden by `NUXT_*` env)

`ollamaBaseUrl`, `ollamaApiKey`, `ollamaEmbeddingModel` (`bge-m3`), `ollamaChatBaseUrl`, `ollamaChatModel`, `openrouterApiKey`,
`qdrantUrl`, `qdrantApiKey`, `qdrantCollectionName` (`rag_documents`),
public `acceptIngestFiles`, `limitFileUploadSize` (50 MB). Read these via
`useRuntimeConfig()`; never hardcode keys and never expose them in `public`.

## 4. Rules

1. **Auth:** ingestion/deletion keep `ai_document_meta_*` guards. Chat endpoints use
   `getAuthUser` and must filter every `ai_chat` / `ai_chat_messages` access by `createdUser = auth.sub`.
2. **Stream contract:** keep the AI SDK UI-message stream and custom parts
   (`data-chat-id`, `data-chat-title`) — `useAiChat.ts` depends on them. `ResponseEntity`
   does not apply to the stream response. Keep the client on `useApi().raw` (cookies + refresh).
3. **Separate failure domains:** file on disk, Ollama, Qdrant, and PostgreSQL cannot share a
   transaction. When you change ingestion or deletion, write down the order of writes and what
   happens if each step fails (retry must not leave orphan vectors or lose the old document silently).
4. **Vector consistency:** the embedding model for ingestion and for query must be the same, and its
   dimension must match the existing Qdrant collection. Changing the model means a new collection or re-ingest.
5. **Size limits:** keep batching for embeddings/upserts/PG inserts; large files produce thousands of chunks.
   Keep MIME allowlist and 50 MB limit before adding document types.
6. **Privacy:** do not log user questions, document text, or Qdrant payloads, and never log keys.
   `stream.post.ts` logs only hit count + scores, and only in dev (`import.meta.dev`).
7. **Tools:** new chat tools go in `server/utils/tools/<name>.ts` and are registered in the `tools`
   object of `stream.post.ts`; tools that call external APIs read keys from runtime config.

## 5. Behavior to keep

- Re-ingesting a file with the same `fileName` replaces the old document (intended), but only
  after the new one is fully stored. Keep "store new → then delete old" when changing this flow.
- Chat list/messages/update/stream all filter `ai_chat` by owner and `deleted = false`.

## 6. Done checklist

- [ ] Guards/ownership unchanged or stronger; no secrets or content in logs.
- [ ] Stream parts and `useApi().raw` transport still match the client.
- [ ] Failure/retry behavior of each store described in your report for ingestion/deletion changes.
- [ ] `pnpm typecheck` and `pnpm build`. Do **not** run `pnpm lint`.
- [ ] With local Ollama/Qdrant/PostgreSQL: ingest a small file, ask a question that hits it, check another
      user cannot read the chat, and (if changed) a provider-down failure. Otherwise list which paths were not exercised.
