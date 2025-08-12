'use client'

import { useState, useEffect, useRef } from 'react'
import { VirtualPet } from '../types/pet'
import { petManager } from '../lib/petManager'

interface PetDisplayProps {
  onInteraction?: (message: string) => void
  onAchievementUnlocked?: (achievements: any[]) => void
}

export default function PetDisplay({ onInteraction, onAchievementUnlocked }: PetDisplayProps) {
  const [pet, setPet] = useState<VirtualPet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [interactionCooldown, setInteractionCooldown] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [interactions, setInteractions] = useState<any[]>([])
  const [isLoadingInteractions, setIsLoadingInteractions] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // 載入寵物資料
  useEffect(() => {
    loadPet()
  }, [])

  // 啟動 / 停止輪詢互動紀錄
  useEffect(() => {
    if (autoRefresh) {
      fetchInteractions()
      pollRef.current = setInterval(fetchInteractions, 8000)
    } else if (pollRef.current) {
      clearInterval(pollRef.current)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [autoRefresh])

  const fetchInteractions = async () => {
    try {
      setIsLoadingInteractions(true)
      const res = await fetch('/api/pet/interactions?userId=default&limit=8')
      const data = await res.json()
      if (data.success) setInteractions(data.interactions)
    } catch (e) {
      // 忽略暫時性錯誤
    } finally {
      setIsLoadingInteractions(false)
    }
  }

  const loadPet = async () => {
    try {
      setIsLoading(true)
      const petData = await petManager.getPet()
      setPet(petData)
    } catch (error) {
      console.error('載入寵物失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 處理寵物互動
  const handleInteraction = async (action: string) => {
    if (!pet || interactionCooldown) return

    try {
      setInteractionCooldown(true)
      const result = await petManager.interactWithPet(action)
      setPet(result.pet)
      
      if (onInteraction) {
        onInteraction(result.message)
      }

      // 處理新解鎖的成就
      if (result.newAchievements && result.newAchievements.length > 0 && onAchievementUnlocked) {
        onAchievementUnlocked(result.newAchievements)
      }

      // 設置冷卻時間
      setTimeout(() => setInteractionCooldown(false), 2000)
      
    } catch (error) {
      console.error('互動失敗:', error)
      setInteractionCooldown(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">載入您的虛擬寵物中...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center">
          <p className="text-gray-500">無法載入寵物資料</p>
          <button
            onClick={loadPet}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    )
  }

  const stats = petManager.getPetStats(pet)
  const recommendedActions = petManager.getRecommendedActions(pet)

  return (
  <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      {/* 寵物頭像和基本資訊 */}
      <div className="text-center">
        <div className="relative inline-block">
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-24 h-24 text-6xl bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center"
          >
            {pet.appearance.emoji}
          </button>
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
            Lv.{pet.level}
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mt-4">{pet.name}</h3>
        <p className="text-gray-600">
          {petManager.getLevelTitle(pet.level)} • {petManager.getMoodDescription(pet.mood)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {petManager.getActivityDescription(pet.activity)}
        </p>
      </div>

      {/* 狀態條 */}
      <div className="space-y-3">
        {/* 健康值 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">❤️ 健康</span>
          <span className={`text-sm font-bold ${petManager.getStatusColor(pet.health, pet.maxHealth)}`}>
            {pet.health}/{pet.maxHealth}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(pet.health / pet.maxHealth) * 100}%` }}
          ></div>
        </div>

        {/* 快樂值 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">😊 快樂</span>
          <span className={`text-sm font-bold ${petManager.getStatusColor(pet.happiness, pet.maxHappiness)}`}>
            {pet.happiness}/{pet.maxHappiness}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(pet.happiness / pet.maxHappiness) * 100}%` }}
          ></div>
        </div>

        {/* 能量值 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">⚡ 能量</span>
          <span className={`text-sm font-bold ${petManager.getStatusColor(pet.energy, pet.maxEnergy)}`}>
            {pet.energy}/{pet.maxEnergy}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(pet.energy / pet.maxEnergy) * 100}%` }}
          ></div>
        </div>

        {/* 飢餓值 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">🍽️ 飢餓</span>
          <span className={`text-sm font-bold ${petManager.getStatusColor(pet.maxHunger - pet.hunger, pet.maxHunger)}`}>
            {pet.hunger}/{pet.maxHunger}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(pet.hunger / pet.maxHunger) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 經驗值 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">✨ 經驗值</span>
          <span className="text-sm font-bold text-purple-600">
            {pet.experience}/{pet.experienceToNext}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(pet.experience / pet.experienceToNext) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 詳細統計與互動紀錄切換 */}
      {showStats && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">詳細統計</h4>
            <div className="flex items-center space-x-2 text-xs">
              <label className="flex items-center space-x-1 cursor-pointer select-none">
                <input type="checkbox" className="rounded" checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)} />
                <span>自動刷新</span>
              </label>
              <button
                onClick={fetchInteractions}
                className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={isLoadingInteractions}
              >{isLoadingInteractions?'更新中':'刷新'}</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pet.chatSkill}</div>
              <div className="text-xs text-gray-600">聊天技能</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{pet.serviceSkill}</div>
              <div className="text-xs text-gray-600">服務技能</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{pet.loyaltySkill}</div>
              <div className="text-xs text-gray-600">忠誠度</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pet.daysAlive}</div>
              <div className="text-xs text-gray-600">存活天數</div>
            </div>
          </div>
          
          <div className="text-center pt-2 border-t border-gray-200">
            <div className="text-lg font-bold text-gray-700">總互動: {pet.totalInteractions}</div>
            <div className="text-sm text-gray-500">總餵食: {pet.totalFeedings}</div>
          </div>
          {/* 最近互動紀錄 */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">最近互動</h5>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
              {interactions.length === 0 && (
                <div className="text-gray-400">尚無紀錄</div>
              )}
              {interactions.map((i:any) => (
                <div key={i.id} className="flex items-start justify-between bg-white rounded border border-gray-200 px-2 py-1">
                  <span className="font-medium text-gray-600">{i.interaction_type}</span>
                  <span className="text-gray-400 ml-2 whitespace-nowrap">{new Date(i.created_at).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 互動按鈕 */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 text-center">
          💡 建議行動: {recommendedActions.join('、')}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleInteraction('feed')}
            disabled={interactionCooldown}
            className="flex flex-col items-center justify-center p-3 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 text-green-700 disabled:text-gray-400 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">🍽️</span>
            <span className="text-xs">餵食</span>
          </button>
          
          <button
            onClick={() => handleInteraction('pet')}
            disabled={interactionCooldown}
            className="flex flex-col items-center justify-center p-3 bg-pink-100 hover:bg-pink-200 disabled:bg-gray-100 text-pink-700 disabled:text-gray-400 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">❤️</span>
            <span className="text-xs">撫摸</span>
          </button>
          
          <button
            onClick={() => handleInteraction('play')}
            disabled={interactionCooldown}
            className="flex flex-col items-center justify-center p-3 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 text-blue-700 disabled:text-gray-400 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">🎮</span>
            <span className="text-xs">玩耍</span>
          </button>
          
          <button
            onClick={() => handleInteraction('chat')}
            disabled={interactionCooldown}
            className="flex flex-col items-center justify-center p-3 bg-purple-100 hover:bg-purple-200 disabled:bg-gray-100 text-purple-700 disabled:text-gray-400 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">💬</span>
            <span className="text-xs">聊天</span>
          </button>
          
          <button
            onClick={() => handleInteraction('exercise')}
            disabled={interactionCooldown}
            className="flex flex-col items-center justify-center p-3 bg-orange-100 hover:bg-orange-200 disabled:bg-gray-100 text-orange-700 disabled:text-gray-400 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">💪</span>
            <span className="text-xs">運動</span>
          </button>
          
          <button
            onClick={() => handleInteraction('rest')}
            disabled={interactionCooldown}
            className="flex flex-col items-center justify-center p-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 disabled:text-gray-400 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">😴</span>
            <span className="text-xs">休息</span>
          </button>
        </div>
      </div>

      {/* 冷卻提示 */}
      {interactionCooldown && (
        <div className="text-center text-sm text-gray-500">
          請等待 2 秒後再進行下一次互動...
        </div>
      )}
    </div>
  )
}
