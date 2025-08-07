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
  private contextData: any = {} // 儲存對話上下文數據

  /**
   * 處理用戶訊息 - 使用OpenAI API進行智能處理
   */
  async processMessage(userInput: string): Promise<{
    response: string
    scenario: string
    shouldSwitchScene?: boolean
    suggestedSceneId?: string
    functionCall?: any
    contextData?: any
  }> {
    try {
      // 構建系統提示詞，包含當前場景上下文
      const systemPrompt = this.buildSystemPrompt()
      
      // 準備對話歷史
      const messages: AIMessage[] = [
        { role: 'system', content: systemPrompt },
        ...this.conversationHistory,
        { role: 'user', content: userInput }
      ]

      // 使用 OpenAI 進行意圖識別和回應生成
      const aiResponse = await chatWithAI(messages)
      
      // 分析AI回應，判斷是否需要切換場景
      const sceneAnalysis = await this.analyzeSceneIntent(userInput, aiResponse)
      
      // 更新對話歷史
      this.conversationHistory.push(
        { role: 'user', content: userInput },
        { role: 'assistant', content: aiResponse }
      )

      // 保持歷史長度在合理範圍
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-16)
      }

      // 更新當前場景
      if (sceneAnalysis.shouldSwitchScene) {
        this.currentScenario = sceneAnalysis.suggestedSceneId || 'chat'
      }

      return {
        response: aiResponse,
        scenario: this.currentScenario,
        shouldSwitchScene: sceneAnalysis.shouldSwitchScene,
        suggestedSceneId: sceneAnalysis.suggestedSceneId,
        contextData: this.contextData
      }

    } catch (error) {
      console.error('AI Service Error:', error)
      return {
        response: '抱歉，我現在有點忙碌，請稍後再試 😅 或者您可以重新描述一下您的需求？',
        scenario: this.currentScenario
      }
    }
  }

  /**
   * 構建系統提示詞 - 根據當前場景和上下文
   */
  private buildSystemPrompt(): string {
    const basePrompt = `你是阿狸(A-Li)，TanaAPP泰式餐廳的AI助手 🏮✨

核心特質：
- 熱情友善，對泰式料理充滿熱忱 🌶️
- 使用繁體中文，說話輕鬆活潑但專業
- 善於理解用戶意圖，提供個人化服務
- 可以處理點餐、訂位、查詢等多種任務

當前場景：${this.currentScenario}
場景上下文：${JSON.stringify(this.contextData)}

重要指令：
1. 如果用戶想要點餐，切換到 "menu-ordering" 場景，並引導用戶瀏覽菜單
2. 如果用戶想要訂位，切換到 "table-booking" 場景，收集訂位資訊（日期、時間、人數、特殊需求）
3. 如果用戶詢問優惠，切換到 "event-promotions" 場景
4. 保持對話的連續性，記住之前討論的內容
5. 在場景切換時，明確告知用戶並解釋接下來的流程

場景切換指示：
- 在回應中如果需要切換場景，請在回應末尾加上：[SCENE_SWITCH: 場景ID]
- 場景ID選項：menu-ordering, table-booking, event-promotions, shopping-cart, chat

回應要求：控制在100字以內，親切自然。`

    return basePrompt
  }

  /**
   * 分析場景意圖 - 使用OpenAI判斷是否需要切換場景
   */
  private async analyzeSceneIntent(userInput: string, aiResponse: string): Promise<{
    shouldSwitchScene: boolean
    suggestedSceneId?: string
  }> {
    try {
      // 檢查AI回應中是否包含場景切換指示
      const sceneMatch = aiResponse.match(/\[SCENE_SWITCH:\s*([^\]]+)\]/)
      if (sceneMatch) {
        const suggestedSceneId = sceneMatch[1].trim()
        return {
          shouldSwitchScene: true,
          suggestedSceneId
        }
      }

      // 備用方案：使用OpenAI分析用戶意圖
      const intentAnalysisPrompt = `
分析以下用戶輸入的意圖，判斷是否需要切換場景：

用戶輸入："${userInput}"
當前場景：${this.currentScenario}

請回答 JSON 格式：
{
  "shouldSwitchScene": boolean,
  "suggestedSceneId": "場景ID或null",
  "confidence": 0-1之間的數字,
  "reason": "判斷原因"
}

場景選項：
- menu-ordering: 點餐相關
- table-booking: 訂位相關  
- event-promotions: 優惠查詢
- shopping-cart: 購物車操作
- chat: 一般對話
`

      const analysisResult = await chatWithAI([
        { role: 'user', content: intentAnalysisPrompt }
      ])

      try {
        const parsed = JSON.parse(analysisResult)
        if (parsed.confidence > 0.7) {
          return {
            shouldSwitchScene: parsed.shouldSwitchScene,
            suggestedSceneId: parsed.suggestedSceneId
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse intent analysis result:', parseError)
      }

      return { shouldSwitchScene: false }

    } catch (error) {
      console.error('Scene intent analysis error:', error)
      return { shouldSwitchScene: false }
    }
  }

  /**
   * 設置當前場景
   */
  setScenario(scenario: string) {
    this.currentScenario = scenario
  }

  /**
   * 獲取當前場景
   */
  getCurrentScenario(): string {
    return this.currentScenario
  }

  /**
   * 更新上下文數據
   */
  updateContext(key: string, value: any) {
    this.contextData[key] = value
  }

  /**
   * 獲取上下文數據
   */
  getContext(key?: string): any {
    return key ? this.contextData[key] : this.contextData
  }

  /**
   * 清除對話歷史
   */
  clearHistory() {
    this.conversationHistory = []
    this.contextData = {}
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
- 主動引導用戶使用服務功能`,

      'menu-ordering': `${basePrompt}

當前模式：點餐服務 🍜
- 協助用戶瀏覽菜單和點餐
- 詢問數量、辣度、特殊需求等細節
- 推薦熱門菜品和搭配
- 引導完成點餐並加入購物車
- 記住用戶的偏好和過敏資訊`,

      'table-booking': `${basePrompt}

當前模式：訂位服務 📅
- 協助用戶進行訂位預約
- 收集：日期、時間、人數、聯絡方式
- 詢問特殊需求（嬰兒椅、輪椅通道等）
- 確認預約詳情並提供確認號`,

      'event-promotions': `${basePrompt}

當前模式：優惠活動 🎉  
- 介紹當前優惠活動和促銷方案
- 說明使用條件和期限
- 協助套用優惠碼
- 推薦划算的組合方案`,

      'shopping-cart': `${basePrompt}

當前模式：購物車管理 🛒
- 協助查看和修改購物車內容
- 處理結帳流程
- 確認訂單資訊和配送方式
- 處理付款相關問題`
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
  private async handleAddToCart(args: any, additionalData?: any): Promise<string> {
    // 實現加入購物車邏輯
    const { itemId, quantity = 1, customizations = {} } = args
    
    this.updateContext('lastAddedItem', { itemId, quantity, customizations })
    
    return `已將商品加入購物車！數量：${quantity} 🛒`
  }

  /**
   * 處理訂位請求
   */
  private async handleMakeReservation(args: any): Promise<string> {
    // 實現訂位邏輯
    const { date, time, partySize, contactInfo, specialRequests } = args
    
    this.updateContext('reservation', { date, time, partySize, contactInfo, specialRequests })
    
    return `訂位請求已收到！日期：${date}，時間：${time}，人數：${partySize} 📅`
  }

  /**
   * 處理訂單狀態查詢
   */
  private async handleCheckOrderStatus(args: any): Promise<string> {
    // 實現訂單狀態查詢邏輯
    const { orderId } = args
    
    return `正在為您查詢訂單 ${orderId} 的狀態... 📦`
  }
}

// 導出單例實例
export const aiService = new AIService()
