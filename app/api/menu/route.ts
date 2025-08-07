import { NextRequest, NextResponse } from 'next/server'
import { TanaPOSService } from '../../../src/lib/services/tanaposService'

const tanaposService = TanaPOSService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category')

    const result = await tanaposService.getAIContext()

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // 如果指定了分類，只返回該分類的商品
    if (categoryId && result.data) {
      const filteredProducts = result.data.menu.products.filter(
        product => product.category_id === categoryId
      )
      result.data.menu.products = filteredProducts
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Menu API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu data' }, 
      { status: 500 }
    )
  }
}
