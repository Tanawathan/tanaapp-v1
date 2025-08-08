import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { PromptBuilder } from '../../lib/prompt-engineering'

// 初始化OpenAI客戶端 - 只在伺服器端使用
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    // 調試：顯示 AI 原始回應
    console.log('🤖 AI 原始回應:', aiResponse)

    // 檢測預約卡片
    const reservationCard = PromptBuilder.extractReservationCard(aiResponse)
    console.log('🎫 預約卡片檢測結果:', reservationCard)
    
    // 檢測其他觸發器
    const reservationTrigger = PromptBuilder.extractReservationTrigger(aiResponse)
    const confirmationTrigger = PromptBuilder.extractConfirmationTrigger(aiResponse)

    // 清理回應：移除所有技術標記，只保留用戶可見的內容
    let cleanResponse = aiResponse
      .replace(/\[RESERVATION_CARD\][\s\S]*?\[\/RESERVATION_CARD\]/g, '') // 移除預約卡片標記
      .replace(/\[RESERVATION_TRIGGER\][\s\S]*?\[\/RESERVATION_TRIGGER\]/g, '') // 移除預約觸發器標記
      .replace(/\[CONFIRMATION_TRIGGER\][\s\S]*?\[\/CONFIRMATION_TRIGGER\]/g, '') // 移除確認觸發器標記
      .replace(/\n\s*\n/g, '\n') // 移除多餘的空行
      .trim()

    console.log('🧹 清理後的回應:', cleanResponse)

    return NextResponse.json({
      success: true,
      response: cleanResponse, // 使用清理後的回應
      reservationCard: reservationCard,
      reservationTrigger: reservationTrigger,
      confirmationTrigger: confirmationTrigger
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
