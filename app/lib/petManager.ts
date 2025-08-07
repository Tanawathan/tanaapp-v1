import { VirtualPet, PetStats, PetMood, PetActivity } from '../types/pet'
import { achievementManager } from './achievementManager'

export class PetManager {
  private static instance: PetManager
  private pet: VirtualPet | null = null

  private constructor() {}

  public static getInstance(): PetManager {
    if (!PetManager.instance) {
      PetManager.instance = new PetManager()
    }
    return PetManager.instance
  }

  // 獲取寵物資料
  async getPet(userId: string = 'default'): Promise<VirtualPet> {
    try {
      const response = await fetch(`/api/pet?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        this.pet = data.pet
        return data.pet
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('獲取寵物失敗:', error)
      throw error
    }
  }

  // 與寵物互動
  async interactWithPet(action: string, userId: string = 'default', data?: any): Promise<{
    pet: VirtualPet
    message: string
    experienceGained: number
    leveledUp: boolean
    newAchievements?: any[]
  }> {
    try {
      const response = await fetch('/api/pet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, userId, data })
      })
      
      const result = await response.json()
      
      if (result.success) {
        this.pet = result.pet
        
        // 檢查成就
        const newAchievements = achievementManager.updateAchievements(result.pet)
        
        return {
          ...result,
          newAchievements
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('寵物互動失敗:', error)
      throw error
    }
  }

  // 餵食寵物
  async feedPet(userId?: string) {
    return await this.interactWithPet('feed', userId)
  }

  // 撫摸寵物
  async petPet(userId?: string) {
    return await this.interactWithPet('pet', userId)
  }

  // 和寵物玩耍
  async playWithPet(userId?: string) {
    return await this.interactWithPet('play', userId)
  }

  // 和寵物聊天
  async chatWithPet(userId?: string) {
    return await this.interactWithPet('chat', userId)
  }

  // 讓寵物運動
  async exercisePet(userId?: string) {
    return await this.interactWithPet('exercise', userId)
  }

  // 讓寵物休息
  async restPet(userId?: string) {
    return await this.interactWithPet('rest', userId)
  }

  // 獲取寵物統計資訊
  getPetStats(pet: VirtualPet): PetStats {
    const levelProgress = (pet.experience / pet.experienceToNext) * 100
    const overallHealth = (pet.health / pet.maxHealth) * 100
    const skillAverage = (pet.chatSkill + pet.serviceSkill + pet.loyaltySkill) / 3
    const moodRating = this.getMoodRating(pet.mood)

    return {
      totalExperience: pet.experience + (pet.level - 1) * 100, // 簡化計算
      levelProgress,
      overallHealth,
      skillAverage,
      moodRating
    }
  }

  // 獲取心情評分
  private getMoodRating(mood: PetMood): number {
    const moodScores = {
      'happy': 100,
      'excited': 95,
      'playful': 90,
      'content': 80,
      'tired': 60,
      'sad': 40,
      'hungry': 30
    }
    return moodScores[mood] || 70
  }

  // 獲取心情描述
  getMoodDescription(mood: PetMood): string {
    const descriptions = {
      'happy': '開心 😊',
      'excited': '興奮 🤩',
      'playful': '頑皮 😄',
      'content': '滿足 😌',
      'tired': '疲累 😪',
      'sad': '難過 😢',
      'hungry': '肚子餓 🍽️'
    }
    return descriptions[mood] || '未知心情'
  }

  // 獲取活動描述
  getActivityDescription(activity: PetActivity): string {
    const descriptions = {
      'sleeping': '睡覺中 💤',
      'eating': '吃飯中 🍽️',
      'playing': '玩耍中 🎮',
      'chatting': '聊天中 💬',
      'resting': '休息中 😌',
      'working': '工作中 💼'
    }
    return descriptions[activity] || '未知活動'
  }

  // 獲取建議行動
  getRecommendedActions(pet: VirtualPet): string[] {
    const actions: string[] = []
    
    if (pet.hunger > 70) {
      actions.push('餵食')
    }
    
    if (pet.energy < 30) {
      actions.push('休息')
    }
    
    if (pet.happiness < 50) {
      actions.push('撫摸')
      actions.push('玩耍')
    }
    
    if (pet.health < pet.maxHealth * 0.8) {
      actions.push('運動')
    }
    
    if (actions.length === 0) {
      actions.push('聊天', '玩耍')
    }
    
    return actions
  }

  // 獲取寵物等級稱號
  getLevelTitle(level: number): string {
    if (level >= 50) return '傳說服務員'
    if (level >= 30) return '大師服務員'
    if (level >= 20) return '專家服務員'
    if (level >= 10) return '熟練服務員'
    if (level >= 5) return '進階服務員'
    return '新手服務員'
  }

  // 獲取寵物狀態顏色
  getStatusColor(value: number, maxValue: number): string {
    const percentage = (value / maxValue) * 100
    if (percentage >= 80) return 'text-green-500'
    if (percentage >= 50) return 'text-yellow-500'
    if (percentage >= 30) return 'text-orange-500'
    return 'text-red-500'
  }

  // 獲取當前寵物
  getCurrentPet(): VirtualPet | null {
    return this.pet
  }
}

// 導出單例實例
export const petManager = PetManager.getInstance()
