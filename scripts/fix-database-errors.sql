-- 自動修復資料庫架構的腳本
-- 解決 Console 中顯示的欄位不存在錯誤

-- 1. 修復 ai_interactions 表 - 添加缺少的欄位
DO $$ 
BEGIN
    -- 檢查並添加 message_type 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'ai_interactions' 
                   AND column_name = 'message_type') THEN
        ALTER TABLE public.ai_interactions ADD COLUMN message_type VARCHAR(50) DEFAULT 'general';
        RAISE NOTICE 'Added message_type column to ai_interactions table';
    ELSE
        RAISE NOTICE 'message_type column already exists in ai_interactions table';
    END IF;

    -- 檢查並修復 context_data 欄位 (可能欄位名稱不同)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'ai_interactions' 
               AND column_name = 'context_data') THEN
        RAISE NOTICE 'context_data column already exists in ai_interactions table';
    ELSE
        RAISE NOTICE 'context_data column not found, checking if it needs to be added';
        -- 因為 context_data 在原始 SQL 中已存在，這可能是快取問題
        -- 先檢查是否已經存在但名稱略有不同
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'ai_interactions' 
                       AND column_name = 'context_data') THEN
            -- 如果真的不存在就添加
            ALTER TABLE public.ai_interactions ADD COLUMN context_data JSONB DEFAULT '{}';
            RAISE NOTICE 'Added context_data column to ai_interactions table';
        END IF;
    END IF;
END $$;

-- 2. 修復 customer_preferences 表 - 添加缺少的欄位
DO $$ 
BEGIN
    -- 檢查並添加 confidence_score 欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_preferences' 
                   AND column_name = 'confidence_score') THEN
        ALTER TABLE public.customer_preferences ADD COLUMN confidence_score DECIMAL(3,2) DEFAULT 0.8;
        RAISE NOTICE 'Added confidence_score column to customer_preferences table';
    ELSE
        RAISE NOTICE 'confidence_score column already exists in customer_preferences table';
    END IF;

    -- 檢查並添加 source 欄位 (CRM 管理器中使用)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_preferences' 
                   AND column_name = 'source') THEN
        ALTER TABLE public.customer_preferences ADD COLUMN source VARCHAR(50) DEFAULT 'chat_collection';
        RAISE NOTICE 'Added source column to customer_preferences table';
    ELSE
        RAISE NOTICE 'source column already exists in customer_preferences table';
    END IF;

    -- 檢查並添加 conversation_id 欄位 (CRM 管理器中使用)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_preferences' 
                   AND column_name = 'conversation_id') THEN
        ALTER TABLE public.customer_preferences ADD COLUMN conversation_id VARCHAR(255);
        RAISE NOTICE 'Added conversation_id column to customer_preferences table';
    ELSE
        RAISE NOTICE 'conversation_id column already exists in customer_preferences table';
    END IF;

    -- 檢查並添加 preference_type 欄位 (CRM 管理器中使用)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_preferences' 
                   AND column_name = 'preference_type') THEN
        ALTER TABLE public.customer_preferences ADD COLUMN preference_type VARCHAR(100) DEFAULT 'general';
        RAISE NOTICE 'Added preference_type column to customer_preferences table';
    ELSE
        RAISE NOTICE 'preference_type column already exists in customer_preferences table';
    END IF;

    -- 檢查並添加 preference_value 欄位 (CRM 管理器中使用)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customer_preferences' 
                   AND column_name = 'preference_value') THEN
        ALTER TABLE public.customer_preferences ADD COLUMN preference_value TEXT;
        RAISE NOTICE 'Added preference_value column to customer_preferences table';
    ELSE
        RAISE NOTICE 'preference_value column already exists in customer_preferences table';
    END IF;
END $$;

-- 3. 創建索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_ai_interactions_message_type ON public.ai_interactions(message_type);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_source ON public.customer_preferences(source);
CREATE INDEX IF NOT EXISTS idx_customer_preferences_type ON public.customer_preferences(preference_type);

-- 4. 刷新 Supabase 快取（這個需要重啟應用程式來生效）
COMMENT ON TABLE public.ai_interactions IS 'Updated with missing columns - ' || NOW();
COMMENT ON TABLE public.customer_preferences IS 'Updated with missing columns - ' || NOW();

-- 完成提示
DO $$ 
BEGIN
    RAISE NOTICE '=== 資料庫修復完成 ===';
    RAISE NOTICE '修復項目:';
    RAISE NOTICE '1. ai_interactions 表添加 message_type 欄位';
    RAISE NOTICE '2. ai_interactions 表確認 context_data 欄位';
    RAISE NOTICE '3. customer_preferences 表添加 confidence_score 欄位';
    RAISE NOTICE '4. customer_preferences 表添加 CRM 相關欄位';
    RAISE NOTICE '5. 創建相關索引提升效能';
    RAISE NOTICE '';
    RAISE NOTICE '請重新啟動應用程式以刷新 Supabase 快取';
END $$;
