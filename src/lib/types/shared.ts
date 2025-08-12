// 從 TanaPOS 匯入的型別定義
// 這些型別與 TanaPOS 系統保持同步

export interface Restaurant {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  tax_rate?: number
  currency?: string
  timezone?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: string
  restaurant_id?: string
  name: string
  description?: string
  sort_order?: number
  color?: string
  icon?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: string
  restaurant_id?: string
  category_id?: string
  name: string
  description?: string
  sku?: string
  price: number
  cost?: number
  image_url?: string
  sort_order?: number
  is_available?: boolean
  is_active?: boolean
  actual_stock?: number
  virtual_stock?: number
  total_available?: number
  min_stock?: number
  preparation_time?: number
  created_at?: string
  updated_at?: string
  ai_popularity_score?: number
  ai_recommended?: boolean
  prep_time_minutes?: number
}

export interface ComboProduct {
  id: string
  name: string
  description?: string
  price: number
  combo_type: 'fixed' | 'selectable'
  is_available?: boolean
  preparation_time?: number
  created_at?: string
  updated_at?: string
  category_id?: string
}

export interface Table {
  id: string
  restaurant_id?: string
  table_number: string
  seats: number
  status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  qr_code?: string
  created_at?: string
  updated_at?: string
}

export interface Reservation {
  id: string
  restaurant_id: string
  table_id?: string | null
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  party_size: number
  reservation_date: string
  reservation_time: string
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show'
  special_requests?: string | null
  notes?: string | null
  created_via?: 'ai_chat' | 'manual' | 'phone' | 'website'
  confidence_score?: number | null
  created_at?: string
  updated_at?: string
  confirmed_at?: string | null
  seated_at?: string | null
  completed_at?: string | null
  cancelled_at?: string | null
  metadata?: any
}

export interface Order {
  id: string
  restaurant_id?: string
  table_id?: string
  customer_name?: string
  customer_phone?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_amount: number
  tax_amount?: number
  discount_amount?: number
  notes?: string
  order_type: 'dine_in' | 'takeaway' | 'delivery'
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  combo_id?: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
  created_at?: string
}

export interface Payment {
  id: string
  restaurant_id?: string
  order_id: string
  amount: number
  payment_method: 'cash' | 'card' | 'mobile_payment' | 'other'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

// AI 專用的增強型別
export interface AIMenuContext {
  categories: Category[]
  products: Product[]
  combos: ComboProduct[]
  popularItems: Product[]
  avgPreparationTime: number
  currentPromotions?: any[]
  dailySpecials?: Product[]
}

export interface AIRecommendation {
  productId: string
  productName: string
  reason: string
  confidence: number
  price: number
  preparationTime?: number
}

export interface AIOrderRequest {
  customerId?: string
  tableId?: string
  items: {
    productId?: string
    comboId?: string
    quantity: number
    notes?: string
  }[]
  specialRequests?: string
  estimatedTotal?: number
}

// API 回應型別
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    hasNextPage: boolean
  }
  error: string | null
}
