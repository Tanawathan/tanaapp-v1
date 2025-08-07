import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'overview'

    switch (action) {
      case 'overview':
        return await getDatabaseOverview()
      case 'schema':
        return await getDatabaseSchema()
      case 'tables':
        return await getTablesList()
      case 'data':
        const table = searchParams.get('table')
        const limit = parseInt(searchParams.get('limit') || '10')
        return await getTableData(table, limit)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Database API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getDatabaseOverview() {
  try {
    const tables = ['restaurants', 'categories', 'products', 'orders', 'order_items', 'reservations', 'tables']
    const overview = {}

    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        overview[table] = { count: count || 0 }
      } catch (err) {
        overview[table] = { count: 0, error: 'Table may not exist' }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        overview,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function getDatabaseSchema() {
  try {
    // 獲取所有表格結構
    const { data: tablesInfo, error } = await supabase.rpc('get_schema_info')
    
    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        schema: tablesInfo,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      fallback: 'Using static schema information'
    }, { status: 200 })
  }
}

async function getTablesList() {
  try {
    const tables = [
      {
        name: 'restaurants',
        description: '餐廳基本資料',
        key_fields: ['name', 'address', 'phone', 'business_hours']
      },
      {
        name: 'categories',
        description: '菜品分類',
        key_fields: ['name', 'description', 'icon', 'is_active']
      },
      {
        name: 'products',
        description: '產品/菜品資料',
        key_fields: ['name', 'description', 'price', 'category_id', 'is_available']
      },
      {
        name: 'orders',
        description: '訂單資料',
        key_fields: ['order_number', 'customer_name', 'status', 'total_amount']
      },
      {
        name: 'order_items',
        description: '訂單項目明細',
        key_fields: ['product_name', 'quantity', 'unit_price', 'status']
      },
      {
        name: 'reservations',
        description: '預約/訂位資料',
        key_fields: ['customer_name', 'reservation_date', 'party_size', 'status']
      },
      {
        name: 'tables',
        description: '餐桌資料',
        key_fields: ['table_number', 'capacity', 'status', 'location']
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        tables,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function getTableData(tableName: string | null, limit: number) {
  if (!tableName) {
    return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        table: tableName,
        records: data,
        count: data?.length || 0,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
