# 🔌 TanaAPP v1.0 API 參考文檔

## 📡 API 概覽

### 基本資訊
- **Base URL**: `https://your-domain.com/api`
- **認證方式**: JWT Bearer Token
- **資料格式**: JSON
- **HTTP Status Codes**: 標準 RESTful 狀態碼
- **Rate Limiting**: 1000 requests/hour per user

### 通用回應格式
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: PaginationInfo;
    timestamp: string;
    version: string;
  };
}
```

## 🤖 AI 聊天 API

### POST /api/chat
AI 智能對話處理

#### Request Body
```typescript
interface ChatRequest {
  message: string;                    // 用戶訊息
  sessionId?: string;                 // 會話 ID
  restaurantId: string;               // 餐廳 ID
  context?: {                         // 對話上下文
    currentIntent?: string;
    orderInProgress?: OrderContext;
    tableId?: string;
  };
}
```

#### Response
```typescript
interface ChatResponse {
  message: string;                    // AI 回應訊息
  intent: string;                     // 識別的意圖
  suggestedReplies?: string[];        // 建議回復
  context?: ConversationContext;      // 更新的上下文
  actions?: {                         // 建議的動作
    type: 'ORDER' | 'NAVIGATE' | 'SHOW_MENU';
    data: any;
  }[];
}
```

#### Example
```bash
curl -X POST /api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "我想要點一份牛排",
    "restaurantId": "11111111-1111-1111-1111-111111111111"
  }'
```

```json
{
  "success": true,
  "data": {
    "message": "🥩 **安格斯牛排** - NT$780\n⏱️ 30分鐘\n\n💬 要加入訂單嗎？",
    "intent": "ORDERING_ITEM_FOUND",
    "suggestedReplies": ["加入訂單", "我要2份", "看看其他"],
    "context": {
      "currentIntent": "ORDERING_CONFIRM",
      "orderInProgress": {
        "items": [{"productId": "item-id", "quantity": 1}]
      }
    }
  }
}
```

## 📋 菜單管理 API

### GET /api/menu
取得餐廳菜單

#### Query Parameters
```typescript
interface MenuQuery {
  restaurantId: string;               // 餐廳 ID
  categoryId?: string;                // 分類篩選
  available?: boolean;                // 是否可用
  featured?: boolean;                 // 主推商品
  page?: number;                      // 頁碼 (預設: 1)
  limit?: number;                     // 每頁數量 (預設: 50)
}
```

#### Response
```typescript
interface MenuResponse {
  categories: Category[];
  menuItems: MenuItem[];
  comboItems: ComboItem[];
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    lastUpdated: string;
  };
}
```

### GET /api/menu/categories
取得菜單分類

#### Response
```typescript
interface Category {
  id: string;
  name: string;
  displayName: Record<string, string>;
  description?: string;
  displayOrder: number;
  icon?: string;
  color?: string;
  isActive: boolean;
  itemCount: number;                  // 該分類商品數量
}
```

### GET /api/menu/items/:id
取得特定菜單項目詳細資訊

#### Response
```typescript
interface MenuItem {
  id: string;
  name: string;
  displayName: Record<string, string>;
  description?: string;
  price: number;
  images: string[];
  allergens: string[];
  nutritionalInfo?: NutritionalInfo;
  prepTimeMinutes: number;
  cookingTimeMinutes: number;
  totalTimeMinutes: number;
  difficultyLevel: number;
  spiceLevel: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  aiRecommended: boolean;
  tags: string[];
  category: Category;
  inventory?: {
    currentStock: number;
    trackInventory: boolean;
  };
}
```

## 🛒 訂單管理 API

### POST /api/orders
建立新訂單

#### Request Body
```typescript
interface CreateOrderRequest {
  restaurantId: string;
  tableId?: string;
  orderType: 'dine_in' | 'takeout' | 'delivery';
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  items: OrderItem[];
  specialRequests?: string;
}

