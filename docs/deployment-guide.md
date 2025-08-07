# 🚀 TanaAPP v1.0 部署指南

## 📋 部署概覽

本指南將協助您將 TanaAPP v1.0 部署到生產環境，包含前端應用、資料庫設置、第三方服務配置等完整流程。

## 🎯 部署架構

```
Internet
    │
    ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Vercel      │    │    Supabase     │    │     OpenAI      │
│   (Frontend)    │◄──►│   (Database)    │    │   (AI Service)  │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Next.js App   │    │ • PostgreSQL    │    │ • GPT-4 API     │
│ • API Routes    │    │ • Auth Service  │    │ • Embeddings    │
│ • Edge Cache    │    │ • Real-time     │    │ • Moderation    │
│ • CDN Global    │    │ • File Storage  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ 前置需求

### 系統需求
- Node.js 18.0+ LTS
- npm 或 yarn 套件管理器
- Git 版本控制

### 必要帳戶
- [Vercel](https://vercel.com) 帳戶 (前端部署)
- [Supabase](https://supabase.com) 帳戶 (後端服務)
- [OpenAI](https://platform.openai.com) 帳戶 (AI 服務)
- GitHub/GitLab 帳戶 (代碼託管)

## 📦 專案準備

### 1. 複製專案範本
```bash
# 複製現有的 tana-ai-chat 專案作為基礎
cp -r C:\TanaAPP\tana-ai-chat C:\TanaAPP\tanaapp-v1-production

cd C:\TanaAPP\tanaapp-v1-production
```

### 2. 更新專案配置
```json
// package.json
{
  "name": "tanaapp-v1",
  "version": "1.0.0",
  "description": "TanaAPP v1.0 - Professional Restaurant Management System",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "analyze": "cross-env ANALYZE=true next build"
  }
}
```

### 3. 環境變數設置
```bash
# .env.local (開發環境)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key

# 生產環境變數
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 🗄️ Supabase 設置

### 1. 建立新專案
```bash
# 使用 Supabase CLI (可選)
npx supabase login
npx supabase init
npx supabase start
```

### 2. 資料庫結構建立
```sql
-- 執行資料庫遷移腳本
-- 1. 建立 restaurants 表
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    -- ... (詳見 database-schema.md)
);

-- 2. 建立其他必要資料表
-- 執行完整的 SQL 腳本 (參考 database-schema.md)
```

### 3. RLS 權限設置
```sql
-- 啟用 Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 建立安全政策
CREATE POLICY "Users can only access their restaurant's data" ON restaurants
  FOR ALL USING (id = current_setting('app.current_restaurant_id')::uuid);
```

### 4. 初始資料載入
```sql
-- 載入示範餐廳資料
INSERT INTO restaurants (id, name, slug) VALUES 
('11111111-1111-1111-1111-111111111111', 'TanawatThai', 'tanawat-thai');

-- 載入菜單分類和商品資料
-- (使用現有的測試資料或匯入正式資料)
```

## 🌐 Vercel 部署

### 1. 連結 Git 儲存庫
```bash
# 建立 Git 儲存庫
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/yourusername/tanaapp-v1.git
git push -u origin main
```

### 2. Vercel 專案設置
1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點選 "New Project"
3. 匯入 GitHub 儲存庫
4. 配置建構設置：

```javascript
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["hkg1", "sin1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 3. 環境變數設置
在 Vercel Dashboard 中設置：
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
NEXT_PUBLIC_APP_ENV=production
```

### 4. 自訂網域設置
```bash
# 在 Vercel Dashboard 中：
# 1. 前往 Settings > Domains  
# 2. 新增自訂網域 (例如: app.tanawatthai.com)
# 3. 配置 DNS 記錄指向 Vercel
```

## 🔧 進階配置

### 1. Next.js 最佳化設置
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['supabase.co', 'your-domain.com'],
    formats: ['image/webp', 'image/avif']
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  // 生產環境最佳化
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true,
    },
    experimental: {
      optimizeCss: true,
      turbo: true
    }
  })
};

