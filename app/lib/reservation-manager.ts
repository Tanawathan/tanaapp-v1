// 餐廳預約管理系統
import { supabaseAdmin as supabase } from './supabase';

// 檢查是否為開發模式
const isDevelopmentMode = process.env.NEXT_PUBLIC_APP_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co' ||
                         !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                         process.env.NEXT_PUBLIC_SUPABASE_URL === 'undefined';

console.log('🔧 預約管理系統初始化:', { 
  isDevelopmentMode, 
  env: process.env.NEXT_PUBLIC_APP_ENV,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasRealConfig: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
                    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co' &&
                    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'undefined')
});

// 預約相關的資料類型
export interface ReservationData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string; // 新增客戶郵件欄位
  partySize: number;
  reservationDate: string; // YYYY-MM-DD
  reservationTime: string; // HH:MM
  specialRequests?: string;
  restaurantId?: string;
}

export interface ReservationInfo extends ReservationData {
  id: string;
  tableId?: string;
  tableName?: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface TableInfo {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location?: string;
  features?: string[];
}

// 預約收集狀態管理
export interface ReservationState {
  step: 'initial' | 'collecting_date' | 'collecting_time' | 'collecting_party_size' | 'collecting_contact' | 'confirming' | 'completed';
  data: Partial<ReservationData>;
  errors: string[];
  suggestions: string[];
}

/**
 * 餐廳預約管理器
 */
export class RestaurantReservationManager {
  private static readonly BUSINESS_HOURS = {
    open: '11:00',
    close: '21:30',
    lastReservation: '20:30' // 最後接受預約時間
  };

  private static readonly TIME_SLOTS = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30'
  ];

