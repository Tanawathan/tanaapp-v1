import { NextRequest, NextResponse } from 'next/server'
import { TanaPOSService } from '../../../src/lib/services/tanaposService'

const tanaposService = TanaPOSService.getInstance()

export async function POST(request: NextRequest) {
  try {
    const orderRequest = await request.json()

    const result = await tanaposService.processAIOrder(orderRequest)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')

    if (orderId) {
      // 獲取特定訂單狀態
      const result = await tanaposService.checkOrderStatus(orderId)
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json(result.data)
    } else {
      // 獲取訂單統計
      const result = await tanaposService.getRestaurantStatus()
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }

      return NextResponse.json(result.data)
    }
  } catch (error) {
    console.error('Orders GET API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order data' }, 
      { status: 500 }
    )
  }
}
