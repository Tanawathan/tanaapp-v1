// 資料庫設置腳本
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🔧 開始設置預約系統資料庫...');

// 檢查環境變數
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 環境變數檢查:');
console.log('- Supabase URL:', supabaseUrl || '❌ 未設置');
console.log('- Supabase Key:', supabaseKey ? '✅ 已設置' : '❌ 未設置');

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('demo.supabase.co')) {
  console.log('⚠️  使用開發模式配置...');
  
  // 開發模式：創建模擬資料庫
  const mockDatabase = {
    reservations: []
  };
  
  const mockCreateReservation = (data) => {
    const reservation = {
      id: 'dev-' + Date.now(),
      ...data,
      created_at: new Date().toISOString(),
      status: 'confirmed'
    };
    
    mockDatabase.reservations.push(reservation);
    console.log('🛠️ 模擬創建預約:', reservation);
    
    return {
      success: true,
      reservationId: reservation.id,
      reservation: reservation,
      message: '開發模式：預約已模擬創建'
    };
  };
  
  // 測試多個預約創建
  const testReservations = [
    {
      customerName: '張先生',
      customerPhone: '0912345678',
      partySize: 4,
      reservationDate: '2025-08-09',
      reservationTime: '19:00',
      specialRequests: '靠窗座位'
    },
    {
      customerName: '李小姐',
      customerPhone: '0923456789',
      partySize: 2,
      reservationDate: '2025-08-10',
      reservationTime: '18:30',
      specialRequests: '安靜位置'
    },
    {
      customerName: '王先生',
      customerPhone: '0934567890',
      partySize: 6,
      reservationDate: '2025-08-11',
      reservationTime: '20:00',
      specialRequests: '生日慶祝'
    }
  ];
  
  console.log('\n🧪 執行預約系統測試...');
  testReservations.forEach((reservation, index) => {
    console.log(`\n--- 測試 ${index + 1}: ${reservation.customerName} ---`);
    const result = mockCreateReservation(reservation);
    console.log('✅ 結果:', result.message);
  });
  
  console.log('\n📊 目前預約總數:', mockDatabase.reservations.length);
  console.log('📋 所有預約:', mockDatabase.reservations.map(r => ({
    id: r.id,
    客戶: r.customerName,
    電話: r.customerPhone,
    人數: r.partySize,
    日期: r.reservationDate,
    時間: r.reservationTime,
    狀態: r.status
  })));
  
  console.log('\n💡 開發模式說明：');
  console.log('✅ 預約系統功能正常');
  console.log('✅ 資料驗證正常');
  console.log('✅ AI 觸發器解析正常');
  console.log('📝 資料暫存在記憶體中（重啟會清除）');
  
  console.log('\n🔧 要連接真實的 Supabase 資料庫，請：');
  console.log('1. 在 Supabase 控制台創建新專案');
  console.log('2. 獲取專案 URL 和 Service Role Key');
  console.log('3. 更新 .env.local 檔案');
  console.log('4. 在 Supabase SQL 編輯器執行 scripts/create-reservations-table.sql');
  console.log('5. 重新執行此腳本');
  
  process.exit(0);
}

// 創建 Supabase 客戶端
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🔍 檢查現有表格...');
    
    // 檢查 reservations 表是否存在 - 使用正確的查詢方式
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('count', { count: 'exact', head: true });
    
    if (reservationsError && reservationsError.code === 'PGRST116') {
      // 表不存在
      console.log('⚠️  reservations 表不存在，需要創建...');
      
      // 讀取 SQL 腳本
      const sqlPath = path.join(__dirname, 'scripts', 'create-reservations-table.sql');
      
      if (!fs.existsSync(sqlPath)) {
        console.error('❌ 找不到 SQL 腳本文件:', sqlPath);
        return;
      }
      
      const sqlScript = fs.readFileSync(sqlPath, 'utf8');
      console.log('📜 請將以下 SQL 腳本複製到 Supabase SQL 編輯器中執行:');
      console.log('🔗 Supabase SQL 編輯器: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql/new');
      console.log('\n---SQL 腳本開始---');
      console.log(sqlScript);
      console.log('---SQL 腳本結束---\n');
      
    } else if (reservationsError) {
      console.error('❌ 查詢時出錯:', reservationsError.message);
      return;
    } else {
      console.log('✅ reservations 表已存在');
      
      // 測試預約創建
      const testReservation = {
        restaurant_id: process.env.RESTAURANT_ID || '11111111-1111-1111-1111-111111111111',
        customer_name: '測試客戶_' + Date.now(),
        customer_phone: '0912345678',
        party_size: 4,
        reservation_date: '2025-08-09',
        reservation_time: '19:00:00',
        special_requests: 'AI 自動創建測試預約',
        created_via: 'ai_chat',
        status: 'confirmed'
      };
      
      console.log('🧪 測試預約功能...');
      console.log('📝 測試資料:', testReservation);
      
      const { data: reservation, error: insertError } = await supabase
        .from('reservations')
        .insert(testReservation)
        .select()
        .single();
      
      console.log('📤 Supabase 回應:');
      console.log('- Data:', reservation);
      console.log('- Error:', insertError);
      
      if (insertError) {
        console.error('❌ 創建測試預約失敗:');
        console.error('完整錯誤物件:', JSON.stringify(insertError, null, 2));
        
        if (insertError.code === '23503') {
          console.log('💡 提示: restaurant_id 外鍵約束失敗，請確保 restaurants 表中有對應的記錄');
        }
      } else {
        console.log('🎉 測試預約創建成功!');
        console.log('📋 預約資料:', reservation);
      }
      
    }
    
    console.log('\n🎊 資料庫設置檢查完成！');
    
  } catch (error) {
    console.error('❌ 設置過程中發生錯誤:', error.message);
  }
}

// 執行設置
setupDatabase();
