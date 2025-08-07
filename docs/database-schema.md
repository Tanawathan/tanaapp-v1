# 🗄️ TanaAPP v1.0 資料庫設計文檔

## 📊 資料庫概覽

### 基本資訊
- **資料庫類型**: PostgreSQL 15+
- **託管平台**: Supabase
- **連接方式**: 連接池 + SSL
- **備份策略**: 每日自動備份
- **地理位置**: 亞太地區 (最低延遲)

## 🏗️ 資料表設計

### 1. 餐廳基本資訊 (restaurants)
```sql
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    business_hours JSONB, -- {"monday": {"open": "09:00", "close": "22:00"}}
    settings JSONB, -- 餐廳設定 (稅率、服務費等)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. 菜單分類 (categories)
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    display_name JSONB, -- {"zh": "主餐", "en": "Main Dishes", "th": "อาหารจานหลัก"}
    description TEXT,
    display_order INTEGER DEFAULT 0,
    icon VARCHAR(50), -- 圖標名稱
    color VARCHAR(7), -- HEX 顏色代碼
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. 菜單項目 (menu_items)
```sql
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    display_name JSONB, -- 多語言名稱
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2), -- 成本價
    images JSONB, -- ["image1.jpg", "image2.jpg"]
    allergens JSONB, -- ["dairy", "nuts", "gluten"]
    nutritional_info JSONB, -- 營養資訊
    prep_time_minutes INTEGER DEFAULT 15,
    cooking_time_minutes INTEGER DEFAULT 0,
    total_time_minutes INTEGER GENERATED ALWAYS AS (prep_time_minutes + cooking_time_minutes) STORED,
    difficulty_level INTEGER DEFAULT 1, -- 1-5 難度等級
    spice_level INTEGER DEFAULT 0, -- 0-5 辣度等級
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false, -- 主推商品
    ai_recommended BOOLEAN DEFAULT false, -- AI 推薦
    display_order INTEGER DEFAULT 0,
    tags JSONB, -- ["popular", "new", "spicy"]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 套餐管理 (combo_items)
```sql
CREATE TABLE combo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_price DECIMAL(10,2) GENERATED ALWAYS AS (base_price - discount_amount) STORED,
    combo_rules JSONB, -- 套餐規則配置
    /*
    {
      "main_dish": {"required": 1, "category_ids": ["uuid1", "uuid2"]},
      "side_dish": {"required": 1, "category_ids": ["uuid3"]},
      "drink": {"required": 1, "category_ids": ["uuid4"]}
    }
    */
    total_time_minutes INTEGER DEFAULT 20,
    is_available BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. 桌台管理 (tables)
```sql
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(20) NOT NULL,
    table_name VARCHAR(100), -- 自定義名稱
    capacity INTEGER NOT NULL DEFAULT 4,
    location VARCHAR(100), -- 位置描述
    qr_code_url VARCHAR(500), -- QR Code 連結
    status VARCHAR(20) DEFAULT 'available', -- available, occupied, cleaning, reserved
    current_order_id UUID, -- 當前訂單 ID
    last_used_at TIMESTAMP WITH TIME ZONE,
    notes TEXT, -- 桌台備註
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. 訂單主表 (orders)
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    order_number VARCHAR(20) UNIQUE NOT NULL, -- 訂單編號
    order_type VARCHAR(20) DEFAULT 'dine_in', -- dine_in, takeout, delivery
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, preparing, ready, completed, cancelled
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(255),
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, partial, refunded
    payment_method VARCHAR(50), -- cash, card, mobile_pay
    special_requests TEXT,
    estimated_ready_time TIMESTAMP WITH TIME ZONE,
    actual_ready_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
```

### 7. 訂單明細 (order_items)
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    combo_item_id UUID REFERENCES combo_items(id) ON DELETE CASCADE, -- NULL for regular items
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    customizations JSONB, -- 客製化選項
    special_instructions TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served
    prep_started_at TIMESTAMP WITH TIME ZONE,
    prep_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. 庫存管理 (inventory)
```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER DEFAULT 5, -- 最低庫存警告
    maximum_stock INTEGER DEFAULT 100, -- 最大庫存
    unit VARCHAR(20) DEFAULT 'piece', -- piece, kg, liter
    cost_per_unit DECIMAL(10,2),
    supplier_info JSONB, -- 供應商資訊
    last_restocked_at TIMESTAMP WITH TIME ZONE,
    track_inventory BOOLEAN DEFAULT false, -- 是否追蹤庫存
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9. AI 對話記錄 (ai_conversations)
```sql
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    intent VARCHAR(100), -- 識別的意圖
    confidence_score DECIMAL(3,2), -- 信心分數 0.00-1.00
    context_data JSONB, -- 對話上下文
    response_time_ms INTEGER, -- 回應時間(毫秒)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔗 關聯關係圖

```
restaurants (1) ──┬── categories (N)
                  ├── menu_items (N)
                  ├── combo_items (N)
                  ├── tables (N)
                  ├── orders (N)
                  ├── inventory (N)
                  └── ai_conversations (N)

categories (1) ──── menu_items (N)

menu_items (1) ──┬── order_items (N)
                 └── inventory (1)

orders (1) ──┬── order_items (N)
             └── tables (1)

combo_items (1) ──── order_items (N)
```

## 🚀 效能優化

### 索引策略
```sql
-- 關鍵查詢索引
CREATE INDEX idx_menu_items_restaurant_category ON menu_items(restaurant_id, category_id);
CREATE INDEX idx_menu_items_available ON menu_items(restaurant_id, is_available, display_order);
CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, status, created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_tables_restaurant_status ON tables(restaurant_id, status);
CREATE INDEX idx_inventory_menu_item ON inventory(menu_item_id);

-- AI 查詢優化
CREATE INDEX idx_ai_conversations_session ON ai_conversations(session_id, created_at);
CREATE INDEX idx_ai_conversations_restaurant ON ai_conversations(restaurant_id, created_at);

-- 全文搜索索引
CREATE INDEX idx_menu_items_search ON menu_items USING gin(to_tsvector('english', name || ' ' || description));
```

### 分區策略
```sql
-- 訂單資料按月分區 (適合大量資料)
CREATE TABLE orders_2025_01 PARTITION OF orders
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE ai_conversations_2025_01 PARTITION OF ai_conversations
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

## 🔐 安全與權限

### Row Level Security (RLS)
```sql
-- 啟用 RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 權限政策範例
CREATE POLICY restaurant_policy ON menu_items
    FOR ALL USING (restaurant_id = current_setting('app.current_restaurant_id')::uuid);

CREATE POLICY order_access_policy ON orders
    FOR SELECT USING (
        restaurant_id = current_setting('app.current_restaurant_id')::uuid
        OR auth.uid() = customer_id
    );
```

### 敏感資料加密
```sql
-- 客戶個資加密
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 加密函數範例
CREATE OR REPLACE FUNCTION encrypt_customer_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(data, gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql;
```

## 📊 備份與災難復原

### 備份策略
```sql
-- 每日完整備份
pg_dump -h hostname -U username -d database_name > backup_$(date +%Y%m%d).sql

-- 增量備份 (WAL 歸檔)
archive_command = 'cp %p /backup/archive/%f'
```

### 監控查詢
```sql
-- 效能監控
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename IN ('menu_items', 'orders', 'order_items');

-- 慢查詢監控
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

---

**文檔版本**: v1.0  
**最後更新**: 2025年8月7日  
**資料庫版本**: PostgreSQL 15.x  
**維護者**: Tanawathan Development Team
