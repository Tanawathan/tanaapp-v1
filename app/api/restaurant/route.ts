import { NextRequest, NextResponse } from 'next/server'
import { TanaPOSService } from '../../../src/lib/services/tanaposService'

const tanaposService = TanaPOSService.getInstance()

export async function GET() {
  try {
    const result = await tanaposService.getRestaurantStatus()

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Restaurant API error:', error)
    return NextResponse.json(
      { error: 'Failed to get restaurant info' }, 
      { status: 500 }
    )
  }
}
