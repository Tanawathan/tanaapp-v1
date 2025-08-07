# 資料庫架構管理指南

## 概述

本專案使用自動化工具來管理和同步 Supabase 資料庫架構，確保在開發過程中始終使用真實的資料庫格式和命名規範。

## 🛠️ 可用工具

### 1. 資料庫內省工具 (`db:introspect`)

```bash
npm run db:introspect
```

**功能：**
- 連接到 Supabase 資料庫
- 獲取所有資料表結構
- 生成 TypeScript 類型定義
- 創建 Markdown 文檔
- 保存完整的 JSON 架構

**生成的檔案：**
- `docs/database/schema-introspection.json` - 完整資料庫架構 JSON
- `docs/database/database-types.ts` - TypeScript 介面定義
- `docs/database/current-schema.md` - 可讀性資料庫文檔

### 2. 資料庫變更檢測工具 (`db:check`)

```bash
npm run db:check
```

**功能：**
- 檢測資料庫架構變更
- 比較當前架構與本地記錄
- 自動更新文檔（如有變更）

### 3. 資料庫監控工具 (`db:watch`)

```bash
npm run db:watch
```

**功能：**
- 持續監控資料庫架構變更
- 每 5 分鐘自動檢查一次
- 實時更新本地文檔

## 📊 當前資料庫結構

基於最新的內省結果，我們的資料庫包含以下資料表：

### 核心業務表

1. **restaurants** - 餐廳基本資訊
   - `id` (uuid) - 餐廳唯一識別碼
   - `name` (text) - 餐廳名稱
   - `address`, `phone`, `email` - 聯絡資訊
   - `tax_rate`, `service_charge_rate` - 費率設定
   - `currency`, `timezone` - 區域設定

2. **categories** - 菜品分類
   - `id` (uuid) - 分類唯一識別碼
   - `restaurant_id` (uuid) - 所屬餐廳
   - `name`, `description` - 基本資訊
   - `sort_order`, `color`, `icon` - 顯示設定

3. **orders** - 訂單主表
   - `id` (uuid) - 訂單唯一識別碼
   - `restaurant_id` (uuid) - 所屬餐廳
   - `table_id` (uuid) - 所屬桌號
   - `status` (text) - 訂單狀態
   - `total_amount` (decimal) - 訂單總金額

4. **order_items** - 訂單項目
   - `id` (uuid) - 項目唯一識別碼
   - `order_id` (uuid) - 所屬訂單
   - `menu_item_id` (uuid) - 菜品ID
   - `quantity` (integer) - 數量
   - `unit_price` (decimal) - 單價

5. **tables** - 餐桌管理
   - `id` (uuid) - 餐桌唯一識別碼
   - `restaurant_id` (uuid) - 所屬餐廳
   - `table_number` (text) - 桌號
   - `capacity` (integer) - 容量
   - `status` (text) - 桌台狀態

6. **payments** - 支付記錄
   - `id` (uuid) - 支付唯一識別碼
   - `order_id` (uuid) - 所屬訂單
   - `amount` (decimal) - 支付金額
   - `method` (text) - 支付方式
   - `status` (text) - 支付狀態

7. **suppliers** - 供應商管理
   - `id` (uuid) - 供應商唯一識別碼
   - `restaurant_id` (uuid) - 所屬餐廳
   - `name`, `contact_person` - 基本資訊
   - `phone`, `email`, `address` - 聯絡資訊

## 💻 開發最佳實踐

### 1. 使用標準化資料庫服務

```typescript
import { DatabaseService, TABLES } from '@/docs/database/database-service';
import * as DatabaseTypes from '@/docs/database/database-types';

// ✅ 好的做法 - 使用類型安全的服務
const restaurants = await DatabaseService.getRestaurants();

// ✅ 好的做法 - 使用預定義的資料表常數
const query = supabase.from(TABLES.RESTAURANTS);

// ❌ 不好的做法 - 硬編碼資料表名稱
const query = supabase.from('restaurants');
```

### 2. 使用 TypeScript 類型

```typescript
// ✅ 好的做法 - 使用生成的類型
const createRestaurant = async (data: DatabaseTypes.RestaurantsInsert) => {
  return DatabaseService.createRestaurant(data);
};

// ✅ 好的做法 - 明確的返回類型
const getRestaurant = async (id: string): Promise<DatabaseTypes.Restaurants | null> => {
  const { data } = await DatabaseService.getRestaurantById(id);
  return data;
};
```

### 3. 命名規範

- **資料表名稱**: 使用複數形式，snake_case（如：`order_items`）
- **欄位名稱**: 使用 snake_case（如：`created_at`）
- **TypeScript 介面**: 使用 PascalCase（如：`RestaurantsInsert`）
- **常數**: 使用 UPPER_SNAKE_CASE（如：`TABLES.RESTAURANTS`）

### 4. 開發流程

1. **開始開發前**：
   ```bash
   npm run db:check
   ```

2. **開發新功能時**：
   - 使用 `DatabaseService` 中的方法
   - 引用 `database-types.ts` 中的類型
   - 使用 `TABLES` 常數來引用資料表

3. **資料庫結構變更後**：
   ```bash
   npm run db:introspect
   ```

4. **部署前檢查**：
   ```bash
   npm run db:check
   ```

## 🔄 自動化工作流程

### Git Hooks 整合

建議在 `package.json` 中添加：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run db:check"
    }
  }
}
```

### CI/CD 整合

在部署流程中添加資料庫檢查：

```yaml
- name: Check Database Schema
  run: npm run db:check
  
- name: Validate Types
  run: npx tsc --noEmit --project tsconfig.json
```

## 📈 監控與維護

### 定期檢查

- **每日**：執行 `npm run db:check` 確保架構同步
- **每週**：檢查 `current-schema.md` 確保文檔準確性
- **每月**：檢視資料庫效能和架構優化機會

### 故障排除

如果遇到架構不一致的問題：

1. 檢查環境變數設定
2. 執行 `npm run db:introspect` 強制更新
3. 檢查 Supabase 連線狀態
4. 驗證資料庫權限設定

## 🎯 下一步計劃

- [ ] 整合資料庫遷移工具
- [ ] 添加資料驗證規則
- [ ] 建立效能監控指標
- [ ] 實現自動化測試資料生成
- [ ] 整合 API 文檔自動生成

---

**最後更新**: ${new Date().toLocaleDateString('zh-TW')}  
**維護者**: Tanawathan Development Team
