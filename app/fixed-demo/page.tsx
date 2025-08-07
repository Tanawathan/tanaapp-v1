'use client'

import React, { useState } from 'react'

// 簡化的 MessageCard 組件
const SimpleCard = ({ title, description, emoji, price, onClick }: {
  title: string
  description: string
  emoji?: string
  price?: number
  onClick?: () => void
}) => (
  <div 
    className="bg-white rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
    onClick={onClick}
  >
    {emoji && <div className="text-2xl mb-2">{emoji}</div>}
    <h3 className="font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm mt-1">{description}</p>
    {price && <p className="text-orange-600 font-bold mt-2">¥{price}</p>}
  </div>
)

export default function FixedUIDemo() {
  const [mode, setMode] = useState<'browse' | 'ordering' | 'reservation'>('browse')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const handleItemClick = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const mockMenuItems = [
    {
      id: '1',
      title: '綠咖哩雞肉',
      description: '香辣適中，椰漿香濃，搭配泰式香米',
      price: 268,
      emoji: '🍛'
    },
    {
      id: '2', 
      title: '炒河粉',
      description: '經典泰式炒河粉，酸甜開胃',
      price: 180,
      emoji: '🍜'
    },
    {
      id: '3',
      title: '冬陰功湯',
      description: '酸辣鮮香，泰式經典湯品',
      price: 150,
      emoji: '🍲'
    },
    {
      id: '4',
      title: '芒果糯米',
      description: '香甜芒果配糯米，經典泰式甜品',
      price: 120,
      emoji: '🥭'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 標題列 */}
      <div className="bg-white shadow-sm p-4">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">TanaAPP</h1>
          <div className="flex space-x-2">
            <button 
              className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"
              onClick={() => alert('通知')}
            >
              <span className="text-white text-xs">🔔</span>
            </button>
            <button 
              className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center"
              onClick={() => alert('用戶')}
            >
              <span className="text-white text-xs">👤</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* AI 助手消息 */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">阿</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">A-Li 阿狸</h3>
              <p className="text-gray-600 mt-1">
                {mode === 'ordering' && '為您推薦今日特餐！這幾道都很受歡迎，您想加辣嗎？'}
                {mode === 'reservation' && '為您找到了空位！這家餐廳環境很棒，適合家庭聚餐。'}
                {mode === 'browse' && '您好！我是您的泰式料理小助手～ 想要什麼美味的泰式料理嗎？'}
              </p>
            </div>
          </div>
        </div>

        {/* 菜單網格 */}
        <div className="grid grid-cols-2 gap-4">
          {mockMenuItems.map((item) => (
            <SimpleCard
              key={item.id}
              title={item.title}
              description={item.description}
              price={item.price}
              emoji={item.emoji}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </div>

        {/* 已選項目 */}
        {selectedItems.length > 0 && (
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">已選擇 ({selectedItems.length})</h3>
            <div className="flex flex-wrap gap-2">
              {selectedItems.map(id => {
                const item = mockMenuItems.find(i => i.id === id)
                return (
                  <span key={id} className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-sm">
                    {item?.title}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* 模式切換按鈕 */}
        <div className="flex space-x-2">
          <button
            onClick={() => setMode('browse')}
            className={`flex-1 py-2 rounded-lg text-sm ${
              mode === 'browse' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            瀏覽
          </button>
          <button
            onClick={() => setMode('ordering')}
            className={`flex-1 py-2 rounded-lg text-sm ${
              mode === 'ordering' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            點餐
          </button>
          <button
            onClick={() => setMode('reservation')}
            className={`flex-1 py-2 rounded-lg text-sm ${
              mode === 'reservation' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            訂位
          </button>
        </div>

        {/* 輸入框 */}
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="請輸入訊息..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          />
          <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            發送
          </button>
        </div>
      </div>
    </div>
  )
}
