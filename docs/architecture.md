# 🏗️ TanaAPP v1.0 系統架構文檔

## 📐 整體架構圖

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   客戶端層      │    │    服務層       │    │    資料層       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│                 │    │                 │    │                 │
│ • Web App       │◄──►│ • Next.js API   │◄──►│ • Supabase      │
│ • Mobile Web    │    │ • AI Service    │    │ • PostgreSQL    │
│ • KDS Display   │    │ • Cache Layer   │    │ • Redis Cache   │
│ • Admin Panel   │    │ • Auth Service  │    │ • File Storage  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 核心模組設計

### 1. AI 智能點餐系統
```typescript
// 核心類別結構
class RestaurantAIService {
  - cache: RestaurantDataCache
  - openai: OpenAI
  
  + analyzeMessage(message: string): Promise<AIResponse>
  + handleMenuInquiry(): Promise<AIResponse>
  + processOrder(): Promise<OrderResponse>
}

class RestaurantDataCache {
  - products: MenuItem[]
  - categories: Category[]
  - tables: TableStatus[]
  
  + initializeCache(): Promise<void>
  + getPopularProducts(): MenuItem[]
  + getProductsByCategory(id: string): MenuItem[]
}
```

### 2. 資料快取架構
```
┌───────────────────┐
│   應用啟動        │
├───────────────────┤
│ 1. 載入環境變數   │
│ 2. 初始化快取     │
│ 3. 預載餐廳資料   │
│ 4. 啟動AI服務     │
└───────────────────┘
           │
           ▼
┌───────────────────┐
│   快取管理系統    │
├───────────────────┤
│ • 5分鐘自動更新   │
│ • 智能索引建立    │
│ • 熱門商品排序    │
│ • 庫存狀態監控    │
└───────────────────┘
```

### 3. 即時通訊架構
```typescript
// WebSocket 連接管理
class RealtimeManager {
  - supabase: SupabaseClient
  - subscriptions: Map<string, Subscription>
  
  + subscribeToOrders(): void
  + subscribeToTables(): void
  + subscribeToInventory(): void
  + broadcastUpdate(channel: string, data: any): void
}
```

## 🛠️ 技術棧詳解

### 前端架構 (Next.js 14)
```
src/app/
├── layout.tsx              # 根佈局
├── page.tsx                # 首頁
├── api/                    # API 路由
│   ├── chat/route.ts       # AI 聊天 API
│   ├── status/route.ts     # 系統狀態 API
│   └── orders/route.ts     # 訂單管理 API
├── dashboard/              # 管理後台
├── kds/                    # KDS 廚房顯示
└── mobile/                 # 手機點餐
```

### 資料庫架構 (Supabase)
```sql
-- 核心資料表結構
restaurants (餐廳資訊)
├── categories (分類管理)
├── menu_items (菜單項目)
├── combo_items (套餐管理)
├── tables (桌台管理)
├── orders (訂單記錄)
├── order_items (訂單明細)
└── inventory (庫存管理)
```

### 快取策略
```typescript
// 多層快取架構
interface CacheStrategy {
  L1: 'Memory Cache (應用內)'    // < 1ms 存取
  L2: 'Redis Cache (外部)'       // < 10ms 存取  
  L3: 'Database (Supabase)'      // < 100ms 存取
}

// 快取更新策略
enum CacheUpdateStrategy {
  AUTO_REFRESH = '5分鐘自動更新',
  MANUAL_REFRESH = '手動觸發更新',
  REALTIME_SYNC = '即時同步更新'
}
```

## 🔄 資料流程

### 1. AI 點餐流程
```
用戶輸入 → 意圖識別 → 快取查詢 → AI 處理 → 格式化回應 → 前端顯示
    ↓
語音輸入 → 語音轉文字 → 同上流程 → TTS 輸出 → 語音回應
```

### 2. 訂單處理流程
```
點餐確認 → 訂單驗證 → 資料庫儲存 → KDS 推送 → 廚房接收 → 狀態更新
    ↓
結帳流程 → 金額計算 → 支付處理 → 發票開立 → 訂單完成
```

### 3. 庫存管理流程
```
商品銷售 → 庫存扣減 → 低庫存警告 → 自動補貨建議 → 採購管理
    ↓
盤點作業 → 庫存調整 → 成本分析 → 報表產生 → 經營決策
```

## 🔐 安全架構

### 認證與授權
```typescript
// RLS (Row Level Security) 政策
interface SecurityPolicy {
  restaurants: '只能存取自己餐廳的資料'
  orders: '只能查看相關訂單'
  menu_items: '依角色控制編輯權限'
  analytics: '管理員限定存取'
}

// JWT Token 管理
class AuthManager {
  + login(credentials): Promise<AuthResponse>
  + refreshToken(): Promise<string>
  + validatePermissions(action: string): boolean
}
```

### 資料加密
- **傳輸加密**: HTTPS + TLS 1.3
- **儲存加密**: Supabase 內建加密
- **敏感資料**: 環境變數管理
- **API 金鑰**: 定期輪換機制

## 📊 效能優化

### 1. 快取效能
```typescript
// 效能指標
interface PerformanceMetrics {
  cacheHitRate: '95%+'           // 快取命中率
  responseTime: '<150ms'         // AI 回應時間
  databaseQuery: '<50ms'         // 資料庫查詢
  pageLoadTime: '<2s'           // 頁面載入時間
}
```

### 2. 資料庫優化
```sql
-- 索引策略
CREATE INDEX idx_orders_restaurant_created ON orders(restaurant_id, created_at);
CREATE INDEX idx_menu_items_category ON menu_items(category_id, is_available);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### 3. CDN 與靜態資源
```typescript
// 資源優化配置
const nextConfig = {
  images: {
    domains: ['supabase.co'],
    formats: ['image/webp', 'image/avif']
  },
  compress: true,
  poweredByHeader: false
}
```

## 🚀 部署架構

### 生產環境
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Vercel      │    │    Supabase     │    │      CDN        │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Next.js App   │    │ • PostgreSQL    │    │ • 靜態資源      │
│ • API Routes    │    │ • Auth Service  │    │ • 圖片優化      │
│ • Edge Runtime  │    │ • Realtime      │    │ • 全球節點      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 監控與日誌
```typescript
// 系統監控
interface MonitoringStack {
  uptime: 'Vercel Analytics'
  performance: 'Next.js Speed Insights'
  errors: 'Sentry Error Tracking'
  logs: 'Vercel Functions Logs'
  database: 'Supabase Dashboard'
}
```

---

**文檔版本**: v1.0  
**最後更新**: 2025年8月7日  
**維護者**: Tanawathan Development Team
