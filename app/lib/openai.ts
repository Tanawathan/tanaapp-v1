// AI對話類型
export type AIConversationType = 'chat' | 'function'

// 通用AI對話介面
export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// 結構化輸出介面
export interface StructuredOutput {
  action: string
  parameters: Record<string, any>
  confidence: number
}

// 完整 AI 回應介面
export interface AIResponseData {
  response: string
  reservationCard?: any
  reservationTrigger?: any
  confirmationTrigger?: any
}

/**
 * 一般對話問答 - 通過 API 路由調用 OpenAI
 */
export async function chatWithAI(
  messages: AIMessage[],
  systemPrompt?: string
): Promise<AIResponseData> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemPrompt
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success) {
      return {
        response: data.response,
        reservationCard: data.reservationCard,
        reservationTrigger: data.reservationTrigger,
        confirmationTrigger: data.confirmationTrigger
      }
    } else {
      console.error('API Error:', data.error)
      return {
        response: data.response || '抱歉，我現在無法回應 😅'
      }
    }

  } catch (error) {
    console.error('Chat AI Error:', error)
    return {
      response: '抱歉，我現在無法回應 😅'
    }
  }
}

/**
 * 結構化輸出和函式呼叫 - 暫時使用對話模式
 */
export async function functionCallAI(
  messages: AIMessage[],
  availableFunctions: any[],
  systemPrompt?: string
): Promise<{
  response: string
  functionCall?: {
    name: string
    arguments: any
  }
}> {
  try {
    // 目前簡化為對話模式，後續可擴展為函式調用
    const aiResponseData = await chatWithAI(messages, systemPrompt)
    
    return {
      response: aiResponseData.response,
      functionCall: undefined // 暫時不支持函式調用
    }
  } catch (error) {
    console.error('Function AI Error:', error)
    return {
      response: '抱歉，處理請求時發生錯誤，請重新嘗試 😅'
    }
  }
}

/**
 * 智能場景識別 - 使用對話模式判斷場景
 */
export async function detectScenario(userInput: string): Promise<{
  needsFunction: boolean
  scenario: string
  confidence: number
}> {
  try {
    const analysisPrompt = `分析以下用戶輸入，判斷是否需要執行系統功能：

輸入: "${userInput}"

請判斷這是否涉及：
1. 點餐/加入購物車
2. 訂位/預約
3. 查看訂單狀態
4. 修改/取消訂單或訂位

回應格式：
{
  "needsFunction": boolean,
  "scenario": "chat|order|reservation|tracking",
  "confidence": number (0-1)
}`

    const result = await chatWithAI([
      { role: 'user', content: analysisPrompt }
    ], '你是一個場景分析器，專門判斷用戶意圖。請只回傳JSON格式的結果。')

    try {
      const parsed = JSON.parse(result.response)
      return {
        needsFunction: parsed.needsFunction || false,
        scenario: parsed.scenario || 'chat',
        confidence: parsed.confidence || 0.5
      }
    } catch (parseError) {
      console.warn('Failed to parse scenario detection result:', parseError)
    }

  } catch (error) {
    console.error('Scenario Detection Error:', error)
  }

  // 預設為簡單對話
  return {
    needsFunction: false,
    scenario: 'chat',
    confidence: 0.5
  }
}

/**
 * 定義可用的函式 - 使用OpenAI新的函式調用格式
 */
export const AVAILABLE_FUNCTIONS = [
  {
    name: 'addToCart',
    description: '將菜品添加到購物車',
    parameters: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', description: '產品ID' },
              name: { type: 'string', description: '產品名稱' },
              quantity: { type: 'number', description: '數量' },
              price: { type: 'number', description: '單價' },
              notes: { type: 'string', description: '特殊要求' }
            },
            required: ['productId', 'name', 'quantity', 'price']
          }
        }
      },
      required: ['items']
    }
  },
  {
    name: 'makeReservation',
    description: '創建餐廳訂位',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: '預約日期 (YYYY-MM-DD)' },
        time: { type: 'string', description: '預約時間 (HH:MM)' },
        guests: { type: 'number', description: '用餐人數' },
        name: { type: 'string', description: '預約姓名' },
        phone: { type: 'string', description: '聯絡電話' },
        notes: { type: 'string', description: '特殊需求' }
      },
      required: ['date', 'time', 'guests', 'name', 'phone']
    }
  },
  {
    name: 'checkOrderStatus',
    description: '查詢訂單狀態',
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'string', description: '訂單編號' }
      },
      required: ['orderId']
    }
  }
]
