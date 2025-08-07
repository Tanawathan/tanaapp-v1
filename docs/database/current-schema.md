# Database Schema Documentation

**Generated:** 8/7/2025, 5:48:26 PM
**Database:** supabase
**Schema:** public

## Tables Overview

Total tables: 7

### restaurants

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | ❌ | - |
| name | text | ❌ | - |
| address | text | ❌ | - |
| phone | text | ❌ | - |
| email | text | ❌ | - |
| website | nullable | ✅ | - |
| tax_rate | integer | ❌ | - |
| service_charge_rate | integer | ❌ | - |
| currency | text | ❌ | - |
| timezone | text | ❌ | - |
| business_hours | nullable | ✅ | - |
| settings | nullable | ✅ | - |
| is_active | boolean | ❌ | - |
| created_at | timestamp | ❌ | - |
| updated_at | timestamp | ❌ | - |
| metadata | nullable | ✅ | - |
| custom_fields | nullable | ✅ | - |

**Sample Data Structure:**
```json
{
  "id": "a8fff0de-a2dd-4749-a80c-08a6102de734",
  "name": "TanawatThai",
  "address": "keelong",
  "phone": "0971715711",
  "email": "info@tanawat.tw",
  "website": null,
  "tax_rate": 0,
  "service_charge_rate": 0,
  "currency": "TWD",
  "timezone": "Asia/Taipei",
  "business_hours": null,
  "settings": null,
  "is_active": true,
  "created_at": "2025-07-31T12:43:28.845282+00:00",
  "updated_at": "2025-08-05T13:52:41.811219+00:00",
  "metadata": null,
  "custom_fields": null
}
```

---

### categories

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | ❌ | - |
| restaurant_id | uuid | ❌ | - |
| name | text | ❌ | - |
| description | text | ❌ | - |
| sort_order | integer | ❌ | - |
| color | text | ❌ | - |
| icon | text | ❌ | - |
| image_url | nullable | ✅ | - |
| parent_id | nullable | ✅ | - |
| level | integer | ❌ | - |
| path | nullable | ✅ | - |
| is_active | boolean | ❌ | - |
| created_at | timestamp | ❌ | - |
| updated_at | timestamp | ❌ | - |
| ai_visibility_score | integer | ❌ | - |
| ai_popularity_rank | nullable | ✅ | - |
| metadata | nullable | ✅ | - |

**Sample Data Structure:**
```json
{
  "id": "22222222-2222-2222-2222-222222222222",
  "restaurant_id": "11111111-1111-1111-1111-111111111111",
  "name": "飲品",
  "description": "各式飲品",
  "sort_order": 2,
  "color": "#10B981",
  "icon": "🥤",
  "image_url": null,
  "parent_id": null,
  "level": 1,
  "path": null,
  "is_active": true,
  "created_at": "2025-08-05T07:37:01.09837+00:00",
  "updated_at": "2025-08-05T07:37:01.09837+00:00",
  "ai_visibility_score": 1,
  "ai_popularity_rank": null,
  "metadata": null
}
```

---

### orders

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | ❌ | - |
| restaurant_id | uuid | ❌ | - |
| table_id | nullable | ✅ | - |
| session_id | nullable | ✅ | - |
| order_number | text | ❌ | - |
| order_type | text | ❌ | - |
| customer_name | text | ❌ | - |
| customer_phone | text | ❌ | - |
| customer_email | nullable | ✅ | - |
| table_number | integer | ❌ | - |
| party_size | nullable | ✅ | - |
| subtotal | integer | ❌ | - |
| discount_amount | integer | ❌ | - |
| tax_amount | integer | ❌ | - |
| service_charge | integer | ❌ | - |
| total_amount | integer | ❌ | - |
| status | text | ❌ | - |
| payment_status | text | ❌ | - |
| ordered_at | timestamp | ❌ | - |
| confirmed_at | nullable | ✅ | - |
| preparation_started_at | nullable | ✅ | - |
| ready_at | nullable | ✅ | - |
| served_at | nullable | ✅ | - |
| completed_at | timestamp | ❌ | - |
| estimated_ready_time | nullable | ✅ | - |
| estimated_prep_time | nullable | ✅ | - |
| actual_prep_time | nullable | ✅ | - |
| ai_optimized | boolean | ❌ | - |
| ai_estimated_prep_time | nullable | ✅ | - |
| ai_recommendations | nullable | ✅ | - |
| ai_efficiency_score | nullable | ✅ | - |
| notes | nullable | ✅ | - |
| special_instructions | nullable | ✅ | - |
| source | text | ❌ | - |
| created_by | nullable | ✅ | - |
| updated_by | nullable | ✅ | - |
| created_at | timestamp | ❌ | - |
| updated_at | timestamp | ❌ | - |
| metadata | nullable | ✅ | - |

