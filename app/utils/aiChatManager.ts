import { chatWithAI, AIMessage, AIResponseData } from '../lib/openai';
import { posInterpret, posExecute, summarizeActionResult, getPosMeta } from '../lib/posAiBridge';
import { PromptBuilder } from '../lib/prompt-engineering';
import { ReservationTriggerParser, ReservationIntentDetector } from '../lib/reservation-trigger-parser';
import { RestaurantReservationManager } from '../lib/reservation-manager';

export interface ChatResponse {
  response: string;
  reservationCard?: any;
  functionCall?: {
    name: string;
    arguments: any;
  };
}

export interface ReadStatus {
  isRead: boolean;
  readAt?: Date;
}

export interface TypingStatus {
  isTyping: boolean;
  estimatedTime?: number;
}

export class AIChatManager {
  private conversationHistory: AIMessage[] = [];
  private maxHistoryLength = 10; // 保持最近10輪對話
  private databaseContext: any = null;
  private readStatusCallback?: (status: ReadStatus) => void;
  private typingStatusCallback?: (status: TypingStatus) => void;
  private lastPendingAction: { action: string; args: any } | null = null;

  constructor() {
    // 初始化基礎系統提示 - 使用動態提示詞生成器
    this.initializeSystemPrompt();
    this.loadDatabaseContext();
  }

  /**
   * 設定已讀狀態回調
   */
  setReadStatusCallback(callback: (status: ReadStatus) => void) {
    this.readStatusCallback = callback;
  }

  /**
   * 設定打字狀態回調
   */
  setTypingStatusCallback(callback: (status: TypingStatus) => void) {
    this.typingStatusCallback = callback;
  }

  /**
   * 初始化系統提示詞
   */
  private async initializeSystemPrompt() {
    const systemPrompt = PromptBuilder.buildSystemPrompt('general');
    this.conversationHistory = [{
      role: 'system',
      content: systemPrompt
    }];
  }

