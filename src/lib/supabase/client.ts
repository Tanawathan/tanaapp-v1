import { createClient } from '@supabase/supabase-js'

// 從環境變數載入配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 客戶端 Supabase 實例 (用於 React 組件)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

// 伺服器端 Supabase 實例 (用於 API Routes，具有更高權限)
export const supabaseServer = createClient(
  supabaseUrl, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 資料庫連接健康檢查
export async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('restaurants').select('id').limit(1)
    if (error) throw error
    return { success: true, message: 'Database connection successful' }
  } catch (error) {
    return { 
      success: false, 
      message: `Database connection failed: ${(error as Error).message}` 
    }
  }
}
