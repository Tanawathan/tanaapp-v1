import { supabaseServer } from '../supabase/client'
import { Category, Product, ComboProduct, ApiResponse, AIMenuContext } from '../types/shared'

export class MenuService {
  private static instance: MenuService
  private restaurantId: string

  constructor(restaurantId?: string) {
    this.restaurantId = restaurantId || process.env.RESTAURANT_ID || '550e8400-e29b-41d4-a716-446655440000'
  }

  static getInstance(restaurantId?: string): MenuService {
    if (!MenuService.instance) {
      MenuService.instance = new MenuService(restaurantId)
    }
    return MenuService.instance
  }

  /**
   * 獲取所有分類
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const { data, error } = await supabaseServer
        .from('categories')
        .select('*')
        .eq('restaurant_id', this.restaurantId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('MenuService: 獲取分類失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取商品列表
   */
  async getProducts(categoryId?: string): Promise<ApiResponse<Product[]>> {
    try {
      let query = supabaseServer
        .from('products')
        .select('*')
        .eq('restaurant_id', this.restaurantId)
        .eq('is_active', true)
        .eq('is_available', true)

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query.order('sort_order', { ascending: true })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('MenuService: 獲取商品失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取套餐列表
   */
  async getCombos(): Promise<ApiResponse<ComboProduct[]>> {
    try {
      const { data, error } = await supabaseServer
        .from('combo_products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('MenuService: 獲取套餐失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 根據關鍵字搜尋商品 (AI 專用)
   */
  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await supabaseServer
        .from('products')
        .select('*')
        .eq('restaurant_id', this.restaurantId)
        .eq('is_active', true)
        .eq('is_available', true)
        .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
        .order('ai_popularity_score', { ascending: false, nullsFirst: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('MenuService: 搜尋商品失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取推薦商品
   */
  async getRecommendedProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const { data, error } = await supabaseServer
        .from('products')
        .select('*')
        .eq('restaurant_id', this.restaurantId)
        .eq('is_active', true)
        .eq('is_available', true)
        .eq('ai_recommended', true)
        .order('ai_popularity_score', { ascending: false })
        .limit(10)

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('MenuService: 獲取推薦商品失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 建構 AI 專用的菜單資訊
   */
  async getMenuForAI(): Promise<ApiResponse<AIMenuContext>> {
    try {
      // 並行獲取所有需要的資料
      const [categoriesRes, productsRes, combosRes, recommendedRes] = await Promise.all([
        this.getCategories(),
        this.getProducts(),
        this.getCombos(),
        this.getRecommendedProducts()
      ])

      // 檢查是否有錯誤
      if (categoriesRes.error) throw new Error(categoriesRes.error)
      if (productsRes.error) throw new Error(productsRes.error)
      if (combosRes.error) throw new Error(combosRes.error)
      if (recommendedRes.error) throw new Error(recommendedRes.error)

      // 計算平均備餐時間
      const products = productsRes.data || []
      const avgPreparationTime = products.length > 0 
        ? products.reduce((sum, p) => sum + (p.preparation_time || 15), 0) / products.length
        : 15

      const menuContext: AIMenuContext = {
        categories: categoriesRes.data || [],
        products: products,
        combos: combosRes.data || [],
        popularItems: recommendedRes.data || [],
        avgPreparationTime: Math.round(avgPreparationTime),
        currentPromotions: [], // 可以後續擴展
        dailySpecials: [] // 可以後續擴展
      }

      return { data: menuContext, error: null }
    } catch (error) {
      console.error('MenuService: 建構 AI 菜單資訊失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 獲取特定商品詳情
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabaseServer
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('restaurant_id', this.restaurantId)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('MenuService: 獲取商品詳情失敗:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * 更新商品的 AI 推薦狀態
   */
  async updateProductAIScore(productId: string, score: number, recommended: boolean): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabaseServer
        .from('products')
        .update({
          ai_popularity_score: score,
          ai_recommended: recommended,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('restaurant_id', this.restaurantId)

      if (error) throw error

      return { data: true, error: null }
    } catch (error) {
      console.error('MenuService: 更新 AI 評分失敗:', error)
      return { data: false, error: (error as Error).message }
    }
  }
}
