import { supabaseServer } from '../supabase/client'
import { Restaurant, Table, ApiResponse } from '../types/shared'

export class RestaurantService {
  private static instance: RestaurantService
  private restaurantId: string

  constructor(restaurantId?: string) {
    this.restaurantId = restaurantId || process.env.RESTAURANT_ID || '550e8400-e29b-41d4-a716-446655440000'
  }

  static getInstance(restaurantId?: string): RestaurantService {
    if (!RestaurantService.instance) {
      RestaurantService.instance = new RestaurantService(restaurantId)
    }
    return RestaurantService.instance
  }

  /**
   * 獲取餐廳基本資訊
   */
  async getRestaurantInfo(): Promise<ApiResponse<Restaurant>> {
    try {
      const { data, error } = await supabaseServer
        .from('restaurants')
        .select('*')
        .eq('id', this.restaurantId)
        .eq('is_active', true)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('RestaurantService: 獲取餐廳資訊失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取桌位狀態
   */
  async getTablesStatus(): Promise<ApiResponse<Table[]>> {
    try {
      const { data, error } = await supabaseServer
        .from('tables')
        .select('*')
        .eq('restaurant_id', this.restaurantId)
        .order('table_number', { ascending: true })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('RestaurantService: 獲取桌位狀態失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取可用桌位
   */
  async getAvailableTables(seats?: number): Promise<ApiResponse<Table[]>> {
    try {
      let query = supabaseServer
        .from('tables')
        .select('*')
        .eq('restaurant_id', this.restaurantId)
        .eq('status', 'available')

      if (seats) {
        query = query.gte('seats', seats)
      }

      const { data, error } = await query.order('seats', { ascending: true })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('RestaurantService: 獲取可用桌位失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取桌位詳情
   */
  async getTableById(tableId: string): Promise<ApiResponse<Table>> {
    try {
      const { data, error } = await supabaseServer
        .from('tables')
        .select('*')
        .eq('id', tableId)
        .eq('restaurant_id', this.restaurantId)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('RestaurantService: 獲取桌位詳情失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 更新桌位狀態
   */
  async updateTableStatus(
    tableId: string, 
    status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  ): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabaseServer
        .from('tables')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .eq('restaurant_id', this.restaurantId)

      if (error) throw error

      return { data: true, error: null }
    } catch (error) {
      console.error('RestaurantService: 更新桌位狀態失敗:', error)
      return { data: false, error: (error as Error).message }
    }
  }

  /**
   * 獲取餐廳統計資訊 (AI 專用)
   */
  async getRestaurantStats(): Promise<ApiResponse<{
    totalTables: number
    availableTables: number
    occupiedTables: number
    averageSeats: number
    busyLevel: 'low' | 'medium' | 'high'
  }>> {
    try {
      const tablesResult = await this.getTablesStatus()
      if (tablesResult.error || !tablesResult.data) {
        throw new Error(tablesResult.error || 'Failed to get tables')
      }

      const tables = tablesResult.data
      const totalTables = tables.length
      const availableTables = tables.filter(t => t.status === 'available').length
      const occupiedTables = tables.filter(t => t.status === 'occupied').length
      const averageSeats = tables.reduce((sum, t) => sum + t.seats, 0) / totalTables

      let busyLevel: 'low' | 'medium' | 'high' = 'low'
      const occupancyRate = occupiedTables / totalTables
      if (occupancyRate > 0.8) busyLevel = 'high'
      else if (occupancyRate > 0.5) busyLevel = 'medium'

      return {
        data: {
          totalTables,
          availableTables,
          occupiedTables,
          averageSeats: Math.round(averageSeats),
          busyLevel
        },
        error: null
      }
    } catch (error) {
      console.error('RestaurantService: 獲取餐廳統計失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取營業時間資訊 (可以後續擴展到資料庫)
   */
  async getOperatingHours(): Promise<ApiResponse<{
    [key: string]: { open: string; close: string; closed?: boolean }
  }>> {
    try {
      // 目前先用硬編碼，之後可以移到資料庫
      const hours = {
        monday: { open: '10:00', close: '22:00' },
        tuesday: { open: '10:00', close: '22:00' },
        wednesday: { open: '10:00', close: '22:00' },
        thursday: { open: '10:00', close: '22:00' },
        friday: { open: '10:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '22:00' }
      }

      return { data: hours, error: null }
    } catch (error) {
      console.error('RestaurantService: 獲取營業時間失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 檢查是否在營業時間
   */
  async isOpen(): Promise<ApiResponse<boolean>> {
    try {
      const hoursResult = await this.getOperatingHours()
      if (hoursResult.error || !hoursResult.data) {
        throw new Error(hoursResult.error || 'Failed to get operating hours')
      }

      const now = new Date()
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const currentDay = dayNames[now.getDay()]
      
      const todayHours = hoursResult.data[currentDay]
      if (!todayHours || todayHours.closed) {
        return { data: false, error: null }
      }

      const currentTime = now.getHours() * 100 + now.getMinutes()
      const openTime = parseInt(todayHours.open.replace(':', ''))
      const closeTime = parseInt(todayHours.close.replace(':', ''))

      const isOpen = currentTime >= openTime && currentTime <= closeTime

      return { data: isOpen, error: null }
    } catch (error) {
      console.error('RestaurantService: 檢查營業時間失敗:', error)
      return { data: false, error: (error as Error).message }
    }
  }
}
