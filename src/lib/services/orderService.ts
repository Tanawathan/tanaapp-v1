import { supabaseServer } from '../supabase/client'
import { Order, OrderItem, ApiResponse, AIOrderRequest } from '../types/shared'

export class OrderService {
  private static instance: OrderService
  private restaurantId: string

  constructor(restaurantId?: string) {
    this.restaurantId = restaurantId || process.env.RESTAURANT_ID || '550e8400-e29b-41d4-a716-446655440000'
  }

  static getInstance(restaurantId?: string): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService(restaurantId)
    }
    return OrderService.instance
  }

  /**
   * 創建新訂單 (AI 專用)
   */
  async createOrder(orderRequest: AIOrderRequest): Promise<ApiResponse<Order>> {
    try {
      // 計算總金額
      let totalAmount = 0
      const orderItems: Omit<OrderItem, 'id' | 'order_id'>[] = []

      for (const item of orderRequest.items) {
        let unitPrice = 0
        
        if (item.productId) {
          const { data: product } = await supabaseServer
            .from('products')
            .select('price')
            .eq('id', item.productId)
            .single()
          
          if (product) {
            unitPrice = product.price
          }
        } else if (item.comboId) {
          const { data: combo } = await supabaseServer
            .from('combo_products')
            .select('price')
            .eq('id', item.comboId)
            .single()
          
          if (combo) {
            unitPrice = combo.price
          }
        }

        const itemTotal = unitPrice * item.quantity
        totalAmount += itemTotal

        orderItems.push({
          product_id: item.productId,
          combo_id: item.comboId,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: itemTotal,
          notes: item.notes,
          created_at: new Date().toISOString()
        })
      }

      // 創建訂單
      const { data: order, error: orderError } = await supabaseServer
        .from('orders')
        .insert({
          restaurant_id: this.restaurantId,
          table_id: orderRequest.tableId,
          customer_name: '線上顧客',
          status: 'pending',
          total_amount: totalAmount,
          order_type: 'dine_in',
          notes: orderRequest.specialRequests,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 創建訂單項目
      const orderItemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: order.id
      }))

      const { error: itemsError } = await supabaseServer
        .from('order_items')
        .insert(orderItemsWithOrderId)

      if (itemsError) throw itemsError

      return { data: order, error: null }
    } catch (error) {
      console.error('OrderService: 創建訂單失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取訂單詳情
   */
  async getOrderById(orderId: string): Promise<ApiResponse<Order & {
    order_items: (OrderItem & {
      products?: { name: string; price: number }
      combo_products?: { name: string; price: number }
    })[]
  }>> {
    try {
      const { data, error } = await supabaseServer
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, price),
            combo_products (name, price)
          )
        `)
        .eq('id', orderId)
        .eq('restaurant_id', this.restaurantId)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('OrderService: 獲取訂單詳情失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 更新訂單狀態
   */
  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  ): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabaseServer
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('restaurant_id', this.restaurantId)

      if (error) throw error

      return { data: true, error: null }
    } catch (error) {
      console.error('OrderService: 更新訂單狀態失敗:', error)
      return { data: false, error: (error as Error).message }
    }
  }

  /**
   * 獲取今日訂單列表
   */
  async getTodayOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error } = await supabaseServer
        .from('orders')
        .select('*')
        .eq('restaurant_id', this.restaurantId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('OrderService: 獲取今日訂單失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取進行中的訂單
   */
  async getActiveOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await supabaseServer
        .from('orders')
        .select('*')
        .eq('restaurant_id', this.restaurantId)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: true })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('OrderService: 獲取進行中訂單失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取訂單統計 (AI 專用)
   */
  async getOrderStats(): Promise<ApiResponse<{
    todayTotal: number
    activeOrders: number
    avgOrderValue: number
    popularItems: string[]
    busyHours: string[]
  }>> {
    try {
      const [todayOrdersRes, activeOrdersRes] = await Promise.all([
        this.getTodayOrders(),
        this.getActiveOrders()
      ])

      if (todayOrdersRes.error) throw new Error(todayOrdersRes.error)
      if (activeOrdersRes.error) throw new Error(activeOrdersRes.error)

      const todayOrders = todayOrdersRes.data || []
      const activeOrders = activeOrdersRes.data || []

      const todayTotal = todayOrders.length
      const activeOrderCount = activeOrders.length
      const avgOrderValue = todayOrders.length > 0 
        ? todayOrders.reduce((sum, order) => sum + order.total_amount, 0) / todayOrders.length
        : 0

      return {
        data: {
          todayTotal,
          activeOrders: activeOrderCount,
          avgOrderValue: Math.round(avgOrderValue),
          popularItems: [], // 可以後續實作商品統計
          busyHours: [] // 可以後續實作時段分析
        },
        error: null
      }
    } catch (error) {
      console.error('OrderService: 獲取訂單統計失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 取消訂單
   */
  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabaseServer
        .from('orders')
        .update({
          status: 'cancelled',
          notes: reason ? `取消原因: ${reason}` : '已取消',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('restaurant_id', this.restaurantId)

      if (error) throw error

      return { data: true, error: null }
    } catch (error) {
      console.error('OrderService: 取消訂單失敗:', error)
      return { data: false, error: (error as Error).message }
    }
  }

  /**
   * 估算訂單準備時間
   */
  async estimatePreparationTime(orderRequest: AIOrderRequest): Promise<ApiResponse<number>> {
    try {
      let totalTime = 0

      for (const item of orderRequest.items) {
        let prepTime = 15 // 預設 15 分鐘

        if (item.productId) {
          const { data: product } = await supabaseServer
            .from('products')
            .select('preparation_time')
            .eq('id', item.productId)
            .single()
          
          if (product?.preparation_time) {
            prepTime = product.preparation_time
          }
        } else if (item.comboId) {
          const { data: combo } = await supabaseServer
            .from('combo_products')
            .select('preparation_time')
            .eq('id', item.comboId)
            .single()
          
          if (combo?.preparation_time) {
            prepTime = combo.preparation_time
          }
        }

        // 數量影響準備時間，但不是線性關係
        totalTime = Math.max(totalTime, prepTime + (item.quantity - 1) * 2)
      }

      return { data: totalTime, error: null }
    } catch (error) {
      console.error('OrderService: 估算準備時間失敗:', error)
      return { data: 15, error: (error as Error).message } // 返回預設時間
    }
  }
}
