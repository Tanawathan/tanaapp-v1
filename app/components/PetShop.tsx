'use client'

import { useState } from 'react'
import { PetFood } from '../types/pet'
import { petManager } from '../lib/petManager'

interface PetShopProps {
  onPurchase?: (item: PetFood, message: string) => void
  onClose?: () => void
}

const AVAILABLE_FOODS: PetFood[] = [
  {
    id: 'basic_food',
    name: '基本飼料',
    emoji: '🥘',
    hungerRestore: 30,
    happinessBonus: 5,
    experienceBonus: 5,
    energyBonus: 0,
    price: 10,
    description: '基本的寵物食物，能填飽肚子'
  },
  {
    id: 'premium_food',
    name: '高級料理',
    emoji: '🍱',
    hungerRestore: 50,
    happinessBonus: 15,
    experienceBonus: 10,
    energyBonus: 10,
    price: 25,
    description: '營養豐富的高級料理，讓阿狸更開心'
  },
  {
    id: 'thai_curry',
    name: '泰式咖哩',
    emoji: '🍛',
    hungerRestore: 40,
    happinessBonus: 20,
    experienceBonus: 15,
    energyBonus: 5,
    price: 30,
    description: '香辣可口的泰式咖哩，阿狸的最愛'
  },
  {
    id: 'energy_drink',
    name: '能量飲品',
    emoji: '🧃',
    hungerRestore: 10,
    happinessBonus: 10,
    experienceBonus: 5,
    energyBonus: 30,
    price: 15,
    description: '恢復能量的特殊飲品'
  },
  {
    id: 'happiness_treat',
    name: '快樂點心',
    emoji: '🍰',
    hungerRestore: 15,
    happinessBonus: 30,
    experienceBonus: 8,
    energyBonus: 5,
    price: 20,
    description: '甜蜜的點心，大幅提升快樂值'
  },
  {
    id: 'super_meal',
    name: '超級大餐',
    emoji: '🍽️',
    hungerRestore: 70,
    happinessBonus: 25,
    experienceBonus: 20,
    energyBonus: 20,
    price: 50,
    description: '豪華大餐，全面提升所有狀態'
  }
]

export default function PetShop({ onPurchase, onClose }: PetShopProps) {
  const [selectedItem, setSelectedItem] = useState<PetFood | null>(null)
  const [playerCoins, setPlayerCoins] = useState(100) // 模擬玩家金幣
  const [purchaseMessage, setPurchaseMessage] = useState('')

  const handlePurchase = async (item: PetFood) => {
    if (playerCoins < item.price) {
      setPurchaseMessage('金幣不足！')
      setTimeout(() => setPurchaseMessage(''), 2000)
      return
    }

    try {
      // 模擬購買邏輯 - 實際上應該調用餵食API
      const result = await petManager.feedPet()
      
      // 扣除金幣
      setPlayerCoins(prev => prev - item.price)
      
      const message = `購買了 ${item.emoji} ${item.name}！${result.message}`
      setPurchaseMessage(message)
      
      if (onPurchase) {
        onPurchase(item, message)
      }
      
      setTimeout(() => setPurchaseMessage(''), 3000)
      
    } catch (error) {
      console.error('購買失敗:', error)
      setPurchaseMessage('購買失敗，請稍後再試')
      setTimeout(() => setPurchaseMessage(''), 2000)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">🛒 寵物商店</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600">您的金幣</span>
          <span className="text-lg font-bold text-yellow-600">💰 {playerCoins}</span>
        </div>
        {purchaseMessage && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{purchaseMessage}</p>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {AVAILABLE_FOODS.map((food) => (
          <div
            key={food.id}
            className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedItem?.id === food.id
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${
              playerCoins < food.price ? 'opacity-50' : ''
            }`}
            onClick={() => setSelectedItem(food)}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{food.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{food.name}</h4>
                  <span className={`font-bold ${
                    playerCoins >= food.price ? 'text-yellow-600' : 'text-red-500'
                  }`}>
                    💰 {food.price}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{food.description}</p>
                
                <div className="flex items-center space-x-4 mt-2 text-xs">
                  {food.hungerRestore > 0 && (
                    <span className="text-orange-600">🍽️ -{food.hungerRestore}</span>
                  )}
                  {food.happinessBonus > 0 && (
                    <span className="text-yellow-600">😊 +{food.happinessBonus}</span>
                  )}
                  {food.energyBonus > 0 && (
                    <span className="text-blue-600">⚡ +{food.energyBonus}</span>
                  )}
                  {food.experienceBonus > 0 && (
                    <span className="text-purple-600">✨ +{food.experienceBonus}</span>
                  )}
                </div>
              </div>
            </div>

            {selectedItem?.id === food.id && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handlePurchase(food)}
                  disabled={playerCoins < food.price}
                  className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {playerCoins >= food.price ? `購買 ${food.name}` : '金幣不足'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            💡 提示：購買食物可以恢復阿狸的各種狀態
          </p>
          <p className="text-xs text-gray-400">
            金幣可以通過與阿狸互動獲得
          </p>
        </div>
      </div>
    </div>
  )
}
