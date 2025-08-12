import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/client'

function validate(body: any) {
  const errors: string[] = []
  if (!body.customer_name) errors.push('customer_name required')
  if (!body.customer_phone) errors.push('customer_phone required')
  if (!body.party_size || body.party_size < 1) errors.push('party_size invalid')
  if (!body.reservation_date) errors.push('reservation_date required')
  if (!body.reservation_time) errors.push('reservation_time required')
  return errors
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const date = url.searchParams.get('date')
  const status = url.searchParams.get('status')

  let query = supabaseServer.from('reservations').select('*').order('reservation_date', { ascending: true })
  if (date) query = query.eq('reservation_date', date)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const errors = validate(body)
  if (errors.length) return NextResponse.json({ errors }, { status: 400 })
  const insertData = {
    restaurant_id: process.env.RESTAURANT_ID,
    customer_name: body.customer_name,
    customer_phone: body.customer_phone,
    customer_email: body.customer_email || null,
    party_size: body.party_size,
    reservation_date: body.reservation_date,
    reservation_time: body.reservation_time,
    status: body.status || 'pending',
    special_requests: body.special_requests || null,
    created_via: body.created_via || 'manual'
  }
  const { data, error } = await supabaseServer.from('reservations').insert(insertData).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PATCH(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const update: any = {}
  ;['status','special_requests','party_size','reservation_time','reservation_date'].forEach(k => { if (body[k] !== undefined) update[k] = body[k] })
  update.updated_at = new Date().toISOString()
  const { data, error } = await supabaseServer.from('reservations').update(update).eq('id', body.id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id query param required' }, { status: 400 })
  const { error } = await supabaseServer.from('reservations').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
