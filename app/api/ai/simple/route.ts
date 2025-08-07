import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    // 簡單回應測試
    const response = `您好！我是A-Li，我收到了您的訊息：「${message}」🍛 我正在學習如何更好地幫助您！`
    
    return NextResponse.json({ 
      success: true, 
      response 
    })
  } catch (error) {
    console.error('Simple AI Error:', error)
    return NextResponse.json({ 
      error: 'AI service error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Simple AI is running',
    message: 'AI功能正常運行中'
  })
}
