import { chatWithAI, functionCallAI, detectScenario, AVAILABLE_FUNCTIONS, AIMessage } from './openai'

export interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  scenario?: string
}

export class AIService {
  private conversationHistory: AIMessage[] = []
  private currentScenario: string = 'chat'

  /**
   * 處理用戶訊息 - 智能選擇AI模型
   */
  async processMessage(userInput: string): Promise<{
    response: string
    scenario: string
    shouldSwitchScene?: boolean
    suggestedSceneId?: string
    functionCall?: any
  }> {
    // 智能場景識別和回應邏輯
    try {
      // 分析用戶輸入，提供智能回應
      let response = ''
      let scenario = 'chat'
      let shouldSwitchScene = false
      let suggestedSceneId = ''

      const input = userInput.toLowerCase().trim()

      // 首先檢查是否為明確的服務請求
      // 點餐相關 - 更精確的意圖識別
      if (input.includes('我想點') || input.includes('我要點') || input.includes('我想吃') || 
          input.includes('我要吃') || input.includes('點菜') || input.includes('點餐') ||
          input.includes('看菜單') || input.includes('有什麼菜') || input.includes('推薦菜')) {
        response = '看起來您想要點餐呢！🍜 我來為您推薦一些美味的泰式料理，或者您可以直接告訴我想吃什麼～'
        scenario = 'order'
        shouldSwitchScene = true
        suggestedSceneId = 'menu-ordering'
      }
      // 訂位相關 - 明確的訂位意圖
      else if (input.includes('我要訂位') || input.includes('我想訂位') || input.includes('預約') || 
               input.includes('訂桌') || input.includes('預訂') || input.includes('定位') ||
               input.includes('桌位') || input.includes('用餐時間')) {
        response = '好的！我來幫您預約桌位 📅 請告訴我您希望的用餐日期、時間和人數～'
        scenario = 'reservation'
        shouldSwitchScene = true
        suggestedSceneId = 'table-booking'
      }
      // 優惠相關
      else if (input.includes('優惠') || input.includes('活動') || input.includes('折扣') || 
               input.includes('促銷') || input.includes('特價') || input.includes('便宜')) {
        response = '我來為您介紹最新的優惠活動！🎉 讓您享受更多實惠的泰式美食～'
        scenario = 'promotion'
        shouldSwitchScene = true
        suggestedSceneId = 'event-promotions'
      }
      // 購物車相關
      else if (input.includes('購物車') || input.includes('我的訂單') || input.includes('結帳') || 
               input.includes('付款') || input.includes('確認訂單')) {
        response = '讓我幫您查看購物車內容 � 您可以在這裡確認訂單並完成結帳～'
        scenario = 'cart'
        shouldSwitchScene = false // 購物車通常通過按鈕訪問
      }
      // 問候回應
      else if (input.includes('你好') || input.includes('哈囉') || input.includes('嗨') || 
               input.includes('您好') || input.includes('早安') || input.includes('午安') || input.includes('晚安')) {
        response = '您好！我是阿狸，很高興為您服務 🏮✨ 今天想要來點什麼泰式美食呢？'
      }
      // 幫助相關
      else if (input.includes('幫助') || input.includes('說明') || input.includes('怎麼') || 
               input.includes('如何') || input.includes('功能') || input.includes('可以做什麼')) {
        response = '我可以幫您點餐🍜、預約桌位📅、查看優惠活動🎉！您想要做什麼呢？'
      }
      // 自我介紹或閒聊
      else if (input.includes('我是') || input.includes('我叫') || input.includes('你是誰') || 
               input.includes('認識') || input.includes('介紹')) {
        response = `很高興認識您！我是阿狸，您的泰式料理小助手 🦊 我可以為您推薦美食、協助訂位，讓您享受最棒的用餐體驗！有什麼需要幫忙的嗎？`
      }
      // 默認回應 - 不強制切換場景
      else {
        response = `我明白您說的是「${userInput}」💭 作為您的泰式料理助手，我可以幫您點餐、訂位，還可以介紹我們的特色菜喔！有什麼需要的嗎？ 🌶️✨`
      }

      // 記錄對話歷史
      this.conversationHistory.push(
        { role: 'user', content: userInput },
        { role: 'assistant', content: response }
      )

      // 保持歷史長度
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-8)
      }

      this.currentScenario = scenario

