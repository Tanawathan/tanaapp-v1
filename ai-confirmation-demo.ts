// AI 智能確認查詢系統完整示例
import { PromptBuilder } from './app/lib/prompt-engineering';

// 模擬的 AI 響應處理器
export class AIConfirmationService {
  
  // 處理用戶查詢請求
  static async processUserQuery(userInput: string, conversationHistory: any[] = []) {
    console.log(`\n🔍 用戶查詢: "${userInput}"`);
    
    // 1. 生成上下文感知的提示詞
    const systemPrompt = PromptBuilder.buildContextualPrompt(userInput, conversationHistory);
    const isConfirmationMode = systemPrompt.includes('確認查詢專家');
    
    console.log(`📝 AI 模式: ${isConfirmationMode ? '確認查詢專家' : '一般助手'}`);
    
    // 2. 模擬 AI 響應生成
    const aiResponse = this.generateMockAIResponse(userInput, isConfirmationMode);
    console.log(`🤖 AI 回應: "${aiResponse}"`);
    
    // 3. 檢測確認查詢觸發器
    const confirmationTrigger = PromptBuilder.extractConfirmationTrigger(aiResponse);
    
    if (confirmationTrigger) {
      console.log(`🎯 檢測到確認查詢觸發器:`, confirmationTrigger);
      
      // 4. 執行相應的查詢動作
      const queryResult = await this.executeConfirmationQuery(confirmationTrigger);
      console.log(`📊 查詢結果:`, queryResult);
      
      return {
        aiResponse: aiResponse.replace(/\[CONFIRMATION_TRIGGER\][\s\S]*?\[\/CONFIRMATION_TRIGGER\]/g, ''),
        queryResult,
        action: 'confirmation_executed'
      };
    }
    
    return {
      aiResponse,
      action: 'response_only'
    };
  }
  
  // 生成模擬的 AI 回應
  static generateMockAIResponse(userInput: string, isConfirmationMode: boolean): string {
    if (!isConfirmationMode) {
      return '您好！我是阿狸，TanaAPP 的智能助手。有什麼可以為您服務的嗎？';
    }
    
    // 確認查詢模式的智能回應
    if (userInput.includes('預約') || userInput.includes('訂位')) {
      return `好的！我來為您查詢預約記錄。請提供您預約時的電話號碼。

[CONFIRMATION_TRIGGER]
action: query_reservation
customer_phone: 0971715711
[/CONFIRMATION_TRIGGER]`;
    }
    
    if (userInput.includes('訂單')) {
      return `讓我查詢您的訂單狀況...

[CONFIRMATION_TRIGGER]
action: query_order
customer_phone: 0971715711
[/CONFIRMATION_TRIGGER]`;
    }
    
    if (userInput.includes('記錄') || userInput.includes('客戶')) {
      return `我來查詢您的客戶記錄...

[CONFIRMATION_TRIGGER]
action: query_user
customer_phone: 0971715711
[/CONFIRMATION_TRIGGER]`;
    }
    
    return `好的！我來協助您進行查詢。請告訴我您需要查詢什麼資料？`;
  }
  
  // 執行確認查詢
  static async executeConfirmationQuery(trigger: any) {
    const { action, customer_phone, table_number } = trigger;
    
    try {
      let queryUrl = '';
      let params = new URLSearchParams();
      
      switch (action) {
        case 'query_reservation':
          queryUrl = '/api/confirm';
          params.append('type', 'reservation');
          params.append('phone', customer_phone);
          break;
          
        case 'query_order':
          queryUrl = '/api/confirm';
          params.append('type', 'order');
          params.append('phone', customer_phone);
          break;
          
        case 'query_user':
          queryUrl = '/api/confirm';
          params.append('type', 'user');
          params.append('phone', customer_phone);
          break;
          
        case 'query_table':
          queryUrl = '/api/confirm';
          params.append('type', 'table');
          if (table_number) params.append('table_number', table_number);
          break;
          
        default:
          throw new Error(`不支援的查詢動作: ${action}`);
      }
      
      // 模擬 API 呼叫（實際使用時會是真實的 fetch 請求）
      console.log(`🌐 API 呼叫: ${queryUrl}?${params.toString()}`);
      
      // 模擬查詢結果
      return this.mockQueryResult(action, customer_phone);
      
    } catch (error) {
      console.error('查詢執行失敗:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 模擬查詢結果
  static mockQueryResult(action: string, phone: string) {
    switch (action) {
      case 'query_reservation':
        return {
          success: true,
          data: {
            customer_name: '測試客戶',
            customer_phone: phone,
            party_size: 4,
            reservation_date: '2025-01-09',
            reservation_time: '19:00',
            status: 'confirmed',
            table_number: 5
          }
        };
        
      case 'query_order':
        return {
          success: true,
          data: [{
            order_id: 'ORD001',
            customer_phone: phone,
            total_amount: 680,
            status: 'preparing',
            items: ['泰式炒河粉', '綠咖哩雞', '芒果糯米飯']
          }]
        };
        
      case 'query_user':
        return {
          success: true,
          data: {
            customer_phone: phone,
            total_orders: 12,
            total_reservations: 5,
            last_visit: '2025-01-05'
          }
        };
        
      default:
        return { success: false, error: '未知的查詢類型' };
    }
  }
}

// 示例測試
async function runConfirmationDemo() {
  console.log('🚀 AI 智能確認查詢系統示例\n');
  
  const testQueries = [
    '我想查詢我的預約記錄',
    '確認一下我的訂單狀況',
    '檢查有沒有我的客戶記錄',
    '你好！請問有什麼推薦的菜嗎？'
  ];
  
  for (const query of testQueries) {
    await AIConfirmationService.processUserQuery(query);
    console.log('─'.repeat(50));
  }
}

// 運行示例（如果直接執行此文件）
if (require.main === module) {
  runConfirmationDemo();
}