export default nextConfig;
```

### 2. 快取策略設置
```typescript
// src/lib/cache-config.ts
export const cacheConfig = {
  defaultTTL: process.env.NODE_ENV === 'production' ? 300 : 60, // 5分鐘 vs 1分鐘
  maxSize: 1000,
  updateInterval: process.env.NODE_ENV === 'production' ? 300000 : 60000,
  
  // Redis 配置 (可選)
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  }
};
```

### 3. 監控與日誌設置
```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development'
});
```

## 📊 效能優化

### 1. 圖片優化
```typescript
// src/components/OptimizedImage.tsx
import Image from 'next/image';

export function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      quality={85}
      formats={['image/webp', 'image/avif']}
      {...props}
    />
  );
}
```

### 2. 資料載入優化
```typescript
// src/lib/data-loader.ts
import { unstable_cache } from 'next/cache';

export const getCachedMenuData = unstable_cache(
  async (restaurantId: string) => {
    return await fetchMenuData(restaurantId);
  },
  ['menu-data'],
  {
    revalidate: 300, // 5分鐘快取
    tags: ['menu']
  }
);
```

### 3. 代碼分割
```typescript
// 動態匯入大型組件
const KDSDisplay = dynamic(() => import('./KDSDisplay'), {
  loading: () => <div>載入中...</div>
});

const AdminPanel = dynamic(() => import('./AdminPanel'), {
  ssr: false
});
```

## 🔒 安全性設置

### 1. 內容安全政策 (CSP)
```javascript
// next.config.mjs
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      connect-src 'self' https://api.openai.com https://*.supabase.co;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 2. API 限流
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  return NextResponse.next();
}
```

## 🧪 測試與品質保證

### 1. 自動化測試設置
```bash
# 安裝測試依賴
npm install -D jest @testing-library/react @testing-library/jest-dom

# 執行測試
npm run test
```

### 2. E2E 測試
```typescript
// tests/e2e/ordering-flow.test.ts
import { test, expect } from '@playwright/test';

test('用戶可以完成點餐流程', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="chat-input"]', '我要點餐');
  await page.click('[data-testid="send-button"]');
  
  await expect(page.locator('[data-testid="menu-response"]')).toBeVisible();
});
```

### 3. 效能測試
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

## 📈 監控與維護

### 1. Vercel Analytics
```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. 健康檢查端點
```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = await Promise.all([
    checkDatabase(),
    checkAI(),
    checkCache()
  ]);

  const isHealthy = checks.every(check => check.status === 'ok');

  return Response.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  }, {
    status: isHealthy ? 200 : 503
  });
}
```

### 3. 定期維護腳本
```bash
#!/bin/bash
# scripts/maintenance.sh

# 資料庫清理
npx supabase db clean

# 快取清除
redis-cli FLUSHDB

# 日誌輪轉
logrotate /etc/logrotate.conf
```

## 🎯 部署檢查清單

### 部署前檢查
- [ ] 所有環境變數已設置
- [ ] 資料庫遷移已執行
- [ ] RLS 政策已啟用
- [ ] 測試通過 (單元測試 + E2E 測試)
- [ ] 效能測試通過
- [ ] 安全性掃描完成

### 部署後驗證
- [ ] 健康檢查端點回應正常
- [ ] AI 聊天功能正常
- [ ] 菜單載入正常
- [ ] 訂單流程完整
- [ ] 即時通訊功能正常
- [ ] 監控系統運作正常

### 備份與回滾準備
- [ ] 資料庫備份已建立
- [ ] 回滾計劃已準備
- [ ] 緊急聯絡方式已確認

## 🆘 故障排除

### 常見問題
1. **建構失敗**: 檢查 Node.js 版本和依賴衝突
2. **資料庫連接失敗**: 驗證 Supabase 連接字串
3. **AI API 錯誤**: 檢查 OpenAI API 金鑰和額度
4. **快取問題**: 清除 Vercel 邊緣快取

### 緊急回滾
```bash
# Vercel 回滾到上一版本
vercel rollback
```

---

**部署指南版本**: v1.0  
**最後更新**: 2025年8月7日  
**適用版本**: TanaAPP v1.0  
**維護者**: Tanawathan Development Team