**Sample Data Structure:**
```json
{
  "id": "49d9e50f-6063-4f23-b770-3f648d9ff9fc",
  "restaurant_id": "11111111-1111-1111-1111-111111111111",
  "table_id": null,
  "session_id": null,
  "order_number": "1-847-A2",
  "order_type": "dine_in",
  "customer_name": "",
  "customer_phone": "",
  "customer_email": null,
  "table_number": 1,
  "party_size": null,
  "subtotal": 180,
  "discount_amount": 0,
  "tax_amount": 0,
  "service_charge": 18,
  "total_amount": 198,
  "status": "completed",
  "payment_status": "paid",
  "ordered_at": "2025-08-05T18:42:24.025545+00:00",
  "confirmed_at": null,
  "preparation_started_at": null,
  "ready_at": null,
  "served_at": null,
  "completed_at": "2025-08-05T19:29:26.716+00:00",
  "estimated_ready_time": null,
  "estimated_prep_time": null,
  "actual_prep_time": null,
  "ai_optimized": false,
  "ai_estimated_prep_time": null,
  "ai_recommendations": null,
  "ai_efficiency_score": null,
  "notes": null,
  "special_instructions": null,
  "source": "mobile_pos",
  "created_by": null,
  "updated_by": null,
  "created_at": "2025-08-05T18:42:23.036+00:00",
  "updated_at": "2025-08-05T19:29:27.812912+00:00",
  "metadata": null
}
```

---

### order_items

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | ❌ | - |
| order_id | uuid | ❌ | - |
| product_id | uuid | ❌ | - |
| combo_id | nullable | ✅ | - |
| item_type | text | ❌ | - |
| product_name | text | ❌ | - |
| product_sku | nullable | ✅ | - |
| variant_name | nullable | ✅ | - |
| quantity | integer | ❌ | - |
| unit_price | integer | ❌ | - |
| total_price | integer | ❌ | - |
| cost_price | integer | ❌ | - |
| status | text | ❌ | - |
| ordered_at | timestamp | ❌ | - |
| preparation_started_at | nullable | ✅ | - |
| ready_at | nullable | ✅ | - |
| served_at | nullable | ✅ | - |
| estimated_prep_time | nullable | ✅ | - |
| actual_prep_time | nullable | ✅ | - |
| special_instructions | nullable | ✅ | - |
| modifiers | nullable | ✅ | - |
| kitchen_station | nullable | ✅ | - |
| priority_level | integer | ❌ | - |
| quality_checked | boolean | ❌ | - |
| created_at | timestamp | ❌ | - |
| updated_at | timestamp | ❌ | - |

**Sample Data Structure:**
```json
{
  "id": "11111111-1111-1111-1111-111111111301",
  "order_id": "11111111-1111-1111-1111-111111111201",
  "product_id": "a1111111-1111-1111-1111-111111111111",
  "combo_id": null,
  "item_type": "product",
  "product_name": "招牌牛肉麵",
  "product_sku": null,
  "variant_name": null,
  "quantity": 1,
  "unit_price": 180,
  "total_price": 180,
  "cost_price": 0,
  "status": "preparing",
  "ordered_at": "2025-08-05T07:37:01.837179+00:00",
  "preparation_started_at": null,
  "ready_at": null,
  "served_at": null,
  "estimated_prep_time": null,
  "actual_prep_time": null,
  "special_instructions": null,
  "modifiers": null,
  "kitchen_station": null,
  "priority_level": 3,
  "quality_checked": false,
  "created_at": "2025-08-05T07:37:01.837179+00:00",
  "updated_at": "2025-08-05T07:37:01.837179+00:00"
}
```

---

### tables

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | ❌ | - |
| restaurant_id | uuid | ❌ | - |
| table_number | integer | ❌ | - |
| name | text | ❌ | - |
| capacity | integer | ❌ | - |
| min_capacity | integer | ❌ | - |
| max_capacity | nullable | ✅ | - |
| status | text | ❌ | - |
| floor_level | integer | ❌ | - |
| zone | nullable | ✅ | - |
| position_x | integer | ❌ | - |
| position_y | integer | ❌ | - |
| table_type | text | ❌ | - |
| features | nullable | ✅ | - |
| qr_code | nullable | ✅ | - |
| qr_enabled | boolean | ❌ | - |
| ai_assignment_priority | integer | ❌ | - |
| ai_features_score | nullable | ✅ | - |
| current_session_id | nullable | ✅ | - |
| last_occupied_at | nullable | ✅ | - |
| last_cleaned_at | timestamp | ❌ | - |
| cleaning_duration_minutes | integer | ❌ | - |
| is_active | boolean | ❌ | - |
| created_at | timestamp | ❌ | - |
| updated_at | timestamp | ❌ | - |
| metadata | nullable | ✅ | - |

