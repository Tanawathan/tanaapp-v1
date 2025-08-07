'use client'

import { useState, useEffect } from 'react'
import { VirtualPet } from '../types/pet'
import { petManager } from '../lib/petManager'

interface PetStatusProps {
  onPetClick?: () => void
  compact?: boolean
}

export default function PetStatus({ onPetClick, compact = false }: PetStatusProps) {
  const [pet, setPet] = useState<VirtualPet | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPet()
    // 每30秒更新一次寵物狀態
    const interval = setInterval(loadPet, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadPet = async () => {
    try {
      const petData = await petManager.getPet()
      setPet(petData)
    } catch (error) {
      console.error('載入寵物狀態失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !pet) {
    return compact ? (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    ) : (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="animate-pulse">載入中...</div>
      </div>
    )
  }

  const getHealthColor = () => {
    const healthPercent = (pet.health / pet.maxHealth) * 100
    if (healthPercent >= 80) return 'text-green-500'
    if (healthPercent >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getHappinessColor = () => {
    const happinessPercent = (pet.happiness / pet.maxHappiness) * 100
    if (happinessPercent >= 80) return 'text-green-500'
    if (happinessPercent >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const needsAttention = pet.hunger > 80 || pet.happiness < 30 || pet.energy < 20

  if (compact) {
    return (
      <button
        onClick={onPetClick}
        className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
          needsAttention ? 'bg-red-100 animate-pulse' : 'bg-orange-100'
        }`}
      >
        <span className="text-lg">{pet.appearance.emoji}</span>
        {needsAttention && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        )}
        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-800 px-1 rounded-full text-xs font-bold">
          {pet.level}
        </div>
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{pet.appearance.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{pet.name}</h3>
            <p className="text-xs text-gray-500">Lv.{pet.level} • {petManager.getMoodDescription(pet.mood)}</p>
          </div>
        </div>
        {needsAttention && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">❤️ 健康</span>
          <span className={`font-medium ${getHealthColor()}`}>
            {pet.health}/{pet.maxHealth}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-red-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(pet.health / pet.maxHealth) * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">😊 快樂</span>
          <span className={`font-medium ${getHappinessColor()}`}>
            {pet.happiness}/{pet.maxHappiness}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-yellow-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(pet.happiness / pet.maxHappiness) * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">🍽️ 飢餓</span>
          <span className={`font-medium ${pet.hunger > 70 ? 'text-red-500' : 'text-green-500'}`}>
            {pet.hunger}/{pet.maxHunger}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-orange-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(pet.hunger / pet.maxHunger) * 100}%` }}
          ></div>
        </div>
      </div>

      {needsAttention && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <p className="text-xs text-yellow-800">
            ⚠️ 阿狸需要您的關心！
            {pet.hunger > 80 && ' 餵食'}
            {pet.happiness < 30 && ' 撫摸'}
            {pet.energy < 20 && ' 休息'}
          </p>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-500">
          {petManager.getActivityDescription(pet.activity)}
        </p>
      </div>
    </div>
  )
}
