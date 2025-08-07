# 🍽️ TanaAPP v1.0 - 專業餐廳管理系統

## 📋 專案概述

TanaAPP v1.0 是一個為 TanawatThai 餐廳打造的綜合性管理系統，結合了 AI 智能點餐、KDS 廚房顯示系統、桌台管理等多功能模組。

### 🎯 核心目標
- 提升餐廳營運效率
- 優化顧客用餐體驗  
- 整合前後台管理流程
- 建立智能化服務系統

## 🏗️ 技術架構

### 前端技術棧
- **Framework**: Next.js 14.2.31 (App Router)
- **語言**: TypeScript
- **樣式**: TailwindCSS + Framer Motion
- **UI 組件**: Headless UI + Heroicons
- **狀態管理**: Zustand
- **表單處理**: React Hook Form

### 後端與資料庫
- **資料庫**: Supabase PostgreSQL
- **認證**: Supabase Auth
- **即時通訊**: Supabase Realtime
- **API**: Next.js API Routes
- **AI 服務**: OpenAI GPT-4

### 開發工具
- **版本控制**: Git
- **代碼規範**: ESLint + Prettier
- **建構工具**: Next.js Build System
- **部署**: Vercel (推薦)

## 📦 專案結構

```
tanaapp-v1/
├── docs/                      # 文檔資料夾
│   ├── architecture.md       # 系統架構文檔
│   ├── database-schema.md    # 資料庫設計
│   ├── api-reference.md      # API 文檔
│   └── deployment-guide.md   # 部署指南
├── src/
│   ├── app/                  # Next.js App Router
│   ├── components/           # React 組件
│   ├── lib/                 # 核心邏輯庫
│   ├── types/               # TypeScript 類型定義
│   └── styles/              # 樣式檔案
├── public/                  # 靜態資源
├── tests/                   # 測試檔案
└── config/                  # 配置檔案
```

## 🚀 快速開始

### 環境要求
- Node.js 18.0+
- npm 或 yarn
- Supabase 帳戶
- OpenAI API 金鑰

### 安裝步驟
```bash
# 1. 複製專案
git clone [repository-url]
cd tanaapp-v1

# 2. 安裝依賴
npm install

# 3. 環境設定
cp .env.example .env.local
# 編輯 .env.local 填入必要的 API 金鑰

# 4. 啟動開發伺服器
npm run dev
```

## 📖 詳細文檔

- [系統架構文檔](./docs/architecture.md)
- [資料庫設計文檔](./docs/database-schema.md)
- [API 參考文檔](./docs/api-reference.md)
- [部署指南](./docs/deployment-guide.md)

## 🔧 開發指南

### 代碼規範
- 使用 TypeScript 嚴格模式
- 遵循 ESLint 規則
- 組件命名使用 PascalCase
- 檔案命名使用 kebab-case

### Git 工作流程
- `main` 分支：穩定版本
- `develop` 分支：開發版本
- `feature/*` 分支：功能開發
- `hotfix/*` 分支：緊急修復

## 📞 支援與聯絡

- **專案維護者**: Tanawathan
- **技術支援**: GitHub Issues
- **文檔更新**: 請提交 PR

---

**最後更新**: 2025年8月7日  
**版本**: v1.0.0  
**狀態**: 積極開發中 🚧
