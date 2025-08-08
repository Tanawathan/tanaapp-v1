import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const id = searchParams.get('id')
    const phone = searchParams.get('phone')
    const email = searchParams.get('email')

    switch (action) {
      case 'reservation':
        return await confirmReservation(id, phone, email)
      case 'order':
        return await confirmOrder(id, phone)
      case 'user':
        return await confirmUser(phone, email)
      case 'table':
        return await confirmTable(id)
      default:
        return NextResponse.json({ 
          success: false, 
          error: '請指定查詢類型 (reservation/order/user/table)' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('確認查詢 API 錯誤:', error)
    return NextResponse.json({ 
      success: false, 
      error: '查詢過程中發生錯誤' 
    }, { status: 500 })
  }
}

// 確認預約
async function confirmReservation(id?: string, phone?: string, email?: string) {
  try {
    let query = supabase
      .from('reservations')
      .select(`
        *,
        restaurants:restaurant_id (
          name,
          phone,
          address
        )
      `)

    // 根據提供的參數建立查詢條件
    if (id) {
      query = query.eq('id', id)
    } else if (phone) {
      query = query.eq('customer_phone', phone)
    } else if (email) {
      query = query.eq('customer_email', email)
    } else {
      return NextResponse.json({
        success: false,
        error: '請提供預約 ID、電話或電子郵件進行查詢'
      }, { status: 400 })
    }

    // 只查詢最近的預約
    query = query.order('created_at', { ascending: false }).limit(5)

    const { data: reservations, error } = await query

    if (error) {
      console.error('預約查詢錯誤:', error)
      return NextResponse.json({
        success: false,
        error: '預約查詢失敗'
      }, { status: 500 })
    }

    if (!reservations || reservations.length === 0) {
      return NextResponse.json({
        success: true,
        found: false,
        message: '沒有找到符合條件的預約記錄'
      })
    }

    return NextResponse.json({
      success: true,
      found: true,
      count: reservations.length,
      reservations: reservations.map(reservation => ({
        id: reservation.id,
        customerName: reservation.customer_name,
        phone: reservation.customer_phone,
        email: reservation.customer_email,
        reservationDate: reservation.reservation_date,
        reservationTime: reservation.reservation_time,
        partySize: reservation.party_size,
        status: reservation.status,
        specialRequests: reservation.special_requests,
        restaurant: reservation.restaurants,
        createdAt: reservation.created_at,
        updatedAt: reservation.updated_at
      }))
    })

  } catch (error) {
    console.error('預約確認過程中發生錯誤:', error)
    return NextResponse.json({
      success: false,
      error: '預約確認失敗'
    }, { status: 500 })
  }
}

// 確認訂單
async function confirmOrder(id?: string, phone?: string) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        restaurants:restaurant_id (
          name,
          phone,
          address
        ),
        order_items (
          *,
          products:product_id (
            name,
            price
          )
        )
      `)

    if (id) {
      query = query.eq('id', id)
    } else if (phone) {
      query = query.eq('customer_phone', phone)
    } else {
      return NextResponse.json({
        success: false,
        error: '請提供訂單 ID 或電話進行查詢'
      }, { status: 400 })
    }

    query = query.order('created_at', { ascending: false }).limit(5)

    const { data: orders, error } = await query

    if (error) {
      console.error('訂單查詢錯誤:', error)
      return NextResponse.json({
        success: false,
        error: '訂單查詢失敗'
      }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        found: false,
        message: '沒有找到符合條件的訂單記錄'
      })
    }

    return NextResponse.json({
      success: true,
      found: true,
      count: orders.length,
      orders: orders
    })

  } catch (error) {
    console.error('訂單確認過程中發生錯誤:', error)
    return NextResponse.json({
      success: false,
      error: '訂單確認失敗'
    }, { status: 500 })
  }
}

// 確認用戶
async function confirmUser(phone?: string, email?: string) {
  try {
    if (!phone && !email) {
      return NextResponse.json({
        success: false,
        error: '請提供電話或電子郵件進行查詢'
      }, { status: 400 })
    }

    // 從預約和訂單表中收集用戶資訊
    const userInfo = {
      found: false,
      reservations: [],
      orders: [],
      summary: null
    }

    // 查詢預約記錄
    let reservationQuery = supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (phone) {
      reservationQuery = reservationQuery.eq('customer_phone', phone)
    } else if (email) {
      reservationQuery = reservationQuery.eq('customer_email', email)
    }

    const { data: reservations } = await reservationQuery

    // 查詢訂單記錄
    let orderQuery = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (phone) {
      orderQuery = orderQuery.eq('customer_phone', phone)
    }
    // 訂單表可能沒有 email 欄位，所以只用 phone 查詢

    const { data: orders } = await orderQuery

    if (reservations && reservations.length > 0) {
      userInfo.found = true
      userInfo.reservations = reservations
    }

    if (orders && orders.length > 0) {
      userInfo.found = true
      userInfo.orders = orders
    }

    // 建立用戶摘要
    if (userInfo.found) {
      const latestReservation = reservations?.[0]
      const latestOrder = orders?.[0]
      
      userInfo.summary = {
        name: latestReservation?.customer_name || latestOrder?.customer_name || '未知',
        phone: phone || latestReservation?.customer_phone || latestOrder?.customer_phone,
        email: email || latestReservation?.customer_email,
        totalReservations: reservations?.length || 0,
        totalOrders: orders?.length || 0,
        lastActivity: Math.max(
          new Date(latestReservation?.created_at || 0).getTime(),
          new Date(latestOrder?.created_at || 0).getTime()
        )
      }
    }

    if (!userInfo.found) {
      return NextResponse.json({
        success: true,
        found: false,
        message: '沒有找到符合條件的用戶記錄'
      })
    }

    return NextResponse.json({
      success: true,
      found: true,
      user: userInfo
    })

  } catch (error) {
    console.error('用戶確認過程中發生錯誤:', error)
    return NextResponse.json({
      success: false,
      error: '用戶確認失敗'
    }, { status: 500 })
  }
}

// 確認桌台
async function confirmTable(id?: string) {
  try {
    let query = supabase
      .from('tables')
      .select(`
        *,
        restaurants:restaurant_id (
          name,
          address
        )
      `)

    if (id) {
      query = query.eq('id', id)
    } else {
      // 如果沒有指定 ID，返回所有桌台狀態
      query = query.order('table_number')
    }

    const { data: tables, error } = await query

    if (error) {
      console.error('桌台查詢錯誤:', error)
      return NextResponse.json({
        success: false,
        error: '桌台查詢失敗'
      }, { status: 500 })
    }

    if (!tables || tables.length === 0) {
      return NextResponse.json({
        success: true,
        found: false,
        message: '沒有找到符合條件的桌台記錄'
      })
    }

    return NextResponse.json({
      success: true,
      found: true,
      count: tables.length,
      tables: tables
    })

  } catch (error) {
    console.error('桌台確認過程中發生錯誤:', error)
    return NextResponse.json({
      success: false,
      error: '桌台確認失敗'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'update_reservation_status':
        return await updateReservationStatus(data.id, data.status)
      case 'update_order_status':
        return await updateOrderStatus(data.id, data.status)
      default:
        return NextResponse.json({ 
          success: false, 
          error: '不支援的更新操作' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('確認更新 API 錯誤:', error)
    return NextResponse.json({ 
      success: false, 
      error: '更新過程中發生錯誤' 
    }, { status: 500 })
  }
}

// 更新預約狀態
async function updateReservationStatus(id: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('預約狀態更新錯誤:', error)
      return NextResponse.json({
        success: false,
        error: '預約狀態更新失敗'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '預約狀態已成功更新',
      reservation: data[0]
    })

  } catch (error) {
    console.error('預約狀態更新過程中發生錯誤:', error)
    return NextResponse.json({
      success: false,
      error: '預約狀態更新失敗'
    }, { status: 500 })
  }
}

// 更新訂單狀態
async function updateOrderStatus(id: string, status: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('訂單狀態更新錯誤:', error)
      return NextResponse.json({
        success: false,
        error: '訂單狀態更新失敗'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '訂單狀態已成功更新',
      order: data[0]
    })

  } catch (error) {
    console.error('訂單狀態更新過程中發生錯誤:', error)
    return NextResponse.json({
      success: false,
      error: '訂單狀態更新失敗'
    }, { status: 500 })
  }
}
