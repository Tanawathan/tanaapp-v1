'use client'

import { useState, useEffect } from 'react'
import { Achievement, AchievementType } from '../types/achievements'
import { achievementManager } from '../lib/achievementManager'

interface AchievementPanelProps {
  onClose?: () => void
}

export default function AchievementPanel({ onClose }: AchievementPanelProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedType, setSelectedType] = useState<AchievementType | 'all'>('all')
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false)

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = () => {
    const allAchievements = achievementManager.getAllAchievements()
    setAchievements(allAchievements)
  }

  const filteredAchievements = achievements.filter(achievement => {
    if (showOnlyUnlocked && !achievement.isUnlocked) return false
    if (selectedType !== 'all' && achievement.type !== selectedType) return false
    return true
  })

  const stats = achievementManager.getAchievementStats()

  const typeLabels = {
    all: '全部',
    level: '等級',
    interactions: '互動',
    feedings: '餵食',
    happiness: '快樂',
    health: '健康',
    skills: '技能',
    special: '特殊'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">🏆 成就系統</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 統計信息 */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">總進度</span>
            <span className="font-bold text-purple-600">
              {stats.unlocked}/{stats.total} ({stats.percentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* 篩選器 */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(typeLabels) as (keyof typeof typeLabels)[]).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {typeLabels[type]}
              </button>
            ))}
          </div>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showOnlyUnlocked}
              onChange={(e) => setShowOnlyUnlocked(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">只顯示已解鎖</span>
          </label>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-2 block">🔍</span>
            沒有符合條件的成就
          </div>
        ) : (
          filteredAchievements.map(achievement => {
            const progress = achievementManager.getProgressPercentage(achievement)
            const reward = achievementManager.getRewardDescription(achievement)

            return (
              <div
                key={achievement.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  achievement.isUnlocked
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <span className="text-2xl">{achievement.emoji}</span>
                    {achievement.isUnlocked && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${
                        achievement.isUnlocked ? 'text-green-700' : 'text-gray-900'
                      }`}>
                        {achievement.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {achievement.isUnlocked ? '已解鎖' : `${progress}%`}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {achievement.description}
                    </p>

                    {/* 進度條 */}
                    {!achievement.isUnlocked && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>{achievement.currentProgress}/{achievement.requirement}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* 獎勵 */}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        獎勵: {reward}
                      </span>
                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <span className="text-xs text-green-600">
                          {achievement.unlockedAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 提示區域 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            💡 {achievementManager.getAchievementTip()}
          </p>
          <p className="text-xs text-gray-400">
            持續與阿狸互動來解鎖更多成就！
          </p>
        </div>
      </div>
    </div>
  )
}
