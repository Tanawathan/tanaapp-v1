import { NextRequest, NextResponse } from 'next/server'
import { TanaPOSService } from '../../../../src/lib/services/tanaposService'

const tanaposService = TanaPOSService.getInstance()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preferences, budget, partySize } = body

    const result = await tanaposService.getAIRecommendations(
      preferences,
      budget,
      partySize
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('AI Recommend API error:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' }, 
      { status: 500 }
    )
  }
}