**Sample Data Structure:**
```json
{
  "id": "11111111-1111-1111-1111-111111111108",
  "restaurant_id": "11111111-1111-1111-1111-111111111111",
  "table_number": 8,
  "name": "C02",
  "capacity": 6,
  "min_capacity": 1,
  "max_capacity": null,
  "status": "available",
  "floor_level": 1,
  "zone": null,
  "position_x": 0,
  "position_y": 0,
  "table_type": "square",
  "features": null,
  "qr_code": null,
  "qr_enabled": true,
  "ai_assignment_priority": 5,
  "ai_features_score": null,
  "current_session_id": null,
  "last_occupied_at": null,
  "last_cleaned_at": "2025-08-06T10:51:29.726+00:00",
  "cleaning_duration_minutes": 15,
  "is_active": true,
  "created_at": "2025-08-05T07:37:01.433733+00:00",
  "updated_at": "2025-08-06T10:51:29.945658+00:00",
  "metadata": null
}
```

---

### payments

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | ❌ | - |
| order_id | uuid | ❌ | - |
| payment_method | text | ❌ | - |
| payment_provider | nullable | ✅ | - |
| amount | integer | ❌ | - |
| received_amount | integer | ❌ | - |
| change_amount | integer | ❌ | - |
| tip_amount | integer | ❌ | - |
| transaction_id | nullable | ✅ | - |
| reference_number | nullable | ✅ | - |
| authorization_code | nullable | ✅ | - |
| card_last_four | nullable | ✅ | - |
| card_type | nullable | ✅ | - |
| card_brand | nullable | ✅ | - |
| mobile_provider | nullable | ✅ | - |
| mobile_account | nullable | ✅ | - |
| status | text | ❌ | - |
| processed_at | timestamp | ❌ | - |
| confirmed_at | timestamp | ❌ | - |
| refund_amount | integer | ❌ | - |
| refund_reason | nullable | ✅ | - |
| refunded_at | nullable | ✅ | - |
| processed_by | nullable | ✅ | - |
| terminal_id | nullable | ✅ | - |
| created_at | timestamp | ❌ | - |
| updated_at | timestamp | ❌ | - |
| metadata | nullable | ✅ | - |

**Sample Data Structure:**
```json
{
  "id": "e5246cb1-100a-4fd4-820d-7a46ba8b5b5f",
  "order_id": "e0c1a95c-a74c-4ff9-b811-abe7eace2ed5",
  "payment_method": "cash",
  "payment_provider": null,
  "amount": 943,
  "received_amount": 1000,
  "change_amount": 180,
  "tip_amount": 0,
  "transaction_id": null,
  "reference_number": null,
  "authorization_code": null,
  "card_last_four": null,
  "card_type": null,
  "card_brand": null,
  "mobile_provider": null,
  "mobile_account": null,
  "status": "completed",
  "processed_at": "2025-08-05T13:31:26.065+00:00",
  "confirmed_at": "2025-08-05T13:31:26.065+00:00",
  "refund_amount": 0,
  "refund_reason": null,
  "refunded_at": null,
  "processed_by": null,
  "terminal_id": null,
  "created_at": "2025-08-05T13:31:27.803695+00:00",
  "updated_at": "2025-08-05T13:31:27.803695+00:00",
  "metadata": null
}
```

---

### suppliers

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | ❌ | - |
| restaurant_id | uuid | ❌ | - |
| name | text | ❌ | - |
| code | nullable | ✅ | - |
| contact_person | text | ❌ | - |
| phone | text | ❌ | - |
| email | text | ❌ | - |
| website | nullable | ✅ | - |
| address | text | ❌ | - |
| payment_terms | text | ❌ | - |
| delivery_days | nullable | ✅ | - |
| min_order_amount | integer | ❌ | - |
| credit_limit | nullable | ✅ | - |
| discount_rate | integer | ❌ | - |
| quality_rating | nullable | ✅ | - |
| delivery_rating | nullable | ✅ | - |
| service_rating | nullable | ✅ | - |
| is_active | boolean | ❌ | - |
| created_at | timestamp | ❌ | - |
| updated_at | timestamp | ❌ | - |

**Sample Data Structure:**
```json
{
  "id": "11111111-1111-1111-1111-111111112301",
  "restaurant_id": "11111111-1111-1111-1111-111111111111",
  "name": "新鮮食材有限公司",
  "code": null,
  "contact_person": "王經理",
  "phone": "02-1234-5678",
  "email": "wang@freshfood.com",
  "website": null,
  "address": "台北市中山區民生東路123號",
  "payment_terms": "net_30",
  "delivery_days": null,
  "min_order_amount": 0,
  "credit_limit": null,
  "discount_rate": 0,
  "quality_rating": null,
  "delivery_rating": null,
  "service_rating": null,
  "is_active": true,
  "created_at": "2025-08-05T07:42:38.420616+00:00",
  "updated_at": "2025-08-05T07:42:38.420616+00:00"
}
```

---

