// 餐廳預約觸發解析器 - 與 AI 對話系統整合
import { RestaurantReservationManager, ReservationData } from './reservation-manager';

export interface ReservationTriggerData {
  type: 'reservation_create' | 'reservation_check' | 'reservation_modify';
  action: string;
  data: ReservationData;
  confidence: 'high' | 'medium' | 'low';
  timestamp: string;
}

/**
 * 預約觸發解析器
 */
export class ReservationTriggerParser {
  
  /**
   * 解析AI回覆中的預約觸發標記
   */
  static parseReservationTriggers(aiResponse: string): ReservationTriggerData[] {
    const triggers: ReservationTriggerData[] = [];
    
    // 解析 [RESERVATION_TRIGGER] 標記
    const reservationRegex = /\[RESERVATION_TRIGGER\]([\s\S]*?)\[\/RESERVATION_TRIGGER\]/g;
    let match;
    
    while ((match = reservationRegex.exec(aiResponse)) !== null) {
      try {
        const content = match[1].trim();
        const trigger = this.parseReservationContent(content);
        if (trigger) {
          triggers.push(trigger);
        }
      } catch (error) {
        console.warn('預約觸發器解析失敗:', error);
      }
    }
    
    return triggers;
  }
  
  /**
   * 解析預約觸發內容
   */
  private static parseReservationContent(content: string): ReservationTriggerData | null {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);
    const result: any = {};
    
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        result[key.trim()] = value;
      }
    }
    
    // 驗證必要欄位
    if (!result.action || !result.customer_name || !result.customer_phone || 
        !result.party_size || !result.reservation_date || !result.reservation_time) {
      console.warn('預約觸發器缺少必要欄位:', result);
      return null;
    }
    
    const reservationData: ReservationData = {
      customerName: result.customer_name,
      customerPhone: result.customer_phone,
      partySize: parseInt(result.party_size),
      reservationDate: result.reservation_date,
      reservationTime: result.reservation_time,
      specialRequests: result.special_requests || '',
      restaurantId: result.restaurant_id || 'default'
    };
    
    return {
      type: 'reservation_create',
      action: result.action,
      data: reservationData,
      confidence: 'high',
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 處理預約觸發器
   */
  static async processReservationTriggers(triggers: ReservationTriggerData[]): Promise<{
    success: boolean;
    results: any[];
    errors: string[];
  }> {
    const results = [];
    const errors = [];
    
    for (const trigger of triggers) {
      try {
        console.log(`🏮 處理預約觸發器: ${trigger.action}`);
        
        switch (trigger.action) {
          case 'create_reservation':
            const createResult = await RestaurantReservationManager.createReservation(trigger.data);
            results.push({
              trigger: trigger.action,
              success: createResult.success,
              reservationId: createResult.reservationId,
              error: createResult.error,
              data: trigger.data
            });
            
            if (!createResult.success) {
              errors.push(createResult.error || '預約創建失敗');
            }
            break;
            
          default:
            console.warn(`未知的預約操作: ${trigger.action}`);
            errors.push(`未支援的預約操作: ${trigger.action}`);
        }
      } catch (error) {
        console.error(`預約觸發器處理失敗 [${trigger.action}]:`, error);
        errors.push(`${trigger.action}: ${error instanceof Error ? error.message : '未知錯誤'}`);
      }
    }
    
    return {
      success: errors.length === 0,
      results,
      errors
    };
  }
  
  /**
   * 清理AI回應中的預約標記
   */
  static cleanResponse(aiResponse: string): string {
    return aiResponse
      .replace(/\[RESERVATION_TRIGGER\][\s\S]*?\[\/RESERVATION_TRIGGER\]/g, '')
      .replace(/\n\n+/g, '\n\n')
      .trim();
  }
  
  /**
   * 生成預約成功的回應訊息
   */
  static generateSuccessResponse(results: any[]): string {
    if (results.length === 0) return '';
    
    const successfulReservations = results.filter(r => r.success);
    if (successfulReservations.length === 0) return '';
    
    const reservation = successfulReservations[0];
    const data = reservation.data;
    
    const date = new Date(data.reservationDate);
    const dateStr = date.toLocaleDateString('zh-TW', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
    
    return `

✅ 預約成功確認！

📋 預約詳情
• 預約編號：${reservation.reservationId}
• 顧客姓名：${data.customerName}
• 聯絡電話：${data.customerPhone}
• 用餐日期：${dateStr}
• 用餐時間：${data.reservationTime}
• 用餐人數：${data.partySize}人
${data.specialRequests ? `• 特殊需求：${data.specialRequests}` : ''}

📞 如需更改或取消預約，請致電餐廳
⏰ 請準時到達，預約保留15分鐘

感謝您選擇TanaAPP泰式餐廳！🏮✨`;
  }
  
  /**
   * 生成預約失敗的回應訊息
   */
  static generateErrorResponse(errors: string[]): string {
    if (errors.length === 0) return '';
    
    return `

❌ 預約處理遇到問題：

${errors.map(error => `• ${error}`).join('\n')}

請檢查預約資訊或選擇其他時間，我會很樂意為您重新安排！`;
  }
}

/**
 * 預約意圖檢測器
 */
export class ReservationIntentDetector {
  
  private static readonly RESERVATION_KEYWORDS = [
    '訂位', '預約', '訂桌', '座位', '桌子', '用餐時間', 
    '明天', '今天', '後天', '晚上', '中午', '人用餐',
    '預定', '安排', '桌位', '位子', '幾點', '時間'
  ];
  
  /**
   * 檢測用戶訊息是否包含預約意圖
   */
  static detectReservationIntent(userMessage: string): boolean {
    const message = userMessage.toLowerCase();
    return this.RESERVATION_KEYWORDS.some(keyword => 
      message.includes(keyword)
    );
  }
  
  /**
   * 計算預約意圖的信心分數
   */
  static calculateConfidence(userMessage: string): number {
    const message = userMessage.toLowerCase();
    const matchingKeywords = this.RESERVATION_KEYWORDS.filter(keyword => 
      message.includes(keyword)
    );
    
    let score = matchingKeywords.length * 0.2;
    
    // 額外加分項目
    if (/\d+\s*[個位人]/.test(message)) score += 0.3; // 包含人數
    if (/\d{1,2}[:點]\d{0,2}/.test(message)) score += 0.3; // 包含時間
    if (/(今天|明天|後天|\d+[月日])/.test(message)) score += 0.3; // 包含日期
    if (/(訂位|預約|預定)/.test(message)) score += 0.4; // 明確預約詞彙
    
    return Math.min(score, 1.0);
  }
  
  /**
   * 提供預約對話的建議回應
   */
  static suggestReservationResponse(userMessage: string, parsedData: any): string {
    const missing = [];
    
    if (!parsedData.reservationDate) missing.push('用餐日期');
    if (!parsedData.reservationTime) missing.push('用餐時間');
    if (!parsedData.partySize) missing.push('用餐人數');
    if (!parsedData.customerName) missing.push('姓名');
    if (!parsedData.customerPhone) missing.push('聯絡電話');
    
    if (missing.length === 0) {
      return '好的！讓我為您確認並安排預約...';
    } else if (missing.length === 1) {
      return `請問您的${missing[0]}是？`;
    } else {
      return `我來協助您預約！還需要您提供：${missing.slice(0, 2).join('、')}`;
    }
  }
}