interface OrderItem {
  menuItemId?: string;
  comboItemId?: string;
  quantity: number;
  customizations?: Record<string, any>;
  specialInstructions?: string;
}
```

#### Response
```typescript
interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  serviceFee: number;
  totalAmount: number;
  estimatedReadyTime: string;
  items: OrderItemDetail[];
}
```

### GET /api/orders
取得訂單列表

#### Query Parameters
```typescript
interface OrderQuery {
  restaurantId: string;
  status?: OrderStatus;
  orderType?: OrderType;
  fromDate?: string;                  // ISO 8601 格式
  toDate?: string;
  page?: number;
  limit?: number;
}
```

### PATCH /api/orders/:id
更新訂單狀態

#### Request Body
```typescript
interface UpdateOrderRequest {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  estimatedReadyTime?: string;
  actualReadyTime?: string;
}
```

## 🪑 桌台管理 API

### GET /api/tables
取得桌台列表

#### Response
```typescript
interface TableResponse {
  id: string;
  tableNumber: string;
  tableName?: string;
  capacity: number;
  location?: string;
  status: 'available' | 'occupied' | 'cleaning' | 'reserved';
  currentOrderId?: string;
  qrCodeUrl?: string;
  lastUsedAt?: string;
}
```

### PATCH /api/tables/:id
更新桌台狀態

#### Request Body
```typescript
interface UpdateTableRequest {
  status: TableStatus;
  currentOrderId?: string;
  notes?: string;
}
```

## 📊 分析報表 API

### GET /api/analytics/sales
銷售分析

#### Query Parameters
```typescript
interface SalesAnalyticsQuery {
  restaurantId: string;
  period: 'today' | 'week' | 'month' | 'custom';
  fromDate?: string;
  toDate?: string;
  groupBy?: 'hour' | 'day' | 'week' | 'month';
}
```

#### Response
```typescript
interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: {
    itemId: string;
    itemName: string;
    quantity: number;
    revenue: number;
  }[];
  hourlyBreakdown?: SalesBreakdown[];
  dailyBreakdown?: SalesBreakdown[];
}
```

### GET /api/analytics/performance
營運效能分析

#### Response
```typescript
interface PerformanceAnalytics {
  averagePrepTime: number;            // 平均準備時間
  orderCompletionRate: number;        // 訂單完成率
  tableUtilization: number;           // 桌台使用率
  peakHours: {
    hour: number;
    orderCount: number;
  }[];
  aiChatMetrics: {
    totalConversations: number;
    averageResponseTime: number;
    intentAccuracy: number;
    conversionRate: number;           // 對話轉訂單率
  };
}
```

## 📱 KDS (廚房顯示系統) API

### GET /api/kds/orders
取得廚房訂單顯示

#### Query Parameters
```typescript
interface KDSQuery {
  restaurantId: string;
  status?: 'pending' | 'preparing' | 'ready';
  sortBy?: 'created_at' | 'priority' | 'prep_time';
}
```

#### Response
```typescript
interface KDSOrder {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  orderType: OrderType;
  status: OrderStatus;
  items: KDSOrderItem[];
  estimatedReadyTime: string;
  elapsedTime: number;                // 經過時間(分鐘)
  priority: 'low' | 'normal' | 'high';
  specialRequests?: string;
}

interface KDSOrderItem {
  id: string;
  itemName: string;
  quantity: number;
  customizations?: string[];
  specialInstructions?: string;
  prepTimeMinutes: number;
  status: 'pending' | 'preparing' | 'ready';
}
```

### PATCH /api/kds/orders/:id/items/:itemId
更新訂單項目狀態

#### Request Body
```typescript
interface UpdateKDSItemRequest {
  status: 'preparing' | 'ready';
  prepStartedAt?: string;
  prepCompletedAt?: string;
}
```

## 🔍 系統狀態 API

### GET /api/status
取得系統狀態

#### Response
```typescript
interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  timestamp: string;
  services: {
    database: ServiceStatus;
    cache: ServiceStatus;
    ai: ServiceStatus;
    realtime: ServiceStatus;
  };
  performance: {
    averageResponseTime: number;
    cacheHitRate: number;
    activeConnections: number;
  };
  version: string;
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}
```

## 🔐 認證 API

### POST /api/auth/login
使用者登入

#### Request Body
```typescript
interface LoginRequest {
  email: string;
  password: string;
  restaurantId?: string;
}
```

#### Response
```typescript
interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

### POST /api/auth/refresh
重新整理 Token

#### Request Body
```typescript
interface RefreshRequest {
  refreshToken: string;
}
```

## ⚠️ 錯誤處理

### 錯誤代碼
```typescript
enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}
```

### 錯誤回應範例
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "restaurantId",
      "issue": "required"
    }
  },
  "meta": {
    "timestamp": "2025-08-07T12:00:00Z",
    "version": "1.0.0"
  }
}
```

## 🚀 SDK 使用範例

### JavaScript/TypeScript
```typescript
import { TanaAppClient } from '@tanaapp/sdk';

const client = new TanaAppClient({
  baseURL: 'https://api.tanaapp.com',
  apiKey: 'your-api-key'
});

// AI 聊天
const chatResponse = await client.chat.send({
  message: '我要點餐',
  restaurantId: 'restaurant-id'
});

// 取得菜單
const menu = await client.menu.list({
  restaurantId: 'restaurant-id'
});

// 建立訂單
const order = await client.orders.create({
  restaurantId: 'restaurant-id',
  items: [{ menuItemId: 'item-id', quantity: 2 }]
});
```

---

**API 版本**: v1.0  
**最後更新**: 2025年8月7日  
**文檔格式**: OpenAPI 3.0  
**維護者**: Tanawathan Development Team
