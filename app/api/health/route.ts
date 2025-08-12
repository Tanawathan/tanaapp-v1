import { NextResponse } from 'next/server'
// Use defined path alias @/* which maps to src/*
import { checkDatabaseConnection } from '@/lib/supabase/client'

export async function GET() {
  // Basic environment presence check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing'
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing'

  const db = await checkDatabaseConnection()

  return NextResponse.json({
    status: 'ok',
    env: {
      supabaseUrl,
      anonKey: anon,
      serviceRoleKey: service
    },
    database: db
  })
}
