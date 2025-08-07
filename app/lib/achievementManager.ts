import { Achievement, ACHIEVEMENTS, AchievementType } from '../types/achievements'
import { VirtualPet } from '../types/pet'

export class AchievementManager {
  private static instance: AchievementManager
  private achievements: Achievement[] = []

  private constructor() {
    this.achievements = [...ACHIEVEMENTS]
  }

  public static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager()
    }
    return AchievementManager.instance
  }

  // 更新成就進度
  updateAchievements(pet: VirtualPet): Achievement[] {
    const newlyUnlocked: Achievement[] = []

    this.achievements = this.achievements.map(achievement => {
      if (achievement.isUnlocked) return achievement

      let currentProgress = achievement.currentProgress
      let isUnlocked = false

      switch (achievement.type) {
        case 'level':
          currentProgress = pet.level
          isUnlocked = pet.level >= achievement.requirement
          break

        case 'interactions':
          currentProgress = pet.totalInteractions
          isUnlocked = pet.totalInteractions >= achievement.requirement
          break

        case 'feedings':
          currentProgress = pet.totalFeedings
          isUnlocked = pet.totalFeedings >= achievement.requirement
          break

        case 'happiness':
          currentProgress = pet.happiness
          isUnlocked = pet.happiness >= achievement.requirement
          break

        case 'health':
          currentProgress = pet.health
          isUnlocked = pet.health >= achievement.requirement
          break

        case 'skills':
          if (achievement.id === 'chat_skill_50') {
            currentProgress = pet.chatSkill
            isUnlocked = pet.chatSkill >= achievement.requirement
          } else if (achievement.id === 'service_skill_50') {
            currentProgress = pet.serviceSkill
            isUnlocked = pet.serviceSkill >= achievement.requirement
          }
          break

        case 'special':
          if (achievement.id === 'first_week') {
            currentProgress = pet.daysAlive
            isUnlocked = pet.daysAlive >= achievement.requirement
          } else if (achievement.id === 'night_owl') {
            const hour = new Date().getHours()
            if ((hour >= 23 || hour <= 5) && !achievement.isUnlocked) {
              currentProgress = 1
              isUnlocked = true
            }
          } else if (achievement.id === 'early_bird') {
            const hour = new Date().getHours()
            if (hour >= 5 && hour <= 7 && !achievement.isUnlocked) {
              currentProgress = 1
              isUnlocked = true
            }
          }
          break
      }

      const updatedAchievement = {
        ...achievement,
        currentProgress,
        isUnlocked,
        unlockedAt: isUnlocked && !achievement.isUnlocked ? new Date() : achievement.unlockedAt
      }

      // 如果剛解鎖，添加到新解鎖列表
      if (isUnlocked && !achievement.isUnlocked) {
        newlyUnlocked.push(updatedAchievement)
      }

      return updatedAchievement
    })

    return newlyUnlocked
  }

  // 獲取所有成就
  getAllAchievements(): Achievement[] {
    return [...this.achievements]
  }

  // 獲取已解鎖的成就
  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.isUnlocked)
  }

  // 獲取未解鎖的成就
  getLockedAchievements(): Achievement[] {
    return this.achievements.filter(a => !a.isUnlocked)
  }

  // 獲取特定類型的成就
  getAchievementsByType(type: AchievementType): Achievement[] {
    return this.achievements.filter(a => a.type === type)
  }

  // 獲取成就完成度統計
  getAchievementStats() {
    const total = this.achievements.length
    const unlocked = this.achievements.filter(a => a.isUnlocked).length
    const percentage = Math.round((unlocked / total) * 100)

    return {
      total,
      unlocked,
      locked: total - unlocked,
      percentage
    }
  }

  // 獲取接近完成的成就
  getNearCompletionAchievements(threshold: number = 0.8): Achievement[] {
    return this.achievements
      .filter(a => !a.isUnlocked)
      .filter(a => (a.currentProgress / a.requirement) >= threshold)
      .sort((a, b) => (b.currentProgress / b.requirement) - (a.currentProgress / a.requirement))
  }

  // 獲取成就獎勵描述
  getRewardDescription(achievement: Achievement): string {
    const { reward } = achievement
    
    switch (reward.type) {
      case 'coins':
        return `💰 ${reward.amount} 金幣`
      case 'experience':
        return `✨ ${reward.amount} 經驗值`
      case 'skill':
        const skillNames = {
          chat: '聊天技能',
          service: '服務技能',
          loyalty: '忠誠技能'
        }
        return `🎯 ${skillNames[reward.skillType!]} +${reward.amount}`
      case 'cosmetic':
        return `👕 ${reward.cosmeticItem}`
      default:
        return '🎁 特殊獎勵'
    }
  }

  // 獲取成就進度百分比
  getProgressPercentage(achievement: Achievement): number {
    return Math.min(100, Math.round((achievement.currentProgress / achievement.requirement) * 100))
  }

  // 重置所有成就（用於測試）
  resetAchievements() {
    this.achievements = ACHIEVEMENTS.map(a => ({
      ...a,
      currentProgress: 0,
      isUnlocked: false,
      unlockedAt: undefined
    }))
  }

  // 模擬解鎖成就（用於測試）
  unlockAchievement(achievementId: string) {
    this.achievements = this.achievements.map(a => 
      a.id === achievementId 
        ? { ...a, isUnlocked: true, unlockedAt: new Date() }
        : a
    )
  }

  // 獲取成就提示消息
  getAchievementTip(): string {
    const nearCompletion = this.getNearCompletionAchievements(0.7)
    if (nearCompletion.length > 0) {
      const achievement = nearCompletion[0]
      const remaining = achievement.requirement - achievement.currentProgress
      return `🎯 快完成成就「${achievement.title}」了！還需要 ${remaining} 點進度`
    }

    const locked = this.getLockedAchievements()
    if (locked.length > 0) {
      const randomAchievement = locked[Math.floor(Math.random() * locked.length)]
      return `💡 嘗試解鎖成就「${randomAchievement.title}」：${randomAchievement.description}`
    }

    return '🏆 恭喜！您已經解鎖了所有成就！'
  }
}

// 導出單例實例
export const achievementManager = AchievementManager.getInstance()
