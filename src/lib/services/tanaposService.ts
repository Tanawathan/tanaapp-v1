import { MenuService } from './menuService'
import { RestaurantService } from './restaurantService'
import { OrderService } from './orderService'
import { ApiResponse, AIMenuContext, AIOrderRequest, AIRecommendation } from '../types/shared'

/**
 * TanaPOS 整合服務 - 為 AI 助手「阿狸」提供統一的介面
 */
export class TanaPOSService {
  private static instance: TanaPOSService
  private menuService: MenuService
  private restaurantService: RestaurantService
  private orderService: OrderService

  constructor(restaurantId?: string) {
    this.menuService = MenuService.getInstance(restaurantId)
    this.restaurantService = RestaurantService.getInstance(restaurantId)
    this.orderService = OrderService.getInstance(restaurantId)
  }

  static getInstance(restaurantId?: string): TanaPOSService {
    if (!TanaPOSService.instance) {
      TanaPOSService.instance = new TanaPOSService(restaurantId)
    }
    return TanaPOSService.instance
  }

  /**
   * 獲取完整的 AI 上下文資訊
   * 包含菜單、餐廳狀態、統計資料等
   */
  async getAIContext(): Promise<ApiResponse<{
    menu: AIMenuContext
    restaurant: {
      info: any
      isOpen: boolean
      stats: any
      operatingHours: any
    }
    orders: {
      stats: any
      activeCount: number
    }
  }>> {
    try {
      // 並行獲取所有需要的資料
      const [menuRes, restaurantInfoRes, restaurantStatsRes, isOpenRes, hoursRes, orderStatsRes] = await Promise.all([
        this.menuService.getMenuForAI(),
        this.restaurantService.getRestaurantInfo(),
        this.restaurantService.getRestaurantStats(),
        this.restaurantService.isOpen(),
        this.restaurantService.getOperatingHours(),
        this.orderService.getOrderStats()
      ])

      // 檢查錯誤
      if (menuRes.error) throw new Error(`Menu error: ${menuRes.error}`)
      if (restaurantInfoRes.error) throw new Error(`Restaurant info error: ${restaurantInfoRes.error}`)

      const context = {
        menu: menuRes.data!,
        restaurant: {
          info: restaurantInfoRes.data,
          isOpen: isOpenRes.data || false,
          stats: restaurantStatsRes.data || null,
          operatingHours: hoursRes.data || null
        },
        orders: {
          stats: orderStatsRes.data || null,
          activeCount: orderStatsRes.data?.activeOrders || 0
        }
      }

      return { data: context, error: null }
    } catch (error) {
      console.error('TanaPOSService: 獲取 AI 上下文失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * AI 智能商品推薦
   */
  async getAIRecommendations(
    preferences?: string[],
    budget?: number,
    partySize?: number
  ): Promise<ApiResponse<AIRecommendation[]>> {
    try {
      const menuRes = await this.menuService.getMenuForAI()
      if (menuRes.error || !menuRes.data) {
        throw new Error(menuRes.error || 'Failed to get menu')
      }

      const { products } = menuRes.data
      let recommendations: AIRecommendation[] = []

      // 基於預算篩選
      let filteredProducts = products
      if (budget) {
        filteredProducts = products.filter(p => p.price <= budget * 0.8) // 留一些餘裕
      }

      // 基於偏好推薦
      if (preferences && preferences.length > 0) {
        const preferenceProducts = filteredProducts.filter(p => 
          preferences.some(pref => 
            p.name.toLowerCase().includes(pref.toLowerCase()) ||
            p.description?.toLowerCase().includes(pref.toLowerCase())
          )
        )
        
        preferenceProducts.forEach(product => {
          recommendations.push({
            productId: product.id,
            productName: product.name,
            reason: '符合您的口味偏好',
            confidence: 0.9,
            price: product.price,
            preparationTime: product.preparation_time
          })
        })
      }

      // 推薦熱門商品
      const popularProducts = filteredProducts
        .filter(p => p.ai_recommended)
        .sort((a, b) => (b.ai_popularity_score || 0) - (a.ai_popularity_score || 0))
        .slice(0, 3)

      popularProducts.forEach(product => {
        if (!recommendations.find(r => r.productId === product.id)) {
          recommendations.push({
            productId: product.id,
            productName: product.name,
            reason: '店內熱門推薦',
            confidence: 0.8,
            price: product.price,
            preparationTime: product.preparation_time
          })
        }
      })

      // 基於人數推薦套餐
      if (partySize && partySize > 2) {
        const combosRes = await this.menuService.getCombos()
        if (combosRes.data) {
          combosRes.data.slice(0, 2).forEach(combo => {
            recommendations.push({
              productId: combo.id,
              productName: combo.name,
              reason: `適合 ${partySize} 人分享的套餐`,
              confidence: 0.7,
              price: combo.price,
              preparationTime: combo.preparation_time
            })
          })
        }
      }

      // 按信心度排序，最多返回 5 個推薦
      recommendations = recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5)

      return { data: recommendations, error: null }
    } catch (error) {
      console.error('TanaPOSService: AI 推薦失敗:', error)
      return { data: [], error: (error as Error).message }
    }
  }

  /**
   * 處理 AI 訂單請求
   */
  async processAIOrder(orderRequest: AIOrderRequest): Promise<ApiResponse<{
    order: any
    estimatedTime: number
    totalAmount: number
  }>> {
    try {
      // 先估算準備時間
      const timeRes = await this.orderService.estimatePreparationTime(orderRequest)
      
      // 建立訂單
      const orderRes = await this.orderService.createOrder(orderRequest)
      if (orderRes.error || !orderRes.data) {
        throw new Error(orderRes.error || 'Failed to create order')
      }

      return {
        data: {
          order: orderRes.data,
          estimatedTime: timeRes.data || 15,
          totalAmount: orderRes.data.total_amount
        },
        error: null
      }
    } catch (error) {
      console.error('TanaPOSService: 處理 AI 訂單失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 智能搜尋商品
   */
  async smartSearch(query: string): Promise<ApiResponse<{
    products: any[]
    suggestions: string[]
    categories: any[]
  }>> {
    try {
      // 搜尋商品
      const productsRes = await this.menuService.searchProducts(query)
      
      // 獲取相關分類
      const categoriesRes = await this.menuService.getCategories()
      const relatedCategories = categoriesRes.data?.filter(cat =>
        cat.name.toLowerCase().includes(query.toLowerCase())
      ) || []

      // 生成搜尋建議
      const suggestions = [
        '泰式咖哩',
        '炒河粉',
        '青木瓜沙拉',
        '椰汁雞湯',
        '芒果糯米飯'
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(suggestion.toLowerCase())
      )

      return {
        data: {
          products: productsRes.data || [],
          suggestions,
          categories: relatedCategories
        },
        error: null
      }
    } catch (error) {
      console.error('TanaPOSService: 智能搜尋失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取餐廳即時狀態
   */
  async getRestaurantStatus(): Promise<ApiResponse<{
    isOpen: boolean
    busyLevel: 'low' | 'medium' | 'high'
    waitTime: number
    availableTables: number
    todayOrders: number
  }>> {
    try {
      const [isOpenRes, statsRes, orderStatsRes] = await Promise.all([
        this.restaurantService.isOpen(),
        this.restaurantService.getRestaurantStats(),
        this.orderService.getOrderStats()
      ])

      const busyLevel = statsRes.data?.busyLevel || 'low'
      
      // 根據忙碌程度估算等待時間
      let waitTime = 5 // 基礎等待時間
      if (busyLevel === 'medium') waitTime = 15
      else if (busyLevel === 'high') waitTime = 30

      return {
        data: {
          isOpen: isOpenRes.data || false,
          busyLevel,
          waitTime,
          availableTables: statsRes.data?.availableTables || 0,
          todayOrders: orderStatsRes.data?.todayTotal || 0
        },
        error: null
      }
    } catch (error) {
      console.error('TanaPOSService: 獲取餐廳狀態失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 查詢訂單狀態
   */
  async checkOrderStatus(orderId: string): Promise<ApiResponse<{
    order: any
    status: string
    estimatedReady?: string
    canCancel: boolean
  }>> {
    try {
      const orderRes = await this.orderService.getOrderById(orderId)
      if (orderRes.error || !orderRes.data) {
        throw new Error(orderRes.error || 'Order not found')
      }

      const order = orderRes.data
      const canCancel = ['pending', 'confirmed'].includes(order.status)
      
      let estimatedReady: string | undefined
      if (order.status === 'preparing') {
        const readyTime = new Date()
        readyTime.setMinutes(readyTime.getMinutes() + 10) // 估算還需要 10 分鐘
        estimatedReady = readyTime.toLocaleTimeString('zh-TW', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }

      return {
        data: {
          order,
          status: order.status,
          estimatedReady,
          canCancel
        },
        error: null
      }
    } catch (error) {
      console.error('TanaPOSService: 查詢訂單狀態失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }
}
