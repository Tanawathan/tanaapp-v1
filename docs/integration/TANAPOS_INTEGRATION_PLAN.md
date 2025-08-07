# TanaAPP x TanaPOS API Integration Plan

## 概述

TanaAPP (消費者 AI 社交平台) 需要與 TanaPOS-v4-mini (後台管理系統) 進行 API 整合，讓 AI 助手「阿狸」能夠訪問餐廳資料並為顧客提供智能服務。

## 系統架構分析

### TanaPOS-v4-mini 技術棧
- **前端**: Vite + React + TypeScript + TailwindCSS
- **後端**: Supabase PostgreSQL Database
- **狀態管理**: Zustand
- **API 層**: 直接 Supabase 客戶端操作
- **端口**: 5174 (開發模式)

### TanaAPP-v1 技術棧
- **前端**: Next.js 14 + TypeScript + TailwindCSS  
- **AI 服務**: OpenAI GPT-4 API
- **資料庫**: 共享 Supabase PostgreSQL
- **API 設計**: Next.js API Routes
- **端口**: 3000 (開發模式)

## 整合策略

### 1. 共享資料庫方案
兩個應用共享同一個 Supabase 資料庫實例，透過不同的服務層訪問相同的資料。

**優點**:
- 資料即時同步
- 減少 API 調用複雜度
- 統一的權限管理

**缺點**:
- 需要協調 schema 變更
- 兩個應用耦合度較高

### 2. API 包裝層方案 (推薦)
TanaAPP 建立專門的 API 層包裝 TanaPOS 的服務邏輯，為 AI 助手提供優化的介面。

## API 設計規劃

### Core Services 需要整合的服務

#### 1. Menu Service (菜單服務)
```typescript
// TanaAPP API Routes
GET /api/menu/categories        // 獲取分類
GET /api/menu/products         // 獲取商品
GET /api/menu/combos          // 獲取套餐
GET /api/menu/search          // AI 搜尋商品
```

#### 2. Order Service (訂單服務)
```typescript
POST /api/orders              // 建立訂單
GET  /api/orders/:id          // 獲取訂單詳情
PUT  /api/orders/:id/status   // 更新訂單狀態
```

#### 3. Restaurant Service (餐廳資訊)
```typescript
GET /api/restaurant/info      // 基本資訊
GET /api/restaurant/hours     // 營業時間
GET /api/restaurant/tables    // 桌位狀態
```

#### 4. AI Service (AI 專用)
```typescript
POST /api/ai/recommend        // AI 推薦商品
POST /api/ai/analyze          // 分析顧客偏好
POST /api/ai/chat             // 聊天對話
```

## 資料庫共享方案實作

### 1. 環境變數統一
```bash
# 共享的 Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI API (TanaAPP 專用)
OPENAI_API_KEY=your_openai_api_key

# Restaurant ID (兩個應用共用)
RESTAURANT_ID=550e8400-e29b-41d4-a716-446655440000
```

### 2. Service Layer 架構
```
TanaAPP/
├── src/lib/
│   ├── supabase/          # 資料庫連接
│   │   ├── client.ts      # 客戶端
│   │   └── server.ts      # 伺服器端
│   ├── services/          # 商業邏輯層
│   │   ├── menuService.ts
│   │   ├── orderService.ts
│   │   └── aiService.ts
│   └── types/             # 共享型別定義
└── app/api/               # Next.js API Routes
    ├── menu/
    ├── orders/
    └── ai/
```

### 3. TanaPOS Service 包裝
在 TanaAPP 中建立 TanaPOS 服務包裝器：

```typescript
// src/lib/services/tanaposService.ts
import { MenuService } from './menuService'
import { KDSService } from './kdsService'

export class TanaPOSService {
  private menuService: MenuService
  
  constructor() {
    this.menuService = MenuService.getInstance()
  }
  
  // 包裝 TanaPOS 的菜單服務給 AI 使用
  async getMenuForAI() {
    const categories = await this.menuService.getCategories()
    const products = await this.menuService.getProducts()
    
    return {
      categories: categories.data,
      products: products.data,
      // 添加 AI 需要的額外資訊
      aiContext: {
        popularItems: products.data?.filter(p => p.ai_recommended),
        avgPreparationTime: this.calculateAvgPrepTime(products.data)
      }
    }
  }
}
```

## AI 助手整合設計

### 1. 阿狸 AI 功能需求
- 查詢菜單和價格
- 推薦商品組合
- 處理訂餐請求
- 查詢訂單狀態
- 回答餐廳相關問題

### 2. AI Context 建構
```typescript
// src/lib/ai/contextBuilder.ts
export class AIContextBuilder {
  static async buildMenuContext() {
    const tanaposService = new TanaPOSService()
    const menuData = await tanaposService.getMenuForAI()
    
    return {
      systemPrompt: `
        你是泰式餐廳的 AI 助手「阿狸」(A-Li)，具有以下特質：
        - 理性哲學家，邏輯清晰
        - 外表可愛，內心睿智
        - 專精泰式料理推薦
        
        當前菜單資訊：
        ${JSON.stringify(menuData, null, 2)}
      `,
      availableActions: [
        'recommend_dishes',
        'check_price', 
        'place_order',
        'check_order_status'
      ]
    }
  }
}
```

## 開發階段規劃

### Phase 1: 基礎整合 (Week 1)
- [ ] 建立共享 Supabase 連接
- [ ] 建立基本的 API Routes
- [ ] 實作 Menu Service 包裝
- [ ] 測試資料庫讀取

### Phase 2: AI 服務整合 (Week 2)  
- [ ] 建立 AI Context Builder
- [ ] 實作基本對話功能
- [ ] 整合菜單查詢 AI 功能
- [ ] 建立推薦系統

### Phase 3: 訂單系統 (Week 3)
- [ ] 實作訂單建立 API
- [ ] 整合訂單狀態查詢
- [ ] 建立通知系統
- [ ] 訂單確認流程

### Phase 4: 優化與測試 (Week 4)
- [ ] 效能優化
- [ ] 錯誤處理完善
- [ ] 端對端測試
- [ ] 用戶體驗優化

## 技術風險評估

### 高風險
- 資料庫 Schema 衝突
- API 回應速度影響 AI 體驗
- 兩個應用的部署協調

### 中風險  
- OpenAI API 配額管理
- 錯誤處理機制
- 快取策略設計

### 低風險
- 環境變數管理
- TypeScript 型別同步
- 開發環境設置

## 監控與維護

### 1. API 監控
- 回應時間追蹤
- 錯誤率監控
- API 調用頻率分析

### 2. AI 服務監控
- OpenAI API 使用量
- 對話成功率
- 用戶滿意度回饋

### 3. 整合健康檢查
- 資料庫連接狀態
- 服務可用性檢查
- 自動化測試覆蓋

## 結論

推薦採用「資料庫共享 + API 包裝層」的混合方案，既確保資料一致性，又提供了足夠的服務解耦。這個方案能夠讓阿狸 AI 助手有效地訪問 TanaPOS 的所有功能，同時保持良好的系統架構。

下一步將開始 Phase 1 的實作，建立基礎的整合架構。
