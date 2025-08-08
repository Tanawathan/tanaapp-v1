import { createClient } from '@supabase/supabase-js'

// 環境變數檢查和預設值
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-key'

// 客戶端 Supabase 實例 (用於前端)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服務端 Supabase 實例 (具有完整權限)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 資料庫表格名稱常量
export const TABLES = {
  RESTAURANTS: 'restaurants',
  CATEGORIES: 'categories', 
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  RESERVATIONS: 'reservations',
  TABLES: 'tables'
} as const

// 資料庫工具類
export class DatabaseService {
  private client: typeof supabase

  constructor(useAdmin = false) {
    this.client = useAdmin ? supabaseAdmin : supabase
  }

  // 獲取餐廳資訊
  async getRestaurantInfo(restaurantId: string) {
    const { data, error } = await this.client
      .from(TABLES.RESTAURANTS)
      .select('*')
      .eq('id', restaurantId)
      .single()

    if (error) throw error
    return data
  }

  // 獲取菜品分類
  async getCategories(restaurantId: string, activeOnly = true) {
    let query = this.client
      .from(TABLES.CATEGORIES)
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order')

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  // 獲取產品/菜品
  async getProducts(restaurantId: string, categoryId?: string, availableOnly = true) {
    let query = this.client
      .from(TABLES.PRODUCTS)
      .select(`
        *,
        categories:category_id (name, icon, color)
      `)
      .eq('restaurant_id', restaurantId)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (availableOnly) {
      query = query.eq('is_available', true)
    }

    const { data, error } = await query.order('sort_order')
    if (error) throw error
    return data
  }

  // 創建訂單
  async createOrder(orderData: any) {
    const { data, error } = await this.client
      .from(TABLES.ORDERS)
      .insert(orderData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // 創建訂單項目
  async createOrderItems(orderItems: any[]) {
    const { data, error } = await this.client
      .from(TABLES.ORDER_ITEMS)
      .insert(orderItems)
      .select()

    if (error) throw error
    return data
  }

  // 獲取訂單
  async getOrder(orderId: string) {
    const { data, error } = await this.client
      .from(TABLES.ORDERS)
      .select(`
        *,
        order_items (
          *,
          products:product_id (name, price)
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error
    return data
  }

  // 創建預約
  async createReservation(reservationData: any) {
    const { data, error } = await this.client
      .from(TABLES.RESERVATIONS)
      .insert(reservationData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // 獲取可用桌位
  async getAvailableTables(partySize: number, reservationDate: string) {
    const { data, error } = await this.client
      .from(TABLES.TABLES)
      .select('*')
      .gte('capacity', partySize)
      .eq('status', 'available')
      .order('capacity')

    if (error) throw error
    return data
  }
}

// 資料庫查詢輔助函數
export const DatabaseHelpers = {
  // 格式化價格 (假設以分為單位儲存)
  formatPrice: (priceInCents: number) => {
    return `NT$ ${(priceInCents / 100).toLocaleString()}`
  },

  // 生成訂單號碼
  generateOrderNumber: () => {
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `ORD${timestamp}${random}`
  },

  // 格式化日期時間
  formatDateTime: (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  },

  // 訂單狀態中文對照
  getOrderStatusText: (status: string) => {
    const statusMap = {
      'pending': '待確認',
      'confirmed': '已確認',
      'preparing': '製作中',
      'ready': '準備完成',
      'served': '已出餐',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || status
  },

  // 預約狀態中文對照
  getReservationStatusText: (status: string) => {
    const statusMap = {
      'pending': '待確認',
      'confirmed': '已確認',
      'seated': '已入座',
      'completed': '已完成',
      'cancelled': '已取消',
      'no_show': '未到場'
    }
    return statusMap[status] || status
  }
}

export default DatabaseService