      return {
        response,
        scenario,
        shouldSwitchScene,
        suggestedSceneId,
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      return {
        response: `我是A-Li！您說：「${userInput}」，我正在學習如何更好地回應您 🤖✨`,
        scenario: 'chat'
      }
    }
  }

  /**
   * 根據場景獲取系統提示詞
   */
  private getScenarioSystemPrompt(scenario: string): string {
    const basePrompt = `你是A-Li，TanaAPP泰式餐廳的AI助手 🏮✨

個性特點：
- 熱情友善，對泰式料理充滿熱忱 🌶️
- 使用繁體中文，說話輕鬆活潑
- 適時使用emoji增加親和力
- 專業但不失溫度`

    const scenarioPrompts = {
      chat: `${basePrompt}

當前模式：一般對話
- 回答用戶關於餐廳、菜品的問題
- 提供建議和推薦
- 保持對話輕鬆愉快
- 回答控制在50字以內`,

      order: `${basePrompt}

當前模式：點餐服務 🍜
- 協助用戶點餐和加入購物車
- 詢問數量、特殊需求等細節
- 確認訂單資訊
- 引導完成點餐流程`,

      reservation: `${basePrompt}

當前模式：訂位服務 📅
- 協助用戶進行訂位預約
- 收集日期、時間、人數等資訊
- 確認預約詳情
- 提供預約確認`,

      tracking: `${basePrompt}

當前模式：訂單追蹤 📦
- 協助查詢訂單狀態
- 提供訂單更新資訊
- 處理訂單相關問題`,

      promotion: `${basePrompt}

當前模式：優惠活動 🎉
- 介紹當前優惠活動
- 說明使用條件和期限
- 協助套用優惠`,

      support: `${basePrompt}

當前模式：客服支援 💬
- 回答常見問題
- 提供服務協助
- 處理客戶疑問`
    }

    return scenarioPrompts[scenario as keyof typeof scenarioPrompts] || scenarioPrompts.chat
  }

  /**
   * 處理函式呼叫結果
   */
  async handleFunctionCall(functionCall: any, additionalData?: any): Promise<string> {
    try {
      switch (functionCall.name) {
        case 'addToCart':
          return await this.handleAddToCart(functionCall.arguments, additionalData)
        
        case 'makeReservation':
          return await this.handleMakeReservation(functionCall.arguments)
        
        case 'checkOrderStatus':
          return await this.handleCheckOrderStatus(functionCall.arguments)
        
        default:
          return '抱歉，我不知道如何處理這個請求 😅'
      }
    } catch (error) {
      console.error('Function call error:', error)
      return '處理請求時發生錯誤，請重新嘗試 🙏'
    }
  }

  /**
   * 處理加入購物車
   */
  private async handleAddToCart(args: any, cartData?: any): Promise<string> {
    // 這裡會與購物車系統整合
    console.log('Adding to cart:', args)
    
    const items = args.items || []
    const itemNames = items.map((item: any) => item.name).join('、')
    
    return `好的！我已經幫您將${itemNames}加入購物車了 🛒✨ 還需要其他的嗎？`
  }

  /**
   * 處理訂位預約
   */
  private async handleMakeReservation(args: any): Promise<string> {
    // 這裡會與訂位系統整合
    console.log('Making reservation:', args)
    
    const { date, time, guests, name } = args
    
    return `完成！我已經為${name}先生/小姐預約了${date} ${time}，${guests}位的桌位 📅✨ 
    
請準時到達，期待您的光臨！🙏`
  }

  /**
   * 處理訂單查詢
   */
  private async handleCheckOrderStatus(args: any): Promise<string> {
    // 這裡會與訂單系統整合
    console.log('Checking order status:', args)
    
    return `您的訂單 ${args.orderId} 目前正在製作中 👨‍🍳 預計15分鐘後完成，請耐心等候 ⏰`
  }

  /**
   * 清除對話歷史
   */
  clearHistory(): void {
    this.conversationHistory = []
    this.currentScenario = 'chat'
  }

  /**
   * 獲取當前場景
   */
  getCurrentScenario(): string {
    return this.currentScenario
  }

  /**
   * 手動設置場景
   */
  setScenario(scenario: string): void {
    this.currentScenario = scenario
  }
}

// 單例模式，全局共享同一個AI服務實例
export const aiService = new AIService()

export default AIService
