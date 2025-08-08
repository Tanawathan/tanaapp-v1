// 測試修正後的提示詞系統
const { PromptBuilder, SYSTEM_PROMPTS } = require('./app/lib/prompt-engineering.ts');

console.log('=== 測試修正後的提示詞系統 ===\n');

// 測試 1: 基礎提示詞是否包含電話號碼政策
console.log('1. 基礎提示詞檢查:');
const basePrompt = PromptBuilder.buildSystemPrompt('general');
const hasPhonePolicy = basePrompt.includes('電話號碼') && basePrompt.includes('必要政策');
console.log(`✅ 包含電話號碼政策: ${hasPhonePolicy ? '是' : '否'}`);

// 測試 2: 預約提示詞檢查
console.log('\n2. 預約提示詞檢查:');
const reservationPrompt = PromptBuilder.buildSystemPrompt('reservation');
const checks = {
  hasPhoneRequirement: reservationPrompt.includes('必須收集電話號碼'),
  hasCustomerPhone: reservationPrompt.includes('customer_phone'),
  hasConfirmation: reservationPrompt.includes('預約成功後立即顯示'),
  hasPolicy: reservationPrompt.includes('餐廳政策')
};

Object.entries(checks).forEach(([key, value]) => {
  console.log(`✅ ${key}: ${value ? '通過' : '❌ 失敗'}`);
});

// 測試 3: 確認查詢提示詞檢查
console.log('\n3. 確認查詢提示詞檢查:');
const confirmationPrompt = PromptBuilder.buildSystemPrompt('confirmation');
const confirmationChecks = {
  hasCustomerPhone: confirmationPrompt.includes('customer_phone'),
  hasAPIEndpoint: confirmationPrompt.includes('/api/confirm'),
  hasErrorHandling: confirmationPrompt.includes('查詢失敗'),
  hasPrivacyProtection: confirmationPrompt.includes('隱私保護')
};

Object.entries(confirmationChecks).forEach(([key, value]) => {
  console.log(`✅ ${key}: ${value ? '通過' : '❌ 失敗'}`);
});

// 測試 4: 觸發器測試
console.log('\n4. 觸發器測試:');

// 測試預約觸發器（有電話）
const reservationTriggerWithPhone = `
[RESERVATION_TRIGGER]
action: create_reservation
customer_name: 測試用戶
customer_phone: 0912345678
party_size: 4
reservation_date: 2025-08-09
reservation_time: 19:00
restaurant_id: default
[/RESERVATION_TRIGGER]
`;

const parsedReservation = PromptBuilder.extractReservationTrigger(reservationTriggerWithPhone);
console.log('✅ 預約觸發器解析:', parsedReservation);

// 測試確認查詢觸發器
const confirmationTriggerTest = `
[CONFIRMATION_TRIGGER]
action: query_reservation
customer_phone: 0971715711
[/CONFIRMATION_TRIGGER]
`;

const parsedConfirmation = PromptBuilder.extractConfirmationTrigger(confirmationTriggerTest);
console.log('✅ 確認查詢觸發器解析:', parsedConfirmation);

// 測試 5: 意圖判斷
console.log('\n5. 意圖判斷測試:');
const testQueries = [
  '我想預約明天晚上的位子',
  '查詢我的預約記錄', 
  '確認訂單狀態',
  '推薦一些好吃的菜'
];

testQueries.forEach(query => {
  const prompt = PromptBuilder.buildContextualPrompt(query, []);
  let mode = 'general';
  if (prompt.includes('訂位服務專家')) mode = 'reservation';
  else if (prompt.includes('確認查詢專家')) mode = 'confirmation';
  else if (prompt.includes('點餐服務專家')) mode = 'ordering';
  
  console.log(`"${query}" -> ${mode} 模式`);
});

console.log('\n=== 測試完成 ===');
console.log('\n📋 修正重點摘要:');
console.log('✅ 1. 強化電話號碼收集政策');
console.log('✅ 2. 修正資料庫欄位名稱 (customer_phone)');
console.log('✅ 3. 添加預約完成確認訊息');
console.log('✅ 4. 增強錯誤處理機制');
console.log('✅ 5. 明確 API 呼叫流程');
