import { chatWithAI, AIMessage } from '../lib/openai';
import { PromptBuilder } from '../lib/prompt-engineering';

export interface ChatResponse {
  response: string;
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

      // 8. 調用 OpenAI API - 傳遞除了系統消息外的對話歷史
      const messagesForAI = this.conversationHistory.slice(1); // 跳過系統消息
      const systemMessage = this.conversationHistory[0].content;
      const aiResponse = await chatWithAI(messagesForAI, systemMessage);

      // 9. 等待剩餘的回覆時間
      const remainingTime = Math.max(0, responseTime - 1000); // 預留1秒給API調用時間
      await this.delay(remainingTime);

      // 10. 停止「正在輸入」狀態
      if (this.typingStatusCallback) {
        this.typingStatusCallback({
          isTyping: false
        });
      }

      // 11. 添加AI回應到對話歷史
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });

      // 12. 維護對話歷史長度
      this.maintainHistoryLength();

      return {
        response: aiResponse,
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
