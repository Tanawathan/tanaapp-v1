import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'

interface RequestBody {
  text: string
  language?: 'zh' | 'en'
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY missing' }, { status: 501 })
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!body.text || body.text.length < 5) {
    return NextResponse.json({ error: 'text is required (min 5 chars)' }, { status: 400 })
  }

  const openai = new OpenAI({ apiKey })
  const prompt = `Summarize the following restaurant reservation info in concise JSON with fields: customer_name, party_size, date, time, requests. Text:\n${body.text}`

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a reservation extraction assistant. Output ONLY JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 250
    })

    const content = chat.choices[0]?.message?.content || '{}'
    let parsed: any = {}
    try { parsed = JSON.parse(content) } catch { /* ignore parse error */ }

    return NextResponse.json({ ok: true, raw: content, parsed })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
