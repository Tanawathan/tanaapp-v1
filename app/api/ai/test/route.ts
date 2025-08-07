import { NextRequest, NextResponse } from 'next/server'
import { chatWithAI, detectScenario } from '../../../lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { message, type = 'chat' } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (type === 'detect') {
      // 場景檢測測試
      const result = await detectScenario(message)
      return NextResponse.json({ 
        success: true, 
        data: result 
      })
    } else {
      // 一般對話測試
      const response = await chatWithAI([
        { role: 'user', content: message }
      ])
      return NextResponse.json({ 
        success: true, 
        response 
      })
    }
  } catch (error) {
    console.error('AI API Error:', error)
    return NextResponse.json({ 
      error: 'AI service error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'AI API is running',
    models: {
      chat: 'gpt-4o-nano',
      function: 'gpt-4o-mini'
    }
  })
}
