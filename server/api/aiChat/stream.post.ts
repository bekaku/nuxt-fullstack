import { schema, useDb } from "~~/server/database/client"
import type { UIMessage } from 'ai'
import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, embed, generateText, isStepCount, smoothStream, streamText, tool, toUIMessageStream } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOllama } from 'ollama-ai-provider-v2';
import { chartTool } from "~~/server/utils/tools/chart"
import { weatherTool } from "~~/server/utils/tools/weather"
import { webSearchTool } from "~~/server/utils/tools/webSearch"
import { QdrantClient } from '@qdrant/js-client-rest'
import { buildChatSystemPrompt, SYSTEM_PROMPTS } from "~~/server/utils/prompts"

const bodySchema = z.object({
  id: z.string().nullish(),
  messages: z.array(z.any()).min(1, 'Messages is required'),
  trigger: z.string().nullish(),
  conversationId: z.string().nullish(),
  filterNames: z.array(z.string()).nullish(),
})


export default defineEventHandler(async (event) => {
  const auth = getAuthUser(event)
  if (!auth) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized.' })
  }

  const { qdrantUrl, qdrantApiKey, openrouterApiKey, ollamaBaseUrl, ollamaApiKey, ollamaEmbeddingModel, qdrantCollectionName } = useRuntimeConfig()



  const qdrant = new QdrantClient({
    url: qdrantUrl,
    apiKey: qdrantApiKey,
    checkCompatibility: false,
  })
  const openrouter = createOpenRouter({
    apiKey: openrouterApiKey,
  });
  const ollamaLacal = createOllama({
    baseURL: ollamaBaseUrl || process.env.NUXT_OLLAMA_BASE_URL,
  });
  const ollama = createOllama({
    // baseURL:  config.ollamaBaseUrl || 'http://localhost:11434/api',
    baseURL: 'https://ollama.com/api',// cloud usage
    headers: {
      Authorization: `Bearer ${ollamaApiKey || process.env.NUXT_OLLAMA_API_KEY}`,
    },
  });

  const getModel = () => {
    // return openrouter.chat('inclusionai/ling-3.0-flash-fin:free');
    return ollama('gpt-oss:120b');
    //local
    // return ollama('ornith-1.5:9b');
  }


  const db = useDb()

  const body = await readValidatedBody(event, bodySchema.parse)
  const { messages, conversationId, filterNames } = body

  let chatId;
  // client ส่ง full history มาให้แล้ว ใช้เป็นค่าตั้งต้น (จะถูกแทนที่ถ้าเป็นแชทเดิมที่มีประวัติใน DB)
  let memmoryMessages: UIMessage[] = messages as UIMessage[];
  let isNew = false;

  // ดึงข้อความล่าสุดของ user ออกมา (ใช้สำหรับ title generation และบันทึกลง DB)
  const lastUserMessage = [...memmoryMessages].reverse().find(m => m.role === 'user')
  // @ts-ignore
  const lastUserText = lastUserMessage?.parts?.find((p: any) => p.type === 'text')?.text ?? ''


  // ==========================================
  // 🔍 3. ทำ Qdrant Vector Search (RAG)
  // ==========================================
  let ragContext = ""
  if (lastUserText) {
    try {
      // 3.1 แปลงคำถามล่าสุดเป็น Vector ด้วย bge-m3 ผ่าน Ollama
      const { embedding } = await embed({
        model: ollamaLacal.embeddingModel(ollamaEmbeddingModel || 'bge-m3'),
        value: lastUserText,
      })

      // 3.2 กรองด้วย filterNames (ถ้า client ส่งมา)
      let filterCondition: any = undefined
      if (filterNames && filterNames.length > 0) {
        filterCondition = {
          should: filterNames.map(name => ({
            key: 'fileName', // หรือฟิลด์ metadata ที่คุณเก็บไว้ใน Qdrant
            match: { value: name }
          }))
        }
      }

      // 3.3 ค้นหา Vectors ที่ใกล้เคียงที่สุดจาก Qdrant
      const searchResults = await qdrant.query(qdrantCollectionName, {
        query: embedding,           // ส่ง vector array เข้าไปที่ query
        limit: 4,
        filter: filterCondition,
        with_payload: true,
      })

      // ==========================================
      // 🛠️ DEBUG ZONE
      // ==========================================
      const points = searchResults?.points ?? []
      console.log(`\n🔍 [Qdrant RAG Debug] ---------------------------------`)
      console.log(`- Query Text: "${lastUserText}"`)
      console.log(`- Total Hits: ${points.length} documents`)

      if (points.length === 0) {
        console.log(`⚠️ No documents matched. Check filters or collection data.`)
      } else {
        points.forEach((point: any, index: number) => {
          console.log(`\n  [Doc #${index + 1}] ID: ${point.id} | Score: ${point.score?.toFixed(4)}`)
          console.log(`  Payload preview:`, JSON.stringify(point.payload, null, 2))
        })
      }
      console.log(`------------------------------------------------------\n`)

      if (searchResults?.points?.length) {
        ragContext = searchResults.points
          .map((res: any, i: number) => {
            const content = res.payload?.doc_content || res.payload?.content || res.payload?.text || ''
            const fileName = res.payload?.fileName ? ` [File: ${res.payload.fileName}]` : ''
            return `[Source ${i + 1}${fileName}]:\n${content}`
          })
          .join('\n\n---\n\n')
      }
    } catch (error) {
      console.error('Qdrant Search Error:', error)
    }
  }



  if (!conversationId) {
    isNew = true;
    const [chat] = await db
      .insert(schema.aiChat)
      .values({
        title: 'New Chat',
        pin: false,
        createdUser: BigInt(auth.sub),
        updatedUser: BigInt(auth.sub)
      })
      .returning()

    if (!chat) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to create chat.' })
    }

    chatId = chat.id
  } else {
    isNew = false;
    chatId = conversationId;

    // เช็คความเป็นเจ้าของ
    const [record] = await db
      .select({ id: schema.aiChat.id })
      .from(schema.aiChat)
      .where(and(
        eq(schema.aiChat.id, BigInt(chatId)),
        eq(schema.aiChat.createdUser, BigInt(auth.sub))
      ))
      .limit(1)

    if (!record) {
      throw createError({ statusCode: 404, statusMessage: 'Data not found' })
    }

    // อัปเดตเวลาใช้งานล่าสุด
    await db.update(schema.aiChat).set({
      updatedDate: new Date(),
    }).where(eq(schema.aiChat.id, BigInt(chatId)))

    // ดึงประวัติ โดยเรียงจากใหม่ไปเก่า แล้วเอามา Reverse ให้เรียงตามลำดับเวลาคุยจริง
    const memeories = await db
      .select({
        id: schema.aiChatMessage.id,
        aiRole: schema.aiChatMessage.role,
        createdDate: schema.aiChatMessage.createdDate,
        content: schema.aiChatMessage.content,
      })
      .from(schema.aiChatMessage)
      .where(eq(schema.aiChatMessage.aiChat, BigInt(chatId)))
      .orderBy(desc(schema.aiChatMessage.createdDate))
      .limit(15)

    memmoryMessages = memeories.reverse().map((m) => ({
      id: m.id.toString(),
      role: m.aiRole.toLowerCase() as 'user' | 'assistant' | 'system',
      parts: [{ type: 'text', text: m.content }],
    }))

    memmoryMessages.push({
      id: Date.now().toString(),
      role: 'user',
      parts: [{ type: 'text', text: lastUserText }]
    })
  }

  // บันทึกคำถามของ User ลง DB
  await db.insert(schema.aiChatMessage).values({
    aiChat: BigInt(chatId),
    role: 'user',
    content: lastUserText
  });

  const abortController = new AbortController()
  event.node.req.on('close', () => abortController.abort())

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {

      let titleTask: Promise<void> | undefined
      if (isNew) {
        writer.write({
          type: 'data-chat-id',
          data: { message: chatId.toString() }
        });

        titleTask = generateText({
          model: getModel(),
          instructions: SYSTEM_PROMPTS.CHAT_TITLE_GENERATOR,
          prompt: lastUserText
        })
          .then(async ({ text }) => {
            const title = text.trim()

            await db.update(schema.aiChat)
              .set({ title })
              .where(eq(schema.aiChat.id, BigInt(chatId)))

            // ส่ง title ไป frontend
            writer.write({
              type: 'data-chat-title',
              data: {
                message: title
              }
            })
          })
          .catch(error => {
            console.error('Failed to generate title:', error)
          })
      }

      const systemPrompt = buildChatSystemPrompt({
        userName: auth?.sub,
        ragContext: ragContext
      })
      const result = streamText({
        abortSignal: abortController.signal,
        model: getModel(),
        instructions: systemPrompt,
        messages: await convertToModelMessages(memmoryMessages),
        tools: {
          chart: chartTool,
          weather: weatherTool,
          // webSearch: webSearchTool,
        },
        providerOptions: {
          ollama: {
            think: true
          },
          // anthropic: {
          //   thinking: {
          //     type: 'enabled',
          //     budgetTokens: 2048
          //   }
          // } satisfies AnthropicLanguageModelOptions,
          // google: {
          //   thinkingConfig: {
          //     includeThoughts: true,
          //     thinkingLevel: 'low'
          //   }
          // } satisfies GoogleLanguageModelOptions,
          // openai: {
          //   reasoningEffort: 'low',
          //   reasoningSummary: 'detailed'
          // } satisfies OpenAILanguageModelResponsesOptions
        },
        stopWhen: isStepCount(5),
        experimental_transform: smoothStream(),
        // onChunk({ chunk }) {
        //   if (chunk.type === 'text-delta') {
        //     console.log('\n\n', chunk.text);
        //   }
        // },
        // onFinish({ text }) {
        //   console.log('\n\n=== AI STREAM FINISHED ===');
        //   console.log(text);
        //   console.log('==========================\n');
        //   if (text.includes('<think>')) {
        //     console.log('✅ Found <think> tags in the response!');
        //   } else {
        //     console.log('❌ No <think> tags generated by this model.');
        //   }
        // }
      })
      await writer.merge(toUIMessageStream({
        stream: result.stream,
        sendSources: true,
        sendReasoning: true
      }))


      if (titleTask) {
        await titleTask
      }
    },
    onEnd: async ({ responseMessage }) => {
      if (!responseMessage || !responseMessage.parts) return;

      const aiTextContent = responseMessage.parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('\n');

      if (!aiTextContent) return;

      try {
        await db.insert(schema.aiChatMessage).values({
          aiChat: BigInt(chatId),
          role: 'assistant',
          content: aiTextContent
        });
      } catch (error) {
        console.error('Failed to save AI message to DB:', error);
      }
    }
  })

  return createUIMessageStreamResponse({ stream })
})
