import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// 初始化OpenAI客戶端 - 只在伺服器端使用
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json()

    // 構建完整的消息陣列
    const fullMessages = []
    
    if (systemPrompt) {
      fullMessages.push({
        role: 'system',
        content: systemPrompt
      })
    }
    
    fullMessages.push(...messages)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: fullMessages,
      max_tokens: 200,
      temperature: 0.7,
    })

    const aiResponse = response.choices[0]?.message?.content || '抱歉，我現在無法回應 😅'

    return NextResponse.json({
      success: true,
      response: aiResponse
    })

  } catch (error) {
    console.error('OpenAI API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: '處理請求時發生錯誤',
      response: '抱歉，我現在有點忙，請稍後再試 😅'
    }, { status: 500 })
  }
}
