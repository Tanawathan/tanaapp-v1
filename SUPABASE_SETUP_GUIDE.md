# 餐廳預約系統 - Supabase 資料庫設置指南

## 📋 概述

本指南將協助您設置 Supabase 資料庫以支援餐廳預約系統的完整功能。

## 🚀 快速開始

### 1. 創建 Supabase 專案

1. 訪問 [Supabase](https://supabase.com/)
2. 點擊 "Start your project"
3. 創建新的專案
4. 選擇適合的區域（建議選擇距離最近的）

### 2. 獲取連接資訊

在 Supabase 控制台中：

1. 前往 **Settings** → **API**
2. 複製以下資訊：
   - **Project URL**: `https://your-project.supabase.co`
   - **API Key (anon public)**: `eyJ...` （公開金鑰）
   - **API Key (service_role)**: `eyJ...` （服務金鑰，機密）

### 3. 更新環境變數

編輯 `c:\TANAPOS\tanaapp-v1\.env.local` 檔案：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 其他配置保持不變...
```

### 4. 創建資料庫表

1. 在 Supabase 控制台中，前往 **SQL Editor**
2. 點擊 **New query**
3. 複製 `scripts/create-reservations-table.sql` 的內容
4. 貼上並執行 SQL 腳本

## 📊 資料庫架構

### reservations 表

| 欄位名 | 類型 | 必填 | 說明 |
|-------|------|------|------|
| id | UUID | ✅ | 預約ID（主鍵） |
| restaurant_id | UUID | ✅ | 餐廳ID |
| table_id | UUID | | 桌位ID |
| customer_name | VARCHAR(100) | ✅ | 客戶姓名 |
| customer_phone | VARCHAR(20) | ✅ | 客戶電話 |
| customer_email | VARCHAR(255) | | 客戶郵件 |
| party_size | INTEGER | ✅ | 用餐人數 |
| reservation_date | DATE | ✅ | 預約日期 |
| reservation_time | TIME | ✅ | 預約時間 |
| status | VARCHAR(20) | ✅ | 預約狀態 |
| special_requests | TEXT | | 特殊要求 |
| created_via | VARCHAR(20) | | 創建方式 |
| confidence_score | DECIMAL(3,2) | | AI信心分數 |
| created_at | TIMESTAMP | ✅ | 創建時間 |
| updated_at | TIMESTAMP | ✅ | 更新時間 |

## 🔧 測試連接

執行以下命令測試資料庫連接：

```bash
cd c:\TANAPOS\tanaapp-v1
node setup-database.js
```

## 🎯 功能特性

### ✅ 已實現功能

- 🤖 **AI 預約解析**: 從對話中智能提取預約資訊
- 📊 **資料驗證**: 完整的輸入資料驗證
- 🪑 **桌位管理**: 自動選擇最適合的桌位
- 📅 **時間衝突檢查**: 避免重複預約
- 🔄 **狀態管理**: 完整的預約狀態追蹤
- 📱 **多渠道支援**: 支援 AI、手動、電話、網站預約

### 🛠️ 開發模式

系統會自動檢測開發環境：

- ✅ 無需真實資料庫也能測試
- 🎭 完整的模擬預約功能
- 📝 詳細的除錯資訊
- 🔄 即時重載支援

## 📝 使用範例

### AI 聊天預約

```javascript
// 使用者說：「我想預約明天晚上7點，4個人用餐」
// AI 回應包含：
[RESERVATION_TRIGGER]
客戶姓名：張先生
聯絡電話：0912345678
用餐人數：4
預約日期：2025-08-09
預約時間：19:00
特殊需求：靠窗座位
[/RESERVATION_TRIGGER]

// 系統自動處理並創建預約
```

### 程式化預約

```typescript
import { RestaurantReservationManager } from './lib/reservation-manager';

const reservationData = {
  customerName: '王小明',
  customerPhone: '0912345678',
  customerEmail: 'wang@example.com',
  partySize: 2,
  reservationDate: '2025-08-10',
  reservationTime: '18:30',
  specialRequests: '素食需求'
};

const result = await RestaurantReservationManager.createReservation(reservationData);
console.log('預約結果:', result);
```

## 🚨 故障排除

### 常見問題

1. **"supabaseKey is required" 錯誤**
   - 檢查 `.env.local` 檔案是否正確設置
   - 確認環境變數名稱拼寫正確

2. **"Cannot find module" 錯誤**
   - 執行 `npm install` 安裝相依套件

3. **資料庫連接失敗**
   - 檢查 Supabase URL 是否正確
   - 確認網路連接正常

### 偵錯技巧

啟用詳細除錯資訊：
```javascript
console.log('Supabase 配置:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});
```

## 🎊 完成！

設置完成後，您的餐廳預約系統將具備：

- 🤖 智能 AI 預約助手
- 📊 完整資料庫持久化
- 🔄 即時狀態同步
- 📱 多平台支援
- 🛡️ 資料安全保護

如有問題，請參考控制台輸出的詳細日誌信息。
