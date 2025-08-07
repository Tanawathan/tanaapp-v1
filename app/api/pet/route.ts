import { NextRequest, NextResponse } from 'next/server'
import { VirtualPet, PetMood, PetActivity, PetAppearance } from '../../types/pet'

// 模擬資料庫 - 在實際專案中應該使用真實資料庫
let petDatabase: VirtualPet[] = []

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
    
    let pet = petDatabase.find(p => p.id.includes(userId))
    
    if (!pet) {
      // 如果沒有寵物，創建一個新的
      pet = createDefaultPet(userId)
      petDatabase.push(pet)
    }
    
    // 更新寵物狀態
    pet = updatePetStatus(pet)
    
    return NextResponse.json({
      success: true,
      pet
    })
    
  } catch (error) {
    console.error('Pet GET error:', error)
    return NextResponse.json({
      success: false,
      error: '獲取寵物資訊失敗'
    }, { status: 500 })
  }
}

// POST - 與寵物互動
export async function POST(request: NextRequest) {
  try {
    const { action, userId = 'default', data } = await request.json()
    
    let pet = petDatabase.find(p => p.id.includes(userId))
    if (!pet) {
      pet = createDefaultPet(userId)
      petDatabase.push(pet)
    }
    
    const now = new Date()
    let experienceGained = 0
    let message = ''
    
    switch (action) {
      case 'feed':
        if (pet.hunger > 10) {
          pet.hunger = Math.max(0, pet.hunger - 30)
          pet.happiness = Math.min(pet.maxHappiness, pet.happiness + 15)
          pet.energy = Math.min(pet.maxEnergy, pet.energy + 10)
          experienceGained = 10
          pet.totalFeedings++
          pet.lastFeedTime = now
          message = '阿狸吃得很開心！肚子不餓了～ 🍽️'
        } else {
          message = '阿狸現在還不餓呢～等等再餵吧！'
        }
        break
        
      case 'pet':
        pet.happiness = Math.min(pet.maxHappiness, pet.happiness + 10)
        experienceGained = 5
        pet.loyaltySkill = Math.min(100, pet.loyaltySkill + 1)
        message = '阿狸很喜歡被摸摸～心情變好了！ ❤️'
        break
        
      case 'play':
        if (pet.energy > 20) {
          pet.energy = Math.max(0, pet.energy - 15)
          pet.happiness = Math.min(pet.maxHappiness, pet.happiness + 20)
          experienceGained = 15
          pet.serviceSkill = Math.min(100, pet.serviceSkill + 1)
          message = '和阿狸一起玩得很開心！它學會了新技能！ 🎮'
        } else {
          message = '阿狸太累了，讓它休息一下吧～'
        }
        break
        
      case 'chat':
        pet.happiness = Math.min(pet.maxHappiness, pet.happiness + 5)
        experienceGained = 8
        pet.chatSkill = Math.min(100, pet.chatSkill + 1)
        message = '阿狸很喜歡和你聊天！溝通能力提升了！ 💬'
        break
        
      case 'exercise':
        if (pet.energy > 30) {
          pet.energy = Math.max(0, pet.energy - 25)
          pet.health = Math.min(pet.maxHealth, pet.health + 10)
          experienceGained = 12
          message = '運動讓阿狸變得更健康了！ 💪'
        } else {
          message = '阿狸沒有足夠的能量運動～'
        }
        break
        
      case 'rest':
        pet.energy = Math.min(pet.maxEnergy, pet.energy + 30)
        pet.health = Math.min(pet.maxHealth, pet.health + 5)
        message = '阿狸睡得很香～體力恢復了！ 😴'
        break
        
      default:
        return NextResponse.json({
          success: false,
          error: '未知的互動類型'
        }, { status: 400 })
    }
    
    // 獲得經驗值和升級檢查
    pet.experience += experienceGained
    pet.totalInteractions++
    pet.lastInteractionTime = now
    
    // 檢查升級
    let leveledUp = false
    while (pet.experience >= pet.experienceToNext) {
      pet.experience -= pet.experienceToNext
      pet.level++
      pet.experienceToNext = Math.floor(pet.experienceToNext * 1.2) // 每級所需經驗增加20%
      pet.maxHealth += 5
      pet.maxHappiness += 2
      pet.maxEnergy += 3
      pet.health = pet.maxHealth // 升級時恢復滿血
      leveledUp = true
    }
    
    if (leveledUp) {
      message += ` 🎉 恭喜！阿狸升級到了 ${pet.level} 級！`
    }
    
    // 更新寵物狀態
    pet = updatePetStatus(pet)
    
    return NextResponse.json({
      success: true,
      pet,
      message,
      experienceGained,
      leveledUp
    })
    
  } catch (error) {
    console.error('Pet POST error:', error)
    return NextResponse.json({
      success: false,
      error: '互動失敗'
    }, { status: 500 })
  }
}
