# TanaAPP 場景驅動系統架構設計
## 📅 創建時間: 2025年8月7日

---

## 🎭 **核心架構概念**

### 場景化AI系統 (Scenario-Driven AI System)

**設計理念：** 將AI助手的功能按照用戶使用場景進行模塊化設計，每個場景提供專門的服務和對話邏輯，通過統一的卡片模板系統實現一致的用戶體驗。

### 架構原則

1. **🎯 場景獨立性**
   - 每個場景擁有獨立的對話邏輯
   - 獨立的服務功能和資料結構
   - 可單獨開發、測試和部署

2. **🎨 UI模板復用性**  
   - 相同類型的內容使用統一的卡片模板
   - 一次開發，多場景複用
   - 保持設計一致性和開發效率

3. **🔄 動態場景切換**
   - AI根據用戶意圖自動識別場景
   - 無縫的場景間切換體驗
   - 上下文保持和記憶功能

4. **🔧 服務模塊化**
   - 每個場景下的服務功能獨立封裝
   - 易於擴展和維護
   - 支援第三方服務整合

---

## 📋 **場景規劃藍圖**

### 🍽️ **Scene 1: 菜單點餐場景** ✅ 已實現
```typescript
interface MenuOrderingScene {
  name: "菜單點餐";
  services: ["菜單推薦", "產品詳情", "加入購物車", "營養資訊"];
  cardTemplates: ["ProductCard"];
  dialogFlow: "推薦 → 興趣確認 → 詳情展示 → 購買決策";
  status: "完成";
}
```

### 📅 **Scene 2: 訂位預約場景** 🚧 規劃中
```typescript
interface ReservationScene {
  name: "訂位預約";
  services: ["查看空桌", "選擇時間", "確認訂位", "修改訂位", "取消訂位"];
  cardTemplates: ["TimeSlotCard", "TableCard", "ReservationCard"];
  dialogFlow: "需求詢問 → 時段選擇 → 桌位確認 → 預約完成";
  status: "設計中";
}
```

### 🎉 **Scene 3: 活動優惠場景** 📋 待開發
```typescript
interface PromotionScene {
  name: "活動優惠";
  services: ["今日特價", "會員優惠", "節慶活動", "限時促銷", "優惠券"];
  cardTemplates: ["PromotionCard", "CouponCard", "EventCard"];
  dialogFlow: "優惠推播 → 條件說明 → 使用引導 → 確認套用";
  status: "規劃中";
}
```

### ❓ **Scene 4: 客服諮詢場景** 📋 待開發
```typescript
interface CustomerServiceScene {
  name: "客服諮詢";
  services: ["FAQ問答", "菜品查詢", "過敏原資訊", "營業資訊", "聯絡方式"];
  cardTemplates: ["FAQCard", "InfoCard", "ContactCard"];
  dialogFlow: "問題理解 → 答案提供 → 深度說明 → 滿意確認";
  status: "規劃中";
}
```

### 📦 **Scene 5: 訂單追蹤場景** 📋 待開發
```typescript
interface OrderTrackingScene {
  name: "訂單追蹤";
  services: ["訂單狀態", "配送追蹤", "訂單修改", "取消訂單", "客訴處理"];
  cardTemplates: ["OrderCard", "StatusCard", "TrackingCard"];
  dialogFlow: "訂單查詢 → 狀態顯示 → 操作選項 → 動作執行";
  status: "規劃中";
}
```

### 🏪 **Scene 6: 餐廳資訊場景** 📋 待開發
```typescript
interface RestaurantInfoScene {
  name: "餐廳資訊";
  services: ["地址導航", "營業時間", "環境介紹", "停車資訊", "交通指引"];
  cardTemplates: ["LocationCard", "HoursCard", "GalleryCard"];
  dialogFlow: "需求識別 → 資訊提供 → 動作執行 → 額外協助";
  status: "規劃中";
}
```

### 💳 **Scene 7: 支付結帳場景** 📋 待開發  
```typescript
interface PaymentScene {
  name: "支付結帳";
  services: ["支付方式", "優惠券", "發票開立", "付款確認", "收據發送"];
  cardTemplates: ["PaymentCard", "ReceiptCard", "InvoiceCard"];
  dialogFlow: "金額確認 → 支付選擇 → 細節確認 → 完成付款";
  status: "規劃中";
}
```

---

## 🎨 **卡片模板系統**

### 模板分類架構

#### 1. **ProductCard** (產品型) ✅ 已實現
```tsx
interface ProductCardTemplate {
  layout: "emoji + title + price + actions";
  variants: ["compact", "detailed", "grid"];
  actions: ["詳細介紹", "加入購物車"];
  usedIn: ["菜單點餐場景"];
}
```

#### 2. **ServiceCard** (服務型) 📋 待開發
```tsx
interface ServiceCardTemplate {
  layout: "icon + title + description + button";
  variants: ["simple", "featured"];
  actions: ["選擇服務", "了解更多"];
  usedIn: ["客服諮詢", "餐廳資訊"];
}
```