  /**
   * 解析用戶訊息中的預約資訊
   */
  static parseReservationIntent(userMessage: string): Partial<ReservationData> {
    const reservationData: Partial<ReservationData> = {};

    // 解析人數
    const partySizeMatch = userMessage.match(/(\d+)\s*[個位人]/);
    if (partySizeMatch) {
      reservationData.partySize = parseInt(partySizeMatch[1]);
    }

    // 解析日期 (今天、明天、後天、具體日期)
    const today = new Date();
    const dateKeywords = {
      '今天': 0,
      '今日': 0,
      '明天': 1,
      '明日': 1,
      '後天': 2,
      '大後天': 3
    };

    for (const [keyword, daysOffset] of Object.entries(dateKeywords)) {
      if (userMessage.includes(keyword)) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysOffset);
        reservationData.reservationDate = targetDate.toISOString().split('T')[0];
        break;
      }
    }

    // 解析具體日期 (MM-DD, MM/DD 格式)
    const specificDateMatch = userMessage.match(/(\d{1,2})[\/\-月](\d{1,2})/);
    if (specificDateMatch) {
      const month = parseInt(specificDateMatch[1]);
      const day = parseInt(specificDateMatch[2]);
      const year = today.getFullYear();
      const targetDate = new Date(year, month - 1, day);
      reservationData.reservationDate = targetDate.toISOString().split('T')[0];
    }

    // 解析時間
    const timeMatch = userMessage.match(/(\d{1,2}):(\d{2})|(\d{1,2})\s*點\s*(\d{0,2})/);
    if (timeMatch) {
      let hour: number, minute: number;
      if (timeMatch[1] && timeMatch[2]) {
        // HH:MM 格式
        hour = parseInt(timeMatch[1]);
        minute = parseInt(timeMatch[2]);
      } else {
        // X點X分 格式
        hour = parseInt(timeMatch[3]);
        minute = timeMatch[4] ? parseInt(timeMatch[4]) : 0;
      }
      reservationData.reservationTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    // 解析電話號碼
    const phoneMatch = userMessage.match(/09\d{8}|\+886\s*9\d{8}|0\d{8,9}/);
    if (phoneMatch) {
      reservationData.customerPhone = phoneMatch[0];
    }

    // 解析姓名 (簡單模式，尋找常見稱謂)
    const nameMatch = userMessage.match(/我是(.{1,4})|我叫(.{1,4})|姓(.{1,2})/);
    if (nameMatch) {
      reservationData.customerName = nameMatch[1] || nameMatch[2] || (nameMatch[3] + '先生/小姐');
    }

    return reservationData;
  }

  /**
   * 驗證預約資料的完整性
   */
  static validateReservationData(data: Partial<ReservationData>): { isValid: boolean; missing: string[]; errors: string[] } {
    const missing: string[] = [];
    const errors: string[] = [];

    // 檢查必要欄位
    if (!data.customerName) missing.push('顧客姓名');
    if (!data.customerPhone) missing.push('聯絡電話');
    if (!data.partySize) missing.push('用餐人數');
    if (!data.reservationDate) missing.push('用餐日期');
    if (!data.reservationTime) missing.push('用餐時間');

    // 驗證資料格式和邏輯
    if (data.partySize && (data.partySize < 1 || data.partySize > 12)) {
      errors.push('用餐人數必須在1-12人之間');
    }

    if (data.customerPhone && !this.isValidPhoneNumber(data.customerPhone)) {
      errors.push('電話號碼格式不正確');
    }

    if (data.reservationDate && !this.isValidReservationDate(data.reservationDate)) {
      errors.push('預約日期必須是今天或未來的日期');
    }

    if (data.reservationTime && !this.isValidReservationTime(data.reservationTime)) {
      errors.push('預約時間必須在營業時間內 (11:00-20:30)');
    }

    return {
      isValid: missing.length === 0 && errors.length === 0,
      missing,
      errors
    };
  }

  /**
   * 檢查可用的桌位
   */
  static async getAvailableTables(
    date: string,
    time: string,
    partySize: number,
    restaurantId: string = 'default'
  ): Promise<TableInfo[]> {
    try {
      // 開發模式處理
      if (isDevelopmentMode) {
        console.log('🛠️ 開發模式：模擬桌位查詢', { date, time, partySize, restaurantId });
        return [
          {
            id: 'mock-table-1',
            name: `模擬桌位-${partySize}人桌`,
            capacity: Math.max(partySize, 4),
            status: 'available',
            location: '開發模式測試區'
          }
        ];
      }

      // 查詢符合人數要求的桌位
      const { data: tables, error: tablesError } = await supabase
        .from('tables')
        .select('*')
        .gte('capacity', partySize)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'available');

      if (tablesError) throw tablesError;

      if (!tables || tables.length === 0) {
        return [];
      }

      // 檢查在指定時間是否有衝突的預約
      const reservationDateTime = `${date} ${time}`;
      const { data: conflictReservations, error: reservationError } = await supabase
        .from('reservations')
        .select('table_id')
        .eq('reservation_date', date)
        .gte('reservation_time', this.subtractHours(time, 2)) // 前2小時
        .lte('reservation_time', this.addHours(time, 2))      // 後2小時
        .in('status', ['confirmed', 'seated']);

      if (reservationError) throw reservationError;

      // 過濾掉有衝突的桌位
      const occupiedTableIds = conflictReservations?.map(r => r.table_id) || [];
      const availableTables = tables.filter(table => !occupiedTableIds.includes(table.id));

      return availableTables.map(table => ({
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        status: table.status,
        location: table.location,
        features: table.features || []
      }));
    } catch (error) {
      console.error('查詢可用桌位失敗:', error);
      return [];
    }
  }

  /**
   * 創建預約記錄
   */
  static async createReservation(reservationData: ReservationData): Promise<{ success: boolean; reservationId?: string; error?: string }> {
    try {
      // 驗證資料
      const validation = this.validateReservationData(reservationData);
      if (!validation.isValid) {
        return {
          success: false,
          error: `預約資料不完整: ${[...validation.missing, ...validation.errors].join(', ')}`
        };
      }

      // 開發模式處理
      if (isDevelopmentMode) {
        console.log('🛠️ 開發模式：模擬預約創建', reservationData);
        const mockReservationId = 'dev-' + Date.now();
        
        // 模擬一些處理時間
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          reservationId: mockReservationId
        };
      }

      console.log('🔄 生產模式：嘗試創建真實預約...', reservationData);

      // 查詢可用桌位
      const availableTables = await this.getAvailableTables(
        reservationData.reservationDate,
        reservationData.reservationTime,
        reservationData.partySize,
        reservationData.restaurantId || 'default'
      );

      if (availableTables.length === 0) {
        return {
          success: false,
          error: '該時間段沒有可用桌位，請選擇其他時間'
        };
      }

      // 選擇最適合的桌位 (容量最接近人數的)
      const selectedTable = availableTables.reduce((best, table) => 
        Math.abs(table.capacity - reservationData.partySize) < Math.abs(best.capacity - reservationData.partySize) ? table : best
      );

      console.log('🪑 選擇桌位:', selectedTable);

      // 創建預約記錄
      const reservationRecord = {
        customer_name: reservationData.customerName,
        customer_phone: reservationData.customerPhone,
        customer_email: reservationData.customerEmail || null,
        party_size: reservationData.partySize,
        reservation_date: reservationData.reservationDate,
        reservation_time: reservationData.reservationTime,
        special_requests: reservationData.specialRequests || '',
        table_id: selectedTable.id,
        restaurant_id: reservationData.restaurantId || 'default',
        status: 'confirmed',
        created_via: 'ai_chat',
        confidence_score: 1.0,
        created_at: new Date().toISOString()
      };

      console.log('💾 插入預約記錄...', reservationRecord);

      const { data: reservation, error: insertError } = await supabase
        .from('reservations')
        .insert(reservationRecord)
        .select()
        .single();

      if (insertError) throw insertError;

      // 更新桌位狀態
      await supabase
        .from('tables')
        .update({ status: 'reserved' })
        .eq('id', selectedTable.id);

      return {
        success: true,
        reservationId: reservation.id
      };
    } catch (error) {
      console.error('創建預約失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '創建預約時發生未知錯誤'
      };
    }
  }

  /**
   * 生成預約確認訊息
   */
  static generateConfirmationMessage(reservationData: ReservationData, reservationId: string, tableName: string): string {
    const date = new Date(reservationData.reservationDate);
    const dateStr = date.toLocaleDateString('zh-TW', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });

    return `✅ 預約確認成功！

📋 預約詳情
• 預約編號：${reservationId}
• 顧客姓名：${reservationData.customerName}
• 聯絡電話：${reservationData.customerPhone}
• 用餐日期：${dateStr}
• 用餐時間：${reservationData.reservationTime}
• 用餐人數：${reservationData.partySize}人
• 安排桌位：${tableName}
${reservationData.specialRequests ? `• 特殊需求：${reservationData.specialRequests}` : ''}

📞 如需更改或取消預約，請致電餐廳
⏰ 請準時到達，預約保留15分鐘

感謝您選擇TanaAPP泰式餐廳！🏮✨`;
  }

  /**
   * 生成下一步收集資訊的提示
   */
  static generateCollectionPrompt(state: ReservationState): string {
    const { step, data } = state;

    switch (step) {
      case 'collecting_date':
        return '請問您希望哪一天用餐呢？您可以說「今天」、「明天」或具體日期（如：12月25日）';
      
      case 'collecting_time':
        const availableSlots = this.TIME_SLOTS.slice(0, 8).join('、');
        return `請問您希望幾點用餐呢？我們的營業時間是 ${this.BUSINESS_HOURS.open}-${this.BUSINESS_HOURS.close}，建議時段：${availableSlots}`;
      
      case 'collecting_party_size':
        return '請問有幾位用餐呢？';
      
      case 'collecting_contact':
        const missing = [];
        if (!data.customerName) missing.push('姓名');
        if (!data.customerPhone) missing.push('聯絡電話');
        return `請提供您的${missing.join('和')}，以便我們為您安排預約`;
      
      case 'confirming':
        return this.generateConfirmationSummary(data as ReservationData);
      
      default:
        return '我來協助您進行餐廳預約，請告訴我您的用餐需求！';
    }
  }

  // 私有輔助方法
  private static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(09\d{8}|0\d{8,9}|\+886\s*9\d{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  private static isValidReservationDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }

  private static isValidReservationTime(timeStr: string): boolean {
    return this.TIME_SLOTS.includes(timeStr);
  }

  private static subtractHours(timeStr: string, hours: number): string {
    const [hour, minute] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hour - hours, minute, 0, 0);
    return date.toTimeString().substring(0, 5);
  }

  private static addHours(timeStr: string, hours: number): string {
    const [hour, minute] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hour + hours, minute, 0, 0);
    return date.toTimeString().substring(0, 5);
  }

  private static generateConfirmationSummary(data: ReservationData): string {
    const date = new Date(data.reservationDate);
    const dateStr = date.toLocaleDateString('zh-TW', { 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });

    return `請確認您的預約資訊：
📅 用餐日期：${dateStr}
🕒 用餐時間：${data.reservationTime}
👥 用餐人數：${data.partySize}人
👤 聯絡人：${data.customerName}
📞 電話：${data.customerPhone}
${data.specialRequests ? `📝 特殊需求：${data.specialRequests}` : ''}

確認無誤請回覆「確認」，需要修改請告訴我！`;
  }
}