  /**
   * 載入資料庫上下文
   */
  private async loadDatabaseContext() {
    try {
      // 只在瀏覽器環境中調用 API
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/database?action=overview');
        const data = await response.json();
        if (data.success) {
          this.databaseContext = data.data;
        }
      } else {
        // 服務器端渲染時使用靜態數據
        this.databaseContext = {
          overview: {
            restaurants: { count: 2 },
            categories: { count: 9 },
            products: { count: 58 },
            orders: { count: 52 },
            order_items: { count: 90 },
            reservations: { count: 0 },
            tables: { count: 8 }
          },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Failed to load database context:', error);
    }
  }

  /**
   * 計算基於字數的閱讀和回覆延遲時間
   * @param text 要處理的文字
   * @returns 延遲時間（毫秒）
   */
  private calculateReadingDelay(text: string): number {
    const charCount = text.length;
    const baseReadingSpeed = 50; // 每秒閱讀50個字符
    const baseDelay = Math.max(1000, (charCount / baseReadingSpeed) * 1000); // 最少1秒
    
    // 添加隨機波動 (0.5x - 1.5x)
    const randomFactor = 0.5 + Math.random();
    const finalDelay = Math.min(baseDelay * randomFactor, 8000); // 最多8秒
    
    return Math.round(finalDelay);
  }

  /**
   * 計算回覆延遲時間
   * @param userInput 用戶輸入
   * @returns 延遲時間（毫秒）
   */
  private calculateResponseDelay(userInput: string): number {
    const charCount = userInput.length;
    const baseResponseTime = 30; // 每秒處理30個字符
    const baseDelay = Math.max(800, (charCount / baseResponseTime) * 1000); // 最少0.8秒
    
    // 添加隨機波動和思考時間
    const thinkingTime = 500 + Math.random() * 2000; // 0.5-2.5秒思考時間
    const randomFactor = 0.7 + Math.random() * 0.6; // 0.7x - 1.3x
    
    const finalDelay = Math.min(baseDelay * randomFactor + thinkingTime, 10000); // 最多10秒
    return Math.round(finalDelay);
  }

  /**
   * 延遲函數
   * @param ms 延遲毫秒數
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 處理用戶輸入（帶有已讀狀態和延遲）
   */
  async processUserMessage(userInput: string): Promise<ChatResponse> {
    try {
      // 1. 立即顯示「已讀」狀態（隨機延遲0-3秒）
      const readDelay = Math.random() * 3000; // 0-3秒隨機延遲
      await this.delay(readDelay);
      
      if (this.readStatusCallback) {
        this.readStatusCallback({
          isRead: true,
          readAt: new Date()
        });
      }

      // 2. 計算閱讀時間並顯示「正在輸入」狀態
      const readingTime = this.calculateReadingDelay(userInput);
      await this.delay(readingTime);

      // 3. 開始顯示「正在輸入」狀態
      const responseTime = this.calculateResponseDelay(userInput);
      if (this.typingStatusCallback) {
        this.typingStatusCallback({
          isTyping: true,
          estimatedTime: responseTime
        });
      }

      // 4. 重新載入最新的資料庫狀態
      await this.loadDatabaseContext();

      // 5. 動態生成針對此次對話的系統提示詞
      const contextualPrompt = PromptBuilder.buildContextualPrompt(
        userInput,
        this.conversationHistory,
        this.databaseContext
      );

      // 6. 更新系統提示詞
      this.conversationHistory[0] = {
        role: 'system',
        content: contextualPrompt
      };

      // 7. 添加用戶消息到對話歷史
      this.conversationHistory.push({
        role: 'user',
        content: userInput
      });

      // 若使用者輸入確認 token，直接嘗試執行暫存動作
      if (/^CONFIRM-[A-Z_]+$/.test(userInput.trim()) && this.lastPendingAction) {
        try {
          const token = userInput.trim();
          const pending = this.lastPendingAction;
          const execRes: any = await posExecute(pending.action, pending.args, token);
          this.lastPendingAction = null;
          const resp = summarizeActionResult(pending.action, execRes);
          // 插入回答並維護歷史後直接返回
          this.conversationHistory.push({ role: 'assistant', content: resp });
          this.maintainHistoryLength();
          if (this.typingStatusCallback) this.typingStatusCallback({ isTyping: false });
          return { response: resp };
        } catch (e) {
          const msg = (e as any)?.message || '執行失敗';
          return { response: `❌ 確認後執行失敗: ${msg}` };
        }
      }

      // 8. 優先呼叫 POS AI 進行動作解讀與可能執行
      let aiResponseData: AIResponseData = { response: '' }
      let actionHandled = false
      try {
        const posMeta = await getPosMeta() // warm meta (optional)
        const interpreted = await posInterpret(userInput)
        if (interpreted && interpreted.action && interpreted.action !== 'unknown') {
          // 若需要確認的動作，先提供確認 token 提示
            if (posMeta && posMeta.confirmRequired.includes(interpreted.action)) {
              this.lastPendingAction = { action: interpreted.action, args: interpreted.arguments };
              aiResponseData.response = `⚠️ 準備執行動作: ${interpreted.action}\n請輸入: CONFIRM-${interpreted.action.toUpperCase()} 以確認。`;
            } else {
              // 直接執行
              const execRes: any = await posExecute(interpreted.action, interpreted.arguments)
              aiResponseData.response = summarizeActionResult(interpreted.action, execRes)
            }
          actionHandled = true
        } else if (interpreted && interpreted.action === 'clarify') {
          // 提供指引，列出支援動作
          const supported = posMeta ? posMeta.whitelist.filter(a=>a!=='clarify' && a!=='unknown').join(', ') : ''
          aiResponseData.response = `我可以協助的 POS 動作包含：${supported}。請用自然語句，例如："幫我 8/20 晚上 18:30 訂四位" 或 "查 8/20 四人有哪些時段"。`
          actionHandled = true
        }
      } catch (e) {
        console.warn('POS AI integration skipped:', (e as any)?.message)
      }

      if (!actionHandled) {
        // Fallback Path: If POS AI didn't handle and we detect reservation intent, attempt lightweight local reservation flow
        try {
          const hasReservationIntent = ReservationIntentDetector.detectReservationIntent(userInput)
          if (hasReservationIntent) {
            const parsed = RestaurantReservationManager.parseReservationIntent(userInput)
            const validation = RestaurantReservationManager.validateReservationData(parsed)
            if (validation.isValid) {
              const createRes = await RestaurantReservationManager.createReservation(parsed as any)
              if (createRes.success) {
                const confirmMsg = RestaurantReservationManager.generateConfirmationMessage(
                  parsed as any,
                  createRes.reservationId || 'TEMP',
                  '系統自動安排'
                )
                aiResponseData = { response: confirmMsg }
                actionHandled = true
              } else {
                aiResponseData = { response: `❌ 預約建立失敗：${createRes.error || '未知錯誤'}` }
                actionHandled = true
              }
            } else {
              // Ask user for missing fields succinctly
              const missingList = validation.missing.join('、')
              aiResponseData = { response: `請提供以下預約資訊：${missingList}。格式舉例：「我是王小明 0912345678 明天 18:30 4人」` }
              actionHandled = true
            }
          }
        } catch (e) {
          console.warn('Fallback reservation flow error:', (e as any)?.message)
        }
      }

      if (!actionHandled) {
        // 回退到原本 OpenAI 對話
        const messagesForAI = this.conversationHistory.slice(1); // 跳過系統消息
        const systemMessage = this.conversationHistory[0].content;
        aiResponseData = await chatWithAI(messagesForAI, systemMessage);
      }

      // 9. 檢查是否有預約卡片
      let reservationCard = null;
      if (aiResponseData.reservationCard) {
        console.log('🎫 檢測到預約卡片:', aiResponseData.reservationCard);
        reservationCard = aiResponseData.reservationCard;
      }

      // 10. 處理餐廳預約觸發器（傳統流程）
      let cleanAIResponse = aiResponseData.response;
      let reservationResults = [];
      
      const reservationTriggers = ReservationTriggerParser.parseReservationTriggers(cleanAIResponse);
      
      if (reservationTriggers.length > 0) {
        console.log(`🏮 檢測到預約觸發器: ${reservationTriggers.length}個`);
        
        try {
          const processingResult = await ReservationTriggerParser.processReservationTriggers(reservationTriggers);
          reservationResults = processingResult.results;
          
          if (processingResult.success) {
            console.log('✅ 預約處理成功');
            // 添加成功訊息
            const successMessage = ReservationTriggerParser.generateSuccessResponse(reservationResults);
            if (successMessage) {
              cleanAIResponse += successMessage;
            }
          } else {
            console.error('❌ 預約處理失敗:', processingResult.errors);
            // 添加錯誤訊息
            const errorMessage = ReservationTriggerParser.generateErrorResponse(processingResult.errors);
            if (errorMessage) {
              cleanAIResponse += errorMessage;
            }
          }
          
        } catch (error) {
          console.error('預約觸發器處理異常:', error);
          cleanAIResponse += `\n\n❌ 預約處理遇到問題，請稍後再試或直接致電餐廳預約。`;
        }
        
        // 清理預約標記
        cleanAIResponse = ReservationTriggerParser.cleanResponse(cleanAIResponse);
      }

      // 10. 等待剩餘的回覆時間
      const remainingTime = Math.max(0, responseTime - 1000); // 預留1秒給API調用時間
      await this.delay(remainingTime);

      // 11. 停止「正在輸入」狀態
      if (this.typingStatusCallback) {
        this.typingStatusCallback({
          isTyping: false
        });
      }

      // 12. 添加清理後的AI回應到對話歷史
      this.conversationHistory.push({
        role: 'assistant',
        content: cleanAIResponse
      });

      // 12. 維護對話歷史長度
      this.maintainHistoryLength();

      return {
        response: cleanAIResponse,
        reservationCard: reservationCard,
        functionCall: undefined // 暫時不支援函數調用
      };

    } catch (error) {
      console.error('AI Chat Manager Error:', error);
      
      // 停止「正在輸入」狀態
      if (this.typingStatusCallback) {
        this.typingStatusCallback({
          isTyping: false
        });
      }

      return {
        response: '抱歉，我現在有點忙，請稍後再試 😅'
      };
    }
  }

  /**
   * 獲取對話歷史
   */
  getConversationHistory(): AIMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * 清除對話歷史（保留系統提示）
   */
  clearConversation(): void {
    const systemMessage = this.conversationHistory[0];
    this.conversationHistory = [systemMessage];
  }

  /**
   * 添加上下文信息（如菜單、訂位資訊等）
   */
  addContextMessage(context: string): void {
    this.conversationHistory.push({
      role: 'system',
      content: `上下文資訊：${context}`
    });
    this.maintainHistoryLength();
  }

  /**
   * 維護對話歷史長度
   */
  private maintainHistoryLength(): void {
    if (this.conversationHistory.length > this.maxHistoryLength + 1) { // +1 for system message
      // 保留系統消息和最近的對話
      const systemMessage = this.conversationHistory[0];
      const recentMessages = this.conversationHistory.slice(-this.maxHistoryLength);
      this.conversationHistory = [systemMessage, ...recentMessages];
    }
  }

  /**
   * 重置對話管理器
   */
  reset(): void {
    this.clearConversation();
  }
}

// 導出單例實例
export const aiChatManager = new AIChatManager();
