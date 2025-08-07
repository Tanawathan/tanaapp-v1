# TanaAPP 建構目標與架構規劃 v2.0

## 🎯 核心目標重新定義

### 主要問題分析
- **CSS 架構衝突**：Tailwind CSS 版本兼容性問題導致樣式不穩定
- **佈局設計混亂**：混合了桌面端和移動端的設計模式
- **功能過度複雜**：同時實現多個界面導致代碼維護困難
- **用戶體驗不一致**：缺乏統一的設計語言和交互規範

## 📱 重新聚焦：純移動端聊天式點餐系統

### 核心理念
**簡單、直觀、專注於對話式點餐體驗**

### 設計原則
1. **Mobile-First Only** - 完全放棄桌面端考量
2. **Chat-Centric Design** - 以聊天對話為核心交互方式
3. **Minimal UI Elements** - 最小化UI元素，專注內容
4. **Progressive Enhancement** - 逐步增強功能，不求大而全

## 🏗️ 技術架構重新規劃

### 前端框架
```
Next.js 14 + TypeScript
├── 保持現有的 App Router 結構
└── 移除所有複雜的UI組件庫依賴
```

### CSS 策略
```
簡化的 Tailwind CSS 配置
├── 使用基礎的 Tailwind CSS 3.4 (已驗證穩定)
├── 自定義minimal配置，避免複雜的擴展
├── 專注於移動端響應式設計
└── 統一的色彩系統和間距規範
```

### 狀態管理
```
React內建狀態管理
├── useState - 本地組件狀態
├── useContext - 全局狀態（購物車、用戶信息）
└── 避免複雜的狀態管理庫
```

## 🎨 UI/UX 設計規範

### 界面結構 (單一頁面應用)
```
┌─────────────────────┐
│   Header (固定)      │ 60px
│   [Logo] [Profile]   │
├─────────────────────┤
│                     │
│                     │
│   Messages Area     │ flex-1
│   (可滾動對話區域)     │ scroll
│                     │
│                     │
├─────────────────────┤
│   Input Bar (固定)   │ 80px
│   [Text Input] [送出] │
├─────────────────────┤
│   Action Bar (固定)  │ 70px
│   [🛒 Cart] [📅 訂位] │
└─────────────────────┘
```

### 色彩系統
```css
Primary: Orange-Red Gradient (#FF6B35 → #FF8E3C)
Secondary: Blue (#3B82F6)
Background: Light Gray (#F8FAFC)
Text: Dark Gray (#1E293B)
Success: Green (#10B981)
Warning: Amber (#F59E0B)
```

### 字體系統
```css
大標題: text-2xl font-bold (24px)
標題: text-xl font-semibold (20px) 
內文: text-base (16px)
小字: text-sm (14px)
按鈕: text-lg font-medium (18px)
```

## 🚀 開發階段規劃

### Phase 1: 基礎聊天界面 (Week 1)
- [ ] 重新建立乾淨的頁面結構
- [ ] 實現基本的聊天對話界面
- [ ] 建立穩定的CSS基礎設施
- [ ] 測試移動端響應式設計

### Phase 2: AI助手對話 (Week 2)
- [ ] 集成A-Li阿狸AI助手
- [ ] 實現對話式點餐流程
- [ ] 建立菜單推薦系統
- [ ] 測試對話體驗流暢度

### Phase 3: 購物車功能 (Week 3)
- [ ] 實現購物車狀態管理
- [ ] 建立簡潔的購物車界面
- [ ] 集成訂單確認流程
- [ ] 測試購買體驗

### Phase 4: 訂位系統 (Week 4)
- [ ] 建立訂位預約界面
- [ ] 實現日期時間選擇
- [ ] 集成確認通知系統
- [ ] 完整功能測試

## 📝 文件結構規劃

```
app/
├── page.tsx                 # 主聊天界面 (單一頁面)
├── globals.css             # 全局樣式 (minimal)
├── layout.tsx              # 根布局
├── components/
│   ├── ChatMessage.tsx     # 對話氣泡組件
│   ├── ChatInput.tsx       # 輸入框組件
│   ├── CartModal.tsx       # 購物車彈窗
│   ├── ReservationModal.tsx # 訂位彈窗
│   └── MenuCard.tsx        # 菜單卡片
├── hooks/
│   ├── useCart.tsx         # 購物車狀態
│   └── useChat.tsx         # 聊天狀態
└── types/
    └── index.ts            # TypeScript 類型定義
```

## 🎯 成功指標

### 技術指標
- [ ] CSS 零衝突，樣式穩定
- [ ] 移動端響應式 100% 正常
- [ ] 頁面載入時間 < 2秒
- [ ] 交互響應時間 < 200ms

### 用戶體驗指標
- [ ] 聊天對話流程直觀易懂
- [ ] 點餐操作步驟 < 3步完成
- [ ] 界面元素不重疊、不遮擋
- [ ] 所有功能在移動端測試通過

## 🚨 避免的陷阱

### 技術陷阱
❌ 不使用複雜的UI庫 (Material-UI, Ant Design等)  
❌ 不混合多種CSS框架  
❌ 不使用實驗性的CSS功能  
❌ 不同時開發多個界面版本  

### 設計陷阱
❌ 不模仿桌面端設計模式  
❌ 不實現過度複雜的動畫效果  
❌ 不在移動端使用過小的觸控元素  
❌ 不實現不必要的功能特性  

## 📋 下一步行動

1. **立即執行**：建立新的乾淨頁面結構
2. **重點測試**：確保CSS穩定性和移動端適配
3. **逐步開發**：按階段規劃逐步添加功能
4. **持續驗證**：每個階段都進行移動端實測

---

**備注**：此文件將作為開發過程中的北極星，所有技術決策都應該回歸到這些核心目標和原則。
