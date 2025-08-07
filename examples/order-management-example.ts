/**
 * 範例：餐廳訂單管理功能
 * 展示如何使用自動生成的資料庫服務和類型定義
 * 使用真實的資料庫結構和欄位名稱
 */

import { DatabaseService, DatabaseHelpers, TABLES, supabase } from '../docs/database/database-service';
import * as DatabaseTypes from '../docs/database/database-types';

// 基於真實資料庫結構的介面定義
interface CreateOrderRequest {
  restaurantId: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize?: number;
  items: OrderItemRequest[];
  specialInstructions?: string;
}

interface OrderItemRequest {
  productId: string;
  productName: string;
  productSku?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  specialInstructions?: string;
  modifiers?: any;
}

export class OrderManagementService {
  
  /**
   * 創建新訂單 - 使用真實的資料庫欄位
   */
  async createOrder(request: CreateOrderRequest): Promise<DatabaseTypes.Orders> {
    try {
      const now = new Date().toISOString();
      const subtotal = this.calculateSubtotal(request.items);
      const taxAmount = subtotal * 0.05; // 5% 稅率
      const serviceCharge = subtotal * 0.10; // 10% 服務費
      const totalAmount = subtotal + taxAmount + serviceCharge;

      // 1. 創建訂單主記錄 - 使用真實的資料庫欄位
      const orderData: DatabaseTypes.OrdersInsert = {
        restaurant_id: request.restaurantId,
        table_id: request.tableId,
        order_number: DatabaseHelpers.generateOrderNumber(),
        order_type: 'dine_in',
        customer_name: request.customerName,
        customer_phone: request.customerPhone,
        customer_email: request.customerEmail || null,
        table_number: await this.getTableNumber(request.tableId),
        party_size: request.partySize || 1,
        subtotal: subtotal,
        discount_amount: 0,
        tax_amount: taxAmount,
        service_charge: serviceCharge,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        ordered_at: now,
        completed_at: now, // 必填欄位，實際上應該在完成時更新
        ai_optimized: false,
        special_instructions: request.specialInstructions || null,
        source: 'pos',
      };

      const { data: order, error: orderError } = await DatabaseService.createOrder(orderData);
      
      if (orderError || !order) {
        throw new Error(`Failed to create order: ${orderError?.message}`);
      }

      // 2. 添加訂單項目 - 使用真實的資料庫欄位
      for (const item of request.items) {
        const orderItemData: DatabaseTypes.OrderItemsInsert = {
          order_id: order.id,
          product_id: item.productId,
          item_type: 'product',
          product_name: item.productName,
          product_sku: item.productSku || null,
          variant_name: item.variantName || null,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.quantity * item.unitPrice,
          cost_price: item.costPrice || item.unitPrice * 0.6,
          status: 'pending',
          ordered_at: now,
          special_instructions: item.specialInstructions || null,
          modifiers: item.modifiers || null,
          priority_level: 1,
          quality_checked: false,
        };

        const { error: itemError } = await DatabaseService.addOrderItem(orderItemData);
        if (itemError) {
          console.error(`Failed to add order item: ${itemError.message}`);
        }
      }

      // 3. 更新餐桌狀態
      await this.updateTableStatus(request.tableId, 'occupied');

      return order;

    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * 獲取餐廳的所有訂單
   */
  async getRestaurantOrders(restaurantId: string, status?: OrderStatus): Promise<DatabaseTypes.Orders[]> {
    try {
      const { data: orders, error } = await DatabaseService.getOrders(restaurantId, status);
      
      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * 更新訂單狀態 - 使用真實的狀態值
   */
  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<DatabaseTypes.Orders> {
    try {
      const { data: updatedOrder, error } = await DatabaseService.updateOrderStatus(orderId, newStatus);
      
      if (error || !updatedOrder) {
        throw new Error(`Failed to update order status: ${error?.message}`);
      }

      // 如果訂單完成，釋放餐桌
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        const tableId = (updatedOrder as any).table_id;
        if (tableId) {
          await this.updateTableStatus(tableId, 'available');
        }
      }

      return updatedOrder as DatabaseTypes.Orders;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * 處理訂單支付 - 使用真實的支付欄位
   */
  async processPayment(
    orderId: string, 
    amount: number, 
    paymentMethod: PaymentMethod,
    receivedAmount?: number
  ): Promise<DatabaseTypes.Payments> {
    try {
      const now = new Date().toISOString();
      const received = receivedAmount || amount;
      const change = Math.max(0, received - amount);

      const paymentData: DatabaseTypes.PaymentsInsert = {
        order_id: orderId,
        payment_method: paymentMethod,
        amount: amount,
        received_amount: received,
        change_amount: change,
        tip_amount: 0,
        transaction_id: this.generateTransactionId(),
        status: 'completed',
        processed_at: now,
        confirmed_at: now,
        refund_amount: 0,
      };

      const { data: payment, error } = await DatabaseService.createPayment(paymentData);
      
      if (error || !payment) {
        throw new Error(`Failed to process payment: ${error?.message}`);
      }

      // 更新訂單的支付狀態
      await this.updateOrderPaymentStatus(orderId, 'paid');

      return payment as DatabaseTypes.Payments;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * 獲取即時訂單更新
   */
  subscribeToOrderUpdates(restaurantId: string, callback: (order: any) => void) {
    return DatabaseService.subscribeToTable(
      'ORDERS',
      (payload) => {
        if (payload.new?.restaurant_id === restaurantId) {
          callback(payload.new);
        }
      },
      { restaurant_id: restaurantId }
    );
  }

  // 私有輔助方法
  private calculateSubtotal(items: OrderItemRequest[]): number {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  }

  private async getTableNumber(tableId: string): Promise<number> {
    try {
      const { data: table } = await supabase
        .from(TABLES.TABLES)
        .select('table_number')
        .eq('id', tableId)
        .single();
      
      return table?.table_number || 1;
    } catch {
      return 1; // 預設值
    }
  }

  private async updateTableStatus(tableId: string, status: TableStatus): Promise<void> {
    try {
      await DatabaseService.updateTableStatus(tableId, status);
    } catch (error) {
      console.error('Failed to update table status:', error);
    }
  }

  private async updateOrderPaymentStatus(orderId: string, paymentStatus: string): Promise<void> {
    try {
      await supabase
        .from(TABLES.ORDERS)
        .update({ 
          payment_status: paymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  }

  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 基於真實資料庫值的類型定義
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
type PaymentMethod = 'cash' | 'card' | 'mobile_payment' | 'online_transfer';
type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_order';

// 使用範例
export async function demonstrateUsage() {
  const orderService = new OrderManagementService();
  
  try {
    // 創建新訂單
    const orderRequest: CreateOrderRequest = {
      restaurantId: 'a8fff0de-a2dd-4749-a80c-08a6102de734',
      tableId: 'your-table-uuid-here',
      customerName: '張先生',
      customerPhone: '0912345678',
      customerEmail: 'zhang@example.com',
      partySize: 2,
      items: [
        {
          productId: 'product-uuid-1',
          productName: '泰式炒河粉',
          productSku: 'THAI001',
          quantity: 2,
          unitPrice: 150,
          specialInstructions: '不要辣'
        },
        {
          productId: 'product-uuid-2', 
          productName: '泰式奶茶',
          productSku: 'DRINK001',
          quantity: 2,
          unitPrice: 80,
        }
      ],
      specialInstructions: '請盡快出餐'
    };

    const newOrder = await orderService.createOrder(orderRequest);
    console.log('訂單已創建:', newOrder);

    // 更新訂單狀態
    const updatedOrder = await orderService.updateOrderStatus(newOrder.id, 'confirmed');
    console.log('訂單狀態已更新:', updatedOrder.status);

    // 處理支付
    const payment = await orderService.processPayment(
      newOrder.id,
      newOrder.total_amount,
      'cash',
      500 // 客戶給現金 500 元
    );
    console.log('支付已處理:', payment);

    // 訂閱即時更新
    const subscription = orderService.subscribeToOrderUpdates(
      orderRequest.restaurantId,
      (order) => {
        console.log('訂單更新通知:', order);
      }
    );

    // 記得在適當時機取消訂閱
    // subscription.unsubscribe();

  } catch (error) {
    console.error('範例執行錯誤:', error);
  }
}

export default OrderManagementService;
