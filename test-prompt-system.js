// 測試提示詞系統和確認查詢功能
const { PromptBuilder } = require('./app/lib/prompt-engineering.ts');

console.log('=== 測試提示詞系統 ===\n');

// 測試 1: 一般對話提示詞
console.log('1. 一般對話提示詞:');
const generalPrompt = PromptBuilder.buildSystemPrompt('general');
console.log(generalPrompt.substring(0, 200) + '...\n');

// 測試 2: 確認查詢提示詞
console.log('2. 確認查詢提示詞:');
const confirmationPrompt = PromptBuilder.buildSystemPrompt('confirmation');
console.log(confirmationPrompt.substring(0, 200) + '...\n');

// 測試 3: 智能意圖判斷
console.log('3. 智能意圖判斷測試:');
const testQueries = [
  '我想查詢我的預約',
  '確認一下我的訂單狀況', 
  '檢查有沒有我的記錄',
  '想要點餐',
  '預約明天的位子'
];

testQueries.forEach(query => {
  const contextualPrompt = PromptBuilder.buildContextualPrompt(query, []);
  const isConfirmation = contextualPrompt.includes('確認查詢專家');
  console.log(`查詢: "${query}" -> ${isConfirmation ? '確認查詢' : '其他'} 模式`);
});

// 測試 4: 確認觸發器檢測
console.log('\n4. 確認觸發器檢測測試:');
const testResponses = [
  `好的！讓我查詢您的預約記錄...

[CONFIRMATION_TRIGGER]
action: query_reservation
customer_phone: 09123456789
[/CONFIRMATION_TRIGGER]`,

  `我來查詢您的訂單狀況...

[CONFIRMATION_TRIGGER]
action: query_order
customer_phone: 0971715711
[/CONFIRMATION_TRIGGER]`
];

testResponses.forEach((response, index) => {
  const trigger = PromptBuilder.extractConfirmationTrigger(response);
  console.log(`測試 ${index + 1}:`, trigger);
});

console.log('\n=== 測試完成 ===');
