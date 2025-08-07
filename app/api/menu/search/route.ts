import { NextRequest, NextResponse } from 'next/server'
import { TanaPOSService } from '../../../../src/lib/services/tanaposService'

const tanaposService = TanaPOSService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' }, 
        { status: 400 }
      )
    }

    const result = await tanaposService.smartSearch(query)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search failed' }, 
      { status: 500 }
    )
  }
}
