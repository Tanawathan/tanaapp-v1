import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/client'

async function checkTable(table: string) {
  try {
    const { error } = await supabaseServer.from(table).select('id').limit(1)
    if (error) {
      if ((error as any).code === '42P01') return { table, exists: false, error: 'not_found' }
      return { table, exists: false, error: (error as Error).message }
    }
    return { table, exists: true }
  } catch (e) {
    return { table, exists: false, error: (e as Error).message }
  }
}

export async function GET() {
  const tables = ['restaurants', 'tables', 'reservations']
  const results = await Promise.all(tables.map(checkTable))
  const missing = results.filter(r => !r.exists).map(r => r.table)
  const aiReady = !!process.env.OPENAI_API_KEY

  return NextResponse.json({
    status: missing.length === 0 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    db: { checks: results, missing },
    ai: { ready: aiReady, message: aiReady ? 'AI key present' : 'OPENAI_API_KEY not configured' },
    env: {
      supabaseUrlPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRolePresent: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  })
}
