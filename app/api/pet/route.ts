import { NextRequest, NextResponse } from 'next/server'
import { VirtualPet, PetMood, PetActivity, PetAppearance } from '../../types/pet'
import { supabaseServer } from '@/lib/supabase/client'

// 轉換 DB 資料列為 VirtualPet 物件
function mapRowToPet(row: any): VirtualPet {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    level: row.level,
    experience: row.experience,
    experienceToNext: row.experience_to_next,
    health: row.health,
    maxHealth: row.max_health,
    happiness: row.happiness,
    maxHappiness: row.max_happiness,
    energy: row.energy,
    maxEnergy: row.max_energy,
    hunger: row.hunger,
    maxHunger: row.max_hunger,
    chatSkill: row.chat_skill,
    serviceSkill: row.service_skill,
    loyaltySkill: row.loyalty_skill,
    mood: row.mood as PetMood,
    activity: row.activity as PetActivity,
    lastFeedTime: new Date(row.last_feed_time),
    lastInteractionTime: new Date(row.last_interaction_time),
    appearance: row.appearance as PetAppearance,
    totalInteractions: row.total_interactions,
    totalFeedings: row.total_feedings,
    daysAlive: row.days_alive,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }
}

// 創建預設寵物
function createDefaultPet(userId: string = 'default'): VirtualPet {
  const now = new Date()
  return {
    id: `pet_${Date.now()}`,
    name: '阿狸',
    species: 'fox',
    level: 1,
    experience: 0,
    experienceToNext: 100,
    
    health: 100,
    maxHealth: 100,
    happiness: 80,
    maxHappiness: 100,
    energy: 90,
    maxEnergy: 100,
    hunger: 30,
    maxHunger: 100,
    
    chatSkill: 5,
    serviceSkill: 5,
    loyaltySkill: 5,
    
    mood: 'happy' as PetMood,
    activity: 'chatting' as PetActivity,
    lastFeedTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2小時前
    lastInteractionTime: new Date(now.getTime() - 30 * 60 * 1000), // 30分鐘前
    
    appearance: {
      color: 'orange',
      pattern: 'standard',
      accessories: [],
      emoji: '🦊'
    } as PetAppearance,
    
    totalInteractions: 15,
    totalFeedings: 8,
    daysAlive: 3,
    
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3天前
    updatedAt: now
  }
}

// 更新寵物狀態（基於時間流逝）
function updatePetStatus(pet: VirtualPet): VirtualPet {
  const now = new Date()
  const timeSinceLastFeed = now.getTime() - pet.lastFeedTime.getTime()
  const timeSinceLastInteraction = now.getTime() - pet.lastInteractionTime.getTime()
  
  // 隨時間降低飢餓度（增加飢餓值）
  const hoursSinceLastFeed = timeSinceLastFeed / (1000 * 60 * 60)
  const hungerIncrease = Math.floor(hoursSinceLastFeed * 5) // 每小時增加5點飢餓
  pet.hunger = Math.min(pet.maxHunger, pet.hunger + hungerIncrease)
  
  // 隨時間降低能量
  const hoursActive = timeSinceLastInteraction / (1000 * 60 * 60)
  const energyDecrease = Math.floor(hoursActive * 2) // 每小時減少2點能量
  pet.energy = Math.max(0, pet.energy - energyDecrease)
  
  // 根據飢餓和能量調整心情
  if (pet.hunger > 80) {
    pet.mood = 'hungry'
    pet.happiness = Math.max(20, pet.happiness - 10)
  } else if (pet.energy < 20) {
    pet.mood = 'tired'
    pet.happiness = Math.max(30, pet.happiness - 5)
  } else if (pet.happiness > 80) {
    pet.mood = 'happy'
  } else if (pet.happiness > 60) {
    pet.mood = 'content'
  } else if (pet.happiness < 40) {
    pet.mood = 'sad'
  } else {
    pet.mood = 'content'
  }
  
  // 根據心情調整活動
  if (pet.mood === 'tired' || pet.energy < 20) {
    pet.activity = 'resting'
  } else if (pet.mood === 'hungry') {
    pet.activity = 'resting'
  } else if (pet.mood === 'happy') {
    pet.activity = 'chatting'
  } else {
    pet.activity = 'resting'
  }
  
  pet.updatedAt = now
  return pet
}

// GET - 獲取寵物資訊
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default'

    // 讀取 DB
    const { data: rows, error } = await supabaseServer
      .from('virtual_pets')
      .select('*')
      .eq('user_id', userId)
      .limit(1)

    if (error) throw error

    let pet: VirtualPet

    if (!rows || rows.length === 0) {
      // 建立預設寵物並插入
      const newPet = createDefaultPet(userId)
      const insertPayload = {
        user_id: userId,
        name: newPet.name,
        species: newPet.species,
        level: newPet.level,
        experience: newPet.experience,
        experience_to_next: newPet.experienceToNext,
        health: newPet.health,
        max_health: newPet.maxHealth,
        happiness: newPet.happiness,
        max_happiness: newPet.maxHappiness,
        energy: newPet.energy,
        max_energy: newPet.maxEnergy,
        hunger: newPet.hunger,
        max_hunger: newPet.maxHunger,
        chat_skill: newPet.chatSkill,
        service_skill: newPet.serviceSkill,
        loyalty_skill: newPet.loyaltySkill,
        mood: newPet.mood,
        activity: newPet.activity,
        last_feed_time: newPet.lastFeedTime.toISOString(),
        last_interaction_time: newPet.lastInteractionTime.toISOString(),
        appearance: newPet.appearance,
        total_interactions: newPet.totalInteractions,
        total_feedings: newPet.totalFeedings,
        days_alive: newPet.daysAlive
      }
      const { data: inserted, error: insertError } = await supabaseServer
        .from('virtual_pets')
        .insert(insertPayload)
        .select('*')
        .single()
      if (insertError) throw insertError
      pet = mapRowToPet(inserted)
    } else {
      pet = mapRowToPet(rows[0])
    }

    pet = updatePetStatus(pet)

    // 寫回更新欄位（非阻塞，可等待）
    await supabaseServer.from('virtual_pets').update({
      hunger: pet.hunger,
      energy: pet.energy,
      mood: pet.mood,
      activity: pet.activity,
      happiness: pet.happiness,
      updated_at: new Date().toISOString()
    }).eq('id', pet.id)

    return NextResponse.json({ success: true, pet })
  } catch (error) {
    console.error('Pet GET error:', error)
    return NextResponse.json({ success: false, error: '獲取寵物資訊失敗' }, { status: 500 })
  }
}