#### 3. **StatusCard** (狀態型) 📋 待開發
```tsx
interface StatusCardTemplate {
  layout: "status_icon + title + progress + actions";
  variants: ["linear", "circular", "steps"];
  actions: ["查看詳情", "修改", "取消"];
  usedIn: ["訂單追蹤", "訂位管理"];
}
```

#### 4. **TimeSlotCard** (時間型) 📋 待開發
```tsx
interface TimeSlotCardTemplate {
  layout: "time + availability + price + book_button";
  variants: ["available", "busy", "closed"];
  actions: ["選擇預約", "候補"];
  usedIn: ["訂位預約"];
}
```

#### 5. **PromotionCard** (促銷型) 📋 待開發
```tsx
interface PromotionCardTemplate {
  layout: "badge + title + discount + expiry + claim_button";
  variants: ["percentage", "fixed_amount", "buy_one_get_one"];
  actions: ["立即使用", "收藏優惠"];
  usedIn: ["活動優惠"];
}
```

### 設計規範統一

#### 視覺元素
- **圓角半徑:** 12px (xl)
- **陰影層級:** shadow-sm / shadow-md / shadow-lg
- **邊框:** border border-gray-100
- **背景:** 白色 + 微妙漸層

#### 互動效果
- **Hover效果:** 陰影加深 + 輕微縮放
- **點擊反饋:** 瞬間縮放效果
- **載入狀態:** 骨架屏 + 脈動效果

#### 響應式適配
- **移動端優先:** 基礎設計針對手機螢幕
- **觸控友好:** 最小44px觸控區域
- **單手操作:** 重要按鈕在拇指可及範圍

---

## 🔧 **技術實現架構**

### 場景管理系統
```typescript
// 場景基礎介面
interface BaseScene {
  id: string;
  name: string;
  description: string;
  services: string[];
  cardTemplates: string[];
  dialogFlow: string;
  isActive: boolean;
}

// 場景管理器
class SceneManager {
  private currentScene: BaseScene;
  private sceneHistory: BaseScene[];
  
  switchScene(sceneId: string): void;
  getAvailableServices(): Service[];
  renderSceneCards(): JSX.Element;
}
```

### 卡片模板系統
```typescript
// 模板註冊系統
interface CardTemplate {
  id: string;
  component: React.ComponentType<any>;
  props: Record<string, any>;
  variants: string[];
}

// 模板渲染器
class CardRenderer {
  private templates: Map<string, CardTemplate>;
  
  registerTemplate(template: CardTemplate): void;
  renderCard(templateId: string, data: any): JSX.Element;
}
```

### AI對話引擎整合
```typescript
// 場景識別器
interface SceneDetector {
  analyzeUserIntent(message: string): string;
  suggestNextScene(context: any): string;
  maintainContext(sceneSwitch: boolean): void;
}
```

---

## 📈 **開發時程規劃**

### Phase 2.1: 場景系統基礎架構 (本週)
- [ ] 場景管理器開發
- [ ] 卡片模板註冊系統
- [ ] 場景切換邏輯實現

### Phase 2.2: 訂位預約場景 (下週)  
- [ ] TimeSlotCard模板開發
- [ ] 預約邏輯整合
- [ ] 場景對話流程實現

### Phase 2.3: 其他場景逐步實現 (2-4週)
- [ ] 優惠活動場景
- [ ] 客服諮詢場景  
- [ ] 訂單追蹤場景
- [ ] 餐廳資訊場景
- [ ] 支付結帳場景

### Phase 2.4: AI整合與優化 (4-6週)
- [ ] 場景識別AI訓練
- [ ] 對話流程優化
- [ ] 個性化推薦引擎
- [ ] 全場景測試驗證

---

## 🎯 **成功指標定義**

### 技術指標
- [ ] 場景切換響應時間 < 300ms
- [ ] 卡片渲染效能 > 60FPS  
- [ ] AI場景識別準確率 > 85%
- [ ] 程式碼複用率 > 70%

### 用戶體驗指標
- [ ] 場景切換操作直觀度 > 90%
- [ ] 卡片設計一致性評分 > 4.5/5
- [ ] 服務發現效率提升 > 40%
- [ ] 整體滿意度 > 4.0/5

---

## 🚀 **未來擴展性**

### 場景擴展能力
- **節慶場景:** 特殊節日的專屬體驗
- **VIP場景:** 會員專屬服務和優惠
- **團體場景:** 多人聚餐的特殊需求
- **外帶場景:** 外帶專用的流程優化

### 第三方整合
- **支付系統:** 多元支付方式整合
- **地圖導航:** Google Maps / Apple Maps
- **社群分享:** LINE / Facebook 分享功能
- **會員系統:** CRM 和忠誠度計畫

### AI能力進階
- **語音互動:** 語音識別和合成
- **圖像識別:** 菜品照片識別推薦
- **情感分析:** 用戶情緒感知和回應
- **預測推薦:** 行為分析和個性化推薦

---

**文件維護者:** GitHub Copilot  
**最後更新:** 2025年8月7日  
**版本:** v1.0

---

> 💡 **重要提醒:** 此架構設計將作為 TanaAPP 未來開發的核心指導文件，所有新功能開發都應該遵循場景化和模板化的設計原則。
