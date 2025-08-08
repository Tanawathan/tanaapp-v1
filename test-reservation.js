// 預約系統測試檔案
const { ReservationManager } = require('./app/lib/reservation-manager.ts');

async function testReservationSystem() {
  console.log('🧪 開始測試預約系統...');

  // 測試1: 驗證預約資料
  const testReservationData = {
    customerName: '張先生',
    customerPhone: '0912345678',
    partySize: 4,
    reservationDate: '2025-08-09',
    reservationTime: '19:00',
    specialRequests: '靠窗座位'
  };

  console.log('📝 測試預約資料:', testReservationData);

  // 測試2: 驗證資料格式
  const validation = ReservationManager.validateReservationData(testReservationData);
  console.log('✅ 驗證結果:', validation);

  // 測試3: 創建預約 (開發模式)
  if (validation.isValid) {
    const result = await ReservationManager.createReservation(testReservationData);
    console.log('🎯 預約創建結果:', result);
  }

  console.log('🎉 預約系統測試完成！');
}

// 執行測試
testReservationSystem().catch(console.error);
