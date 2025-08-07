// 成就系統類型定義
export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  type: AchievementType
  requirement: number
  currentProgress: number
  isUnlocked: boolean
  unlockedAt?: Date
  reward: AchievementReward
}

export type AchievementType = 
  | 'level' 
  | 'interactions' 
  | 'feedings' 
  | 'happiness' 
  | 'health' 
  | 'skills' 
  | 'special'

export interface AchievementReward {
  type: 'coins' | 'experience' | 'skill' | 'cosmetic'
  amount?: number
  skillType?: 'chat' | 'service' | 'loyalty'
  cosmeticItem?: string
}

export const ACHIEVEMENTS: Achievement[] = [
  // 等級成就
  {
    id: 'level_5',
    title: '初級訓練師',
    description: '阿狸達到5級',
    emoji: '🎓',
    type: 'level',
    requirement: 5,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'coins', amount: 50 }
  },
  {
    id: 'level_10',
    title: '中級訓練師',
    description: '阿狸達到10級',
    emoji: '🏆',
    type: 'level',
    requirement: 10,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'coins', amount: 100 }
  },
  {
    id: 'level_20',
    title: '高級訓練師',
    description: '阿狸達到20級',
    emoji: '👑',
    type: 'level',
    requirement: 20,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'coins', amount: 200 }
  },

  // 互動成就
  {
    id: 'interactions_50',
    title: '友好夥伴',
    description: '與阿狸互動50次',
    emoji: '🤝',
    type: 'interactions',
    requirement: 50,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'experience', amount: 100 }
  },
  {
    id: 'interactions_100',
    title: '親密朋友',
    description: '與阿狸互動100次',
    emoji: '💕',
    type: 'interactions',
    requirement: 100,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'skill', skillType: 'loyalty', amount: 10 }
  },
  {
    id: 'interactions_250',
    title: '靈魂伴侶',
    description: '與阿狸互動250次',
    emoji: '💖',
    type: 'interactions',
    requirement: 250,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'coins', amount: 300 }
  },

  // 餵食成就
  {
    id: 'feedings_20',
    title: '美食愛好者',
    description: '餵食阿狸20次',
    emoji: '🍽️',
    type: 'feedings',
    requirement: 20,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'coins', amount: 75 }
  },
  {
    id: 'feedings_50',
    title: '專業廚師',
    description: '餵食阿狸50次',
    emoji: '👨‍🍳',
    type: 'feedings',
    requirement: 50,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'skill', skillType: 'service', amount: 15 }
  },

  // 快樂值成就
  {
    id: 'max_happiness',
    title: '快樂專家',
    description: '讓阿狸的快樂值達到100',
    emoji: '😊',
    type: 'happiness',
    requirement: 100,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'experience', amount: 50 }
  },

  // 健康成就
  {
    id: 'max_health',
    title: '健康守護者',
    description: '保持阿狸健康值滿格',
    emoji: '❤️',
    type: 'health',
    requirement: 100,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'coins', amount: 60 }
  },

  // 技能成就
  {
    id: 'chat_skill_50',
    title: '聊天大師',
    description: '聊天技能達到50',
    emoji: '💬',
    type: 'skills',
    requirement: 50,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'coins', amount: 120 }
  },
  {
    id: 'service_skill_50',
    title: '服務專家',
    description: '服務技能達到50',
    emoji: '🎯',
    type: 'skills',
    requirement: 50,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'coins', amount: 120 }
  },

  // 特殊成就
  {
    id: 'first_week',
    title: '第一週',
    description: '阿狸存活滿7天',
    emoji: '📅',
    type: 'special',
    requirement: 7,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'coins', amount: 150 }
  },
  {
    id: 'night_owl',
    title: '夜貓子',
    description: '在深夜(23:00-05:00)與阿狸互動',
    emoji: '🌙',
    type: 'special',
    requirement: 1,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'experience', amount: 25 }
  },
  {
    id: 'early_bird',
    title: '早起鳥',
    description: '在清晨(05:00-07:00)與阿狸互動',
    emoji: '🌅',
    type: 'special',
    requirement: 1,
    currentProgress: 0,
    isUnlocked: false,
    reward: { type: 'experience', amount: 25 }
  }
]
