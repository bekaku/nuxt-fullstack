import { schema, useDb } from "~~/server/database/client"
import type { UIMessage } from 'ai'
import { z } from 'zod'
import { and, desc, eq } from 'drizzle-orm'
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, generateText, isStepCount, smoothStream, streamText, toUIMessageStream } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOllama } from 'ollama-ai-provider-v2';


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

  const config = useRuntimeConfig()
  const openrouter = createOpenRouter({
    apiKey: config.openrouterApiKey,
  });
  const ollama = createOllama({
    // optional settings, e.g.
    // baseURL: 'http://localhost:11434/api',
    baseURL: 'https://ollama.com/api',
    headers: {
      Authorization: `Bearer ${config.ollamaApiKey || process.env.OLLAMA_API_KEY}`,
    },
  });

  const getModel = () => {
    // return openrouter.chat('minimax/minimax-m3:free');
    // return ollama('ornith-1.5:9b');
    return ollama('gemma4:31b');
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
    // memmoryMessages คงค่าจาก client ไว้ (ถูกต้องอยู่แล้ว มีคำถามล่าสุดครบ)
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
          instructions: `You are a title generator for a chat.
Generate a short title based on the first user's message.
The title should be less than 30 characters long.
Do not use quotes or punctuation.
Do not use markdown.
Return plain text only.`,
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


      const result = streamText({
        abortSignal: abortController.signal,
        model: getModel(),
        instructions: `You are a knowledgeable and helpful AI assistant. ${auth.sub ? `The user's name is ${auth.sub}.` : ''} Your goal is to provide clear, accurate, and well-structured responses.
**WEB SEARCH:**
- You have access to a web search tool to find current, up-to-date information
- Only use it when the user explicitly asks about recent events, real-time data, or current facts
- Do NOT search proactively — rely on your knowledge first
- Cite your sources when providing information from web search results

**RESPONSE QUALITY:**
- Be concise yet comprehensive
- Use examples when helpful
- Break down complex topics into digestible parts
- Maintain a friendly, professional tone`,
        messages: await convertToModelMessages(memmoryMessages),
        tools: {},
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
