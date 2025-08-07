// Database Types - Generated on 2025-08-07T09:48:26.595Z
// This file is auto-generated. Do not edit manually.

export interface Restaurants {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: any;
  tax_rate: number;
  service_charge_rate: number;
  currency: string;
  timezone: string;
  business_hours?: any;
  settings?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
  custom_fields?: any;
}

export interface RestaurantsInsert {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: any;
  tax_rate: number;
  service_charge_rate: number;
  currency: string;
  timezone: string;
  business_hours?: any;
  settings?: any;
  is_active: boolean;
  metadata?: any;
  custom_fields?: any;
}

export interface Categories {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  sort_order: number;
  color: string;
  icon: string;
  image_url?: any;
  parent_id?: any;
  level: number;
  path?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  ai_visibility_score: number;
  ai_popularity_rank?: any;
  metadata?: any;
}

export interface CategoriesInsert {
  restaurant_id: string;
  name: string;
  description: string;
  sort_order: number;
  color: string;
  icon: string;
  image_url?: any;
  parent_id?: any;
  level: number;
  path?: any;
  is_active: boolean;
  ai_visibility_score: number;
  ai_popularity_rank?: any;
  metadata?: any;
}

export interface Orders {
  id: string;
  restaurant_id: string;
  table_id?: any;
  session_id?: any;
  order_number: string;
  order_type: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: any;
  table_number: number;
  party_size?: any;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  service_charge: number;
  total_amount: number;
  status: string;
  payment_status: string;
  ordered_at: string;
  confirmed_at?: any;
  preparation_started_at?: any;
  ready_at?: any;
  served_at?: any;
  completed_at: string;
  estimated_ready_time?: any;
  estimated_prep_time?: any;
  actual_prep_time?: any;
  ai_optimized: boolean;
  ai_estimated_prep_time?: any;
  ai_recommendations?: any;
  ai_efficiency_score?: any;
  notes?: any;
  special_instructions?: any;
  source: string;
  created_by?: any;
  updated_by?: any;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface OrdersInsert {
  restaurant_id: string;
  table_id?: any;
  session_id?: any;
  order_number: string;
  order_type: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: any;
  table_number: number;
  party_size?: any;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  service_charge: number;
  total_amount: number;
  status: string;
  payment_status: string;
  ordered_at: string;
  confirmed_at?: any;
  preparation_started_at?: any;
  ready_at?: any;
  served_at?: any;
  completed_at: string;
  estimated_ready_time?: any;
  estimated_prep_time?: any;
  actual_prep_time?: any;
  ai_optimized: boolean;
  ai_estimated_prep_time?: any;
  ai_recommendations?: any;
  ai_efficiency_score?: any;
  notes?: any;
  special_instructions?: any;
  source: string;
  created_by?: any;
  updated_by?: any;
  metadata?: any;
}

export interface OrderItems {
  id: string;
  order_id: string;
  product_id: string;
  combo_id?: any;
  item_type: string;
  product_name: string;
  product_sku?: any;
  variant_name?: any;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_price: number;
  status: string;
  ordered_at: string;
  preparation_started_at?: any;
  ready_at?: any;
  served_at?: any;
  estimated_prep_time?: any;
  actual_prep_time?: any;
  special_instructions?: any;
  modifiers?: any;
  kitchen_station?: any;
  priority_level: number;
  quality_checked: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItemsInsert {
  order_id: string;
  product_id: string;
  combo_id?: any;
  item_type: string;
  product_name: string;
  product_sku?: any;
  variant_name?: any;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_price: number;
  status: string;
  ordered_at: string;
  preparation_started_at?: any;
  ready_at?: any;
  served_at?: any;
  estimated_prep_time?: any;
  actual_prep_time?: any;
  special_instructions?: any;
  modifiers?: any;
  kitchen_station?: any;
  priority_level: number;
  quality_checked: boolean;
}

export interface Tables {
  id: string;
  restaurant_id: string;
  table_number: number;
  name: string;
  capacity: number;
  min_capacity: number;
  max_capacity?: any;
  status: string;
  floor_level: number;
  zone?: any;
  position_x: number;
  position_y: number;
  table_type: string;
  features?: any;
  qr_code?: any;
  qr_enabled: boolean;
  ai_assignment_priority: number;
  ai_features_score?: any;
  current_session_id?: any;
  last_occupied_at?: any;
  last_cleaned_at: string;
  cleaning_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface TablesInsert {
  restaurant_id: string;
  table_number: number;
  name: string;
  capacity: number;
  min_capacity: number;
  max_capacity?: any;
  status: string;
  floor_level: number;
  zone?: any;
  position_x: number;
  position_y: number;
  table_type: string;
  features?: any;
  qr_code?: any;
  qr_enabled: boolean;
  ai_assignment_priority: number;
  ai_features_score?: any;
  current_session_id?: any;
  last_occupied_at?: any;
  last_cleaned_at: string;
  cleaning_duration_minutes: number;
  is_active: boolean;
  metadata?: any;
}

export interface Payments {
  id: string;
  order_id: string;
  payment_method: string;
  payment_provider?: any;
  amount: number;
  received_amount: number;
  change_amount: number;
  tip_amount: number;
  transaction_id?: any;
  reference_number?: any;
  authorization_code?: any;
  card_last_four?: any;
  card_type?: any;
  card_brand?: any;
  mobile_provider?: any;
  mobile_account?: any;
  status: string;
  processed_at: string;
  confirmed_at: string;
  refund_amount: number;
  refund_reason?: any;
  refunded_at?: any;
  processed_by?: any;
  terminal_id?: any;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export interface PaymentsInsert {
  order_id: string;
  payment_method: string;
  payment_provider?: any;
  amount: number;
  received_amount: number;
  change_amount: number;
  tip_amount: number;
  transaction_id?: any;
  reference_number?: any;
  authorization_code?: any;
  card_last_four?: any;
  card_type?: any;
  card_brand?: any;
  mobile_provider?: any;
  mobile_account?: any;
  status: string;
  processed_at: string;
  confirmed_at: string;
  refund_amount: number;
  refund_reason?: any;
  refunded_at?: any;
  processed_by?: any;
  terminal_id?: any;
  metadata?: any;
}

export interface Suppliers {
  id: string;
  restaurant_id: string;
  name: string;
  code?: any;
  contact_person: string;
  phone: string;
  email: string;
  website?: any;
  address: string;
  payment_terms: string;
  delivery_days?: any;
  min_order_amount: number;
  credit_limit?: any;
  discount_rate: number;
  quality_rating?: any;
  delivery_rating?: any;
  service_rating?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuppliersInsert {
  restaurant_id: string;
  name: string;
  code?: any;
  contact_person: string;
  phone: string;
  email: string;
  website?: any;
  address: string;
  payment_terms: string;
  delivery_days?: any;
  min_order_amount: number;
  credit_limit?: any;
  discount_rate: number;
  quality_rating?: any;
  delivery_rating?: any;
  service_rating?: any;
  is_active: boolean;
}

