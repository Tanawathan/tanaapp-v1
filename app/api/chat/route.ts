import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { PromptBuilder } from '../../lib/prompt-engineering'

// 判斷是否有 OpenAI 金鑰
const hasApiKey = !!process.env.OPENAI_API_KEY
// 只有有金鑰時才初始化，否則保持 null（用 heuristic fallback）
const openai: OpenAI | null = hasApiKey
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// 預約關鍵字（離線模式判斷用）
const RESERVATION_KEYWORDS = ['訂位', '預約', '訂桌', '桌位', '座位', '想訂', '想預約']

/**
 * 建立 heuristic 預約卡片（無金鑰時使用）
 */
function buildHeuristicReservationCard(userText: string) {
  const extracted = PromptBuilder.extractContextualInfo(userText)
  const hasIntent = RESERVATION_KEYWORDS.some(k => userText.includes(k))
  if (!hasIntent) return { visible: null, raw: null }
  const card = `[RESERVATION_CARD]\naction: show_reservation_form\ntitle: 快速預約表單\ndescription: 請填寫以下資訊完成預約\nprefill: {"customer_name":"${extracted.customer_name || ''}","customer_phone":"${extracted.customer_phone || ''}","party_size":"${extracted.party_size || ''}","reservation_date":"${extracted.reservation_date || ''}","reservation_time":"${extracted.reservation_time || ''}","special_requests":"${extracted.special_requests || ''}"}\nrequired_fields: [customer_name, customer_phone, party_size, reservation_date, reservation_time]\n[/RESERVATION_CARD]`
  const visible = '我已為您準備預約表單，請補齊必要資訊（姓名 / 電話 / 人數 / 日期 / 時間）後送出喔！'
  return { visible, raw: card }
}

/**
 * 無金鑰時的簡易回覆
 */
function buildHeuristicReply(fullMessages: any[]) {
  const lastUser = [...fullMessages].reverse().find(m => m.role === 'user')?.content || ''
  const reservation = buildHeuristicReservationCard(lastUser)
  if (reservation.raw) {
    return reservation.visible + '\n\n' + reservation.raw
  }
  const trimmed = lastUser.slice(0, 80)
  if (!trimmed) {
    return '您好！目前為離線（模擬）模式，請輸入需求，我會盡力協助。'
  }
  return `（離線模式）您剛提到：「${trimmed}」\n設定 OPENAI_API_KEY 後即可啟用完整智能對話。`
}

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json()

    // 構建完整的消息陣列
    const fullMessages: any[] = []
    if (systemPrompt) {
      fullMessages.push({ role: 'system', content: systemPrompt })
    }
    fullMessages.push(...messages)

    let aiResponse: string
    if (!hasApiKey) {
      // 無金鑰：使用 heuristic 模式
      aiResponse = buildHeuristicReply(fullMessages)
    } else {
      const response = await openai!.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: fullMessages,
        max_tokens: 200,
        temperature: 0.7,
      })
      aiResponse = response.choices[0]?.message?.content || '抱歉，我現在無法回應 😅'
    }

    console.log('🤖 AI 原始回應:', aiResponse)

    // 檢測預約卡片
    const reservationCard = PromptBuilder.extractReservationCard(aiResponse)
    console.log('🎫 預約卡片檢測結果:', reservationCard)
    // 檢測觸發器
    const reservationTrigger = PromptBuilder.extractReservationTrigger(aiResponse)
    const confirmationTrigger = PromptBuilder.extractConfirmationTrigger(aiResponse)

    // 清理顯示文本（移除標記）
    let cleanResponse = aiResponse
      .replace(/\[RESERVATION_CARD\][\s\S]*?\[\/RESERVATION_CARD\]/g, '')
      .replace(/\[RESERVATION_TRIGGER\][\s\S]*?\[\/RESERVATION_TRIGGER\]/g, '')
      .replace(/\[CONFIRMATION_TRIGGER\][\s\S]*?\[\/CONFIRMATION_TRIGGER\]/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim()

    console.log('🧹 清理後的回應:', cleanResponse)

    return NextResponse.json({
      success: true,
      response: cleanResponse,
      reservationCard: reservationCard,
      reservationTrigger: reservationTrigger,
      confirmationTrigger: confirmationTrigger,
      offline: !hasApiKey
    })
  } catch (error) {
    console.error('OpenAI API Error:', error)

    if (!hasApiKey) {
      // 金鑰缺失情況下任何錯誤：回離線模式
      const fallback = buildHeuristicReply([])
      return NextResponse.json({
        success: true,
        response: fallback,
        reservationCard: null,
        reservationTrigger: null,
        confirmationTrigger: null,
        offline: true,
        note: 'OPENAI_API_KEY 未設定（fallback）'
      })
    }

    return NextResponse.json({
      success: false,
      error: '處理請求時發生錯誤',
      response: '抱歉，我現在有點忙，請稍後再試 😅'
    }, { status: 500 })
  }
}
