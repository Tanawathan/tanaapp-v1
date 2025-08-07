// Database Schema Utilities
// Auto-generated utility functions for working with the database

import { createClient } from '@supabase/supabase-js';
import * as DatabaseTypes from './database-types';

// Import environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Table Names - Always use these constants to ensure consistency
export const TABLES = {
  RESTAURANTS: 'restaurants' as const,
  CATEGORIES: 'categories' as const,
  ORDERS: 'orders' as const,
  ORDER_ITEMS: 'order_items' as const,
  TABLES: 'tables' as const,
  PAYMENTS: 'payments' as const,
  SUPPLIERS: 'suppliers' as const,
} as const;

// Type-safe database operations
export class DatabaseService {
  
  // Restaurants operations
  static async getRestaurants() {
    return supabase
      .from(TABLES.RESTAURANTS)
      .select('*')
      .returns<DatabaseTypes.Restaurants[]>();
  }

  static async getRestaurantById(id: string) {
    return supabase
      .from(TABLES.RESTAURANTS)
      .select('*')
      .eq('id', id)
      .single()
      .returns<DatabaseTypes.Restaurants>();
  }

  static async createRestaurant(data: DatabaseTypes.RestaurantsInsert) {
    return supabase
      .from(TABLES.RESTAURANTS)
      .insert(data)
      .select()
      .single()
      .returns<DatabaseTypes.Restaurants>();
  }

  static async updateRestaurant(id: string, data: Partial<DatabaseTypes.RestaurantsInsert>) {
    return supabase
      .from(TABLES.RESTAURANTS)
      .update(data)
      .eq('id', id)
      .select()
      .single()
      .returns<DatabaseTypes.Restaurants>();
  }

  // Categories operations
  static async getCategories(restaurantId?: string) {
    let query = supabase.from(TABLES.CATEGORIES).select('*');
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    return query
      .order('sort_order')
      .returns<DatabaseTypes.Categories[]>();
  }

  static async createCategory(data: DatabaseTypes.CategoriesInsert) {
    return supabase
      .from(TABLES.CATEGORIES)
      .insert(data)
      .select()
      .single()
      .returns<DatabaseTypes.Categories>();
  }

  // Orders operations
  static async getOrders(restaurantId?: string, status?: string) {
    let query = supabase.from(TABLES.ORDERS).select(`
      *,
      order_items (
        *
      ),
      tables (
        table_number,
        area
      )
    `);
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    return query
      .order('created_at', { ascending: false })
      .returns<DatabaseTypes.Orders[]>();
  }

  static async createOrder(data: DatabaseTypes.OrdersInsert) {
    return supabase
      .from(TABLES.ORDERS)
      .insert(data)
      .select()
      .single();
  }

  static async updateOrderStatus(id: string, status: string) {
    return supabase
      .from(TABLES.ORDERS)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
      .returns<DatabaseTypes.Orders>();
  }

  // Order Items operations
  static async getOrderItems(orderId: string) {
    return supabase
      .from(TABLES.ORDER_ITEMS)
      .select('*')
      .eq('order_id', orderId)
      .returns<DatabaseTypes.OrderItems[]>();
  }

  static async addOrderItem(data: DatabaseTypes.OrderItemsInsert) {
    return supabase
      .from(TABLES.ORDER_ITEMS)
      .insert(data)
      .select()
      .single();
  }

  // Tables operations
  static async getTables(restaurantId?: string) {
    let query = supabase.from(TABLES.TABLES).select('*');
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    return query
      .order('table_number')
      .returns<DatabaseTypes.Tables[]>();
  }

  static async updateTableStatus(id: string, status: string) {
    return supabase
      .from(TABLES.TABLES)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
      .returns<DatabaseTypes.Tables>();
  }

  // Payments operations
  static async getPayments(orderId?: string) {
    let query = supabase.from(TABLES.PAYMENTS).select('*');
    
    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    
    return query
      .order('created_at', { ascending: false })
      .returns<DatabaseTypes.Payments[]>();
  }

  static async createPayment(data: DatabaseTypes.PaymentsInsert) {
    return supabase
      .from(TABLES.PAYMENTS)
      .insert(data)
      .select()
      .single()
      .returns<DatabaseTypes.Payments>();
  }

  // Suppliers operations
  static async getSuppliers(restaurantId?: string) {
    let query = supabase.from(TABLES.SUPPLIERS).select('*');
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    return query
      .order('name')
      .returns<DatabaseTypes.Suppliers[]>();
  }

  static async createSupplier(data: DatabaseTypes.SuppliersInsert) {
    return supabase
      .from(TABLES.SUPPLIERS)
      .insert(data)
      .select()
      .single()
      .returns<DatabaseTypes.Suppliers>();
  }

  // Generic operations for any table
  static async count(tableName: keyof typeof TABLES, filters?: Record<string, any>) {
    let query = supabase
      .from(TABLES[tableName])
      .select('*', { count: 'exact', head: true });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    return query;
  }

  // Real-time subscriptions
  static subscribeToTable(
    tableName: keyof typeof TABLES,
    callback: (payload: any) => void,
    filters?: Record<string, any>
  ) {
    let channel = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLES[tableName],
          ...(filters && { filter: Object.entries(filters).map(([k, v]) => `${k}=eq.${v}`).join(',') })
        }, 
        callback
      );
    
    return channel.subscribe();
  }
}

// Helper functions for common operations
export const DatabaseHelpers = {
  // Format currency based on restaurant settings
  formatCurrency: (amount: number, currency: string = 'TWD') => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  // Generate order number
  generateOrderNumber: () => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  },

  // Calculate order total
  calculateOrderTotal: (items: DatabaseTypes.OrderItems[]) => {
    return items.reduce((total, item) => {
      return total + (item.unit_price * item.quantity);
    }, 0);
  },

  // Format datetime for display
  formatDateTime: (dateString: string, timezone: string = 'Asia/Taipei') => {
    return new Date(dateString).toLocaleString('zh-TW', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

export default DatabaseService;
