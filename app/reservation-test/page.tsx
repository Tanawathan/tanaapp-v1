'use client'

import { useState } from 'react';
import { RestaurantReservationManager } from '../lib/reservation-manager';
import { ReservationTriggerParser } from '../lib/reservation-trigger-parser';

export default function ReservationTest() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('🧪 開始測試預約系統...\n');

    try {
      // 測試1: 驗證預約資料
      const testReservationData = {
        customerName: '張先生',
        customerPhone: '0912345678',
        partySize: 4,
        reservationDate: '2025-08-09',
        reservationTime: '19:00',
        specialRequests: '靠窗座位'
      };

      setTestResult(prev => prev + `📝 測試預約資料: ${JSON.stringify(testReservationData, null, 2)}\n`);

      // 測試2: 驗證資料格式
      const validation = RestaurantReservationManager.validateReservationData(testReservationData);
      setTestResult(prev => prev + `✅ 驗證結果: ${JSON.stringify(validation, null, 2)}\n`);

      // 測試3: 創建預約 (開發模式)
      if (validation.isValid) {
        const result = await RestaurantReservationManager.createReservation(testReservationData);
        setTestResult(prev => prev + `🎯 預約創建結果: ${JSON.stringify(result, null, 2)}\n`);
      }

      // 測試4: 測試 AI 觸發器解析
      const testAIResponse = `
好的！我已經為您安排預約。以下是預約詳情：

[RESERVATION_TRIGGER]
客戶姓名：李小姐
聯絡電話：0923456789
用餐人數：2
預約日期：2025-08-10
預約時間：18:30
特殊需求：安靜位置
[/RESERVATION_TRIGGER]

請準時到達，如有任何變更請提前聯絡。`;

      const triggers = ReservationTriggerParser.parseReservationTriggers(testAIResponse);
      setTestResult(prev => prev + `🔍 觸發器解析結果: ${JSON.stringify(triggers, null, 2)}\n`);

      // 測試5: 處理觸發器
      if (triggers.length > 0) {
        const triggerResults = await ReservationTriggerParser.processReservationTriggers(triggers);
        setTestResult(prev => prev + `⚙️ 觸發器處理結果: ${JSON.stringify(triggerResults, null, 2)}\n`);
      }

      setTestResult(prev => prev + '🎉 預約系統測試完成！');

    } catch (error) {
      setTestResult(prev => prev + `❌ 測試出錯: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🏪 餐廳預約系統測試</h1>
      
      <button
        onClick={runTest}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded mb-6"
      >
        {isLoading ? '測試中...' : '執行測試'}
      </button>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">測試結果：</h2>
        <pre className="whitespace-pre-wrap text-sm">
          {testResult || '點擊上方按鈕開始測試...'}
        </pre>
      </div>
    </div>
  );
}
