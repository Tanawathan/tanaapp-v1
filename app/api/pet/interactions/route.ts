import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/client'

// GET /api/pet/interactions?userId=default&limit=20
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default'
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const { data: petRow, error: petError } = await supabaseServer
      .from('virtual_pets')
      .select('id, level, experience, experience_to_next')
      .eq('user_id', userId)
      .limit(1)
      .single()
    if (petError) throw petError
    if (!petRow) return NextResponse.json({ success: false, error: '找不到寵物' }, { status: 404 })

    const { data: interactions, error: intError } = await supabaseServer
      .from('pet_interactions')
      .select('id, interaction_type, experience_gained, result, created_at')
      .eq('pet_id', petRow.id)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (intError) throw intError

    return NextResponse.json({
      success: true,
      pet: {
        id: petRow.id,
        level: petRow.level,
        experience: petRow.experience,
        experienceToNext: petRow.experience_to_next
      },
      interactions
    })
  } catch (error) {
    console.error('Pet interactions GET error:', error)
    return NextResponse.json({ success: false, error: '獲取互動紀錄失敗' }, { status: 500 })
  }
}
