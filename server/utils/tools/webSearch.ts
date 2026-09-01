import { tool } from 'ai'
import { z } from 'zod'
import type { UIToolInvocation } from 'ai'

export type WebSearchUIToolInvocation = UIToolInvocation<typeof webSearchTool>
import { tavily } from '@tavily/core'


const tvly = tavily({ apiKey: process.env.NUXT_TAVILY_API_KEY })
export const webSearchTool = tool({
  description: 'Search the web for current events, news, or real-time information. (ใช้ค้นหาข้อมูลบนอินเทอร์เน็ต)',

  // 🚨 เปลี่ยนตรงนี้เป็น inputSchema ให้เหมือนไฟล์ weatherTool ของคุณ 🚨
  inputSchema: z.object({
    query: z.string().describe('The search query to look up (คำที่ต้องการค้นหา)'),
  }),

  execute: async ({ query }) => {
    console.log('🌍 AI กำลังค้นหาคำว่า:', query);
    const results = await tvly.search(query, {
      maxResults: 5,
      includeAnswer: true,
    })
    return {
      answer: results.answer,
      sources: results.results.map(r => ({
        title: r.title,
        url: r.url,
        content: r.content,
      })),

    }
  }
})
