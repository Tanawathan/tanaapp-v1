-- 預約系統資料庫表創建腳本
-- 創建預約表 (reservations)

-- 1. 創建預約表
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    
    -- 客戶資訊
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    
    -- 預約詳情
    party_size INTEGER NOT NULL CHECK (party_size > 0 AND party_size <= 20),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    
    -- 狀態管理
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
    
    -- 額外資訊
    special_requests TEXT,
    notes TEXT,
    
    -- AI 相關欄位
    created_via VARCHAR(20) DEFAULT 'ai_chat' CHECK (created_via IN ('ai_chat', 'manual', 'phone', 'website')),
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    
    -- 時間戳記
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    seated_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- 元資料
    metadata JSONB DEFAULT '{}',
    
    -- 確保同一時間段不會重複預約同一桌
    CONSTRAINT unique_table_datetime UNIQUE (table_id, reservation_date, reservation_time)
);

-- 2. 創建索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON public.reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_table_id ON public.reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_phone ON public.reservations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON public.reservations(reservation_date, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON public.reservations(created_at);

-- 3. 創建更新時間戳記的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE
    ON public.reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. 創建 RLS 政策（Row Level Security）
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 允許所有用戶讀取預約資料（可根據需求調整）
CREATE POLICY "Anyone can view reservations" ON public.reservations
    FOR SELECT USING (true);

-- 允許所有用戶創建預約（可根據需求調整）
CREATE POLICY "Anyone can create reservations" ON public.reservations
    FOR INSERT WITH CHECK (true);

-- 允許所有用戶更新預約（可根據需求調整）
CREATE POLICY "Anyone can update reservations" ON public.reservations
    FOR UPDATE USING (true);

-- 5. 添加註釋
COMMENT ON TABLE public.reservations IS '餐廳預約系統表 - 記錄所有預約資訊';
COMMENT ON COLUMN public.reservations.customer_name IS '客戶姓名';
COMMENT ON COLUMN public.reservations.customer_phone IS '客戶電話（主要聯絡方式）';
COMMENT ON COLUMN public.reservations.party_size IS '用餐人數';
COMMENT ON COLUMN public.reservations.reservation_date IS '預約日期';
COMMENT ON COLUMN public.reservations.reservation_time IS '預約時間';
COMMENT ON COLUMN public.reservations.status IS '預約狀態：pending(待確認), confirmed(已確認), seated(已入座), completed(已完成), cancelled(已取消), no_show(未到)';
COMMENT ON COLUMN public.reservations.created_via IS '創建方式：ai_chat(AI聊天), manual(手動), phone(電話), website(網站)';
COMMENT ON COLUMN public.reservations.confidence_score IS 'AI 預約解析信心分數 (0.0-1.0)';

-- 6. 插入測試資料（可選）
DO $$
BEGIN
    -- 檢查是否有餐廳資料
    IF EXISTS (SELECT 1 FROM public.restaurants LIMIT 1) THEN
        -- 插入一些測試預約資料
        INSERT INTO public.reservations (
            restaurant_id,
            customer_name,
            customer_phone,
            party_size,
            reservation_date,
            reservation_time,
            status,
            special_requests,
            created_via
        ) VALUES 
        (
            (SELECT id FROM public.restaurants LIMIT 1),
            '測試客戶',
            '0912345678',
            4,
            CURRENT_DATE + INTERVAL '1 day',
            '18:00:00',
            'confirmed',
            '靠窗座位',
            'ai_chat'
        ),
        (
            (SELECT id FROM public.restaurants LIMIT 1),
            '王小明',
            '0923456789',
            2,
            CURRENT_DATE + INTERVAL '2 days',
            '19:30:00',
            'pending',
            '素食需求',
            'ai_chat'
        );
        
        RAISE NOTICE '✅ 已插入測試預約資料';
    ELSE
        RAISE NOTICE '⚠️  沒有找到餐廳資料，跳過測試資料插入';
    END IF;
END $$;

-- 完成訊息
DO $$
BEGIN
    RAISE NOTICE '🎉 預約系統資料庫表創建完成！';
    RAISE NOTICE '📋 已創建 reservations 表';
    RAISE NOTICE '🔍 已創建相關索引';
    RAISE NOTICE '🔒 已設置 RLS 政策';
    RAISE NOTICE '⏰ 已創建自動更新時間戳記觸發器';
END $$;