// POST - 與寵物互動
export async function POST(request: NextRequest) {
  try {
    const { action, userId = 'default' } = await request.json()
    const { data: rows, error } = await supabaseServer
      .from('virtual_pets')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
    if (error) throw error

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: '寵物不存在，請先執行 GET 建立。' }, { status: 400 })
    }
    let pet = mapRowToPet(rows[0])

    const now = new Date()
    let experienceGained = 0
    let message = ''

    // 讀取動作配置
    const { data: actionCfg, error: actionErr } = await supabaseServer
      .from('pet_action_config')
      .select('*')
      .eq('action', action)
      .single()
    if (actionErr || !actionCfg) {
      return NextResponse.json({ success: false, error: '未知的互動類型' }, { status: 400 })
    }

    // 檢查前置條件
    if (actionCfg.min_energy && pet.energy < actionCfg.min_energy) {
      return NextResponse.json({ success: false, error: '能量不足，無法執行該動作。' }, { status: 400 })
    }
    if (action === 'feed' && actionCfg.min_hunger && pet.hunger <= actionCfg.min_hunger) {
      return NextResponse.json({ success: false, error: '現在不太餓，稍後再餵吧。' }, { status: 400 })
    }

    // 套用變化
    const clamp = (v:number,min:number,max:number)=>Math.min(max,Math.max(min,v))
    if (action === 'feed') pet.totalFeedings++
    pet.hunger = clamp(pet.hunger + (actionCfg.hunger_change||0), 0, pet.maxHunger)
    pet.happiness = clamp(pet.happiness + (actionCfg.happiness_change||0), 0, pet.maxHappiness)
    pet.energy = clamp(pet.energy + (actionCfg.energy_change||0), 0, pet.maxEnergy)
    pet.health = clamp(pet.health + (actionCfg.health_change||0), 0, pet.maxHealth)
    pet.chatSkill = clamp(pet.chatSkill + (actionCfg.chat_skill_change||0), 0, 100)
    pet.serviceSkill = clamp(pet.serviceSkill + (actionCfg.service_skill_change||0), 0, 100)
    pet.loyaltySkill = clamp(pet.loyaltySkill + (actionCfg.loyalty_skill_change||0), 0, 100)
    experienceGained = actionCfg.experience_gain || 0
    pet.totalInteractions++
    pet.lastInteractionTime = now
    if (action === 'feed') pet.lastFeedTime = now
    message = actionCfg.description || '互動完成'

    pet.experience += experienceGained
    pet.totalInteractions++
    pet.lastInteractionTime = now

    let leveledUp = false
    // 讀取升級倍率
    const { data: lvlCfg } = await supabaseServer
      .from('pet_leveling_config')
      .select('experience_multiplier')
      .eq('id', 1)
      .single()
    const multiplier = lvlCfg?.experience_multiplier || 1.2

    while (pet.experience >= pet.experienceToNext) {
      pet.experience -= pet.experienceToNext
      pet.level++
      pet.experienceToNext = Math.floor(pet.experienceToNext * multiplier)
      pet.maxHealth += 5
      pet.maxHappiness += 2
      pet.maxEnergy += 3
      pet.health = pet.maxHealth
      leveledUp = true
    }
    if (leveledUp) message += ` 🎉 恭喜！阿狸升級到了 ${pet.level} 級！`

    pet = updatePetStatus(pet)

    // 寫互動紀錄
    await supabaseServer.from('pet_interactions').insert({
      pet_id: pet.id,
      interaction_type: action,
      experience_gained: experienceGained,
      result: message
    })

    // 更新寵物狀態
    await supabaseServer.from('virtual_pets').update({
      level: pet.level,
      experience: pet.experience,
      experience_to_next: pet.experienceToNext,
      health: pet.health,
      happiness: pet.happiness,
      energy: pet.energy,
      hunger: pet.hunger,
      chat_skill: pet.chatSkill,
      service_skill: pet.serviceSkill,
      loyalty_skill: pet.loyaltySkill,
      mood: pet.mood,
      activity: pet.activity,
      last_feed_time: pet.lastFeedTime.toISOString(),
      last_interaction_time: pet.lastInteractionTime.toISOString(),
      total_interactions: pet.totalInteractions,
      total_feedings: pet.totalFeedings,
      updated_at: new Date().toISOString()
    }).eq('id', pet.id)

    return NextResponse.json({ success: true, pet, message, experienceGained, leveledUp })
  } catch (error) {
    console.error('Pet POST error:', error)
    return NextResponse.json({ success: false, error: '互動失敗' }, { status: 500 })
  }
}
