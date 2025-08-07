// 虛擬寵物類型定義
export interface VirtualPet {
  id: string
  name: string
  species: string // 寵物種類 (狸貓、狐狸等)
  level: number
  experience: number
  experienceToNext: number
  
  // 基本屬性
  health: number
  maxHealth: number
  happiness: number
  maxHappiness: number
  energy: number
  maxEnergy: number
  hunger: number
  maxHunger: number
  
  // 技能屬性
  chatSkill: number // 聊天技能
  serviceSkill: number // 服務技能
  loyaltySkill: number // 忠誠度技能
  
  // 狀態
  mood: PetMood
  activity: PetActivity
  lastFeedTime: Date
  lastInteractionTime: Date
  
  // 外觀
  appearance: PetAppearance
  
  // 統計
  totalInteractions: number
  totalFeedings: number
  daysAlive: number
  
  // 創建和更新時間
  createdAt: Date
  updatedAt: Date
}

export type PetMood = 'happy' | 'sad' | 'excited' | 'tired' | 'hungry' | 'content' | 'playful'

export type PetActivity = 'sleeping' | 'eating' | 'playing' | 'chatting' | 'resting' | 'working'

export interface PetAppearance {
  color: string
  pattern: string
  accessories: string[]
  emoji: string
}

export interface PetInteraction {
  id: string
  petId: string
  type: InteractionType
  timestamp: Date
  experienceGained: number
  result: string
}

export type InteractionType = 'feed' | 'pet' | 'play' | 'chat' | 'exercise' | 'rest'

export interface PetFood {
  id: string
  name: string
  emoji: string
  hungerRestore: number
  happinessBonus: number
  experienceBonus: number
  energyBonus: number
  price: number
  description: string
}

export interface PetStats {
  totalExperience: number
  levelProgress: number
  overallHealth: number
  skillAverage: number
  moodRating: number
}
