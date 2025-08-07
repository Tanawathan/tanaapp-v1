'use client'

import React, { useState } from 'react'

const FloatingUIDemo = () => {
  const [cartItems, setCartItems] = useState([
    { id: '1', name: '綠咖哩雞肉', price: 268, quantity: 1 },
    { id: '2', name: '炒河粉', price: 180, quantity: 2 }
  ])
  const [showCart, setShowCart] = useState(false)
  const [showReservation, setShowReservation] = useState(false)
  
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  const mockMenuItems = [
    {
      id: '1',
      title: '綠咖哩雞肉',
      subtitle: '泰式經典',
      price: 268,
      rating: 4.8,
      emoji: '🍛'
    },
    {
      id: '2', 
      title: '炒河粉',
      subtitle: '街頭小食',
      price: 180,
      rating: 4.6,
      emoji: '🍜'
    },
    {
      id: '3',
      title: '冬陰功湯',
      subtitle: '酸辣湯品',
      price: 150,
      rating: 4.9,
      emoji: '🍲'
    },
    {
      id: '4',
      title: '芒果糯米',
      subtitle: '泰式甜點',
      price: 120,
      rating: 4.5,
      emoji: '🥭'
    }
  ]

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { id: item.id, name: item.title, price: item.price, quantity: 1 }]
    })
  }

  return (
    <div className="h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 flex flex-col">
      
      {/* 固定頂部標題列 */}
      <div className="bg-white/20 backdrop-blur-md border-b border-white/10 p-4 sticky top-0 z-40 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-xl font-bold text-white drop-shadow-md">TanaAPP</h1>
          </div>
          <div className="flex space-x-2">
            <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <span className="text-white text-lg">🔔</span>
            </button>
            <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
              <span className="text-white text-lg">👤</span>
            </button>
          </div>
        </div>
      </div>

      {/* 可滾動的聊天內容區域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        
        {/* A-Li 阿狸問候 */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-2xl border border-white/50">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <span className="text-white text-lg font-bold">阿</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-xl font-bold text-gray-800">A-Li 阿狸</h3>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-600 text-base leading-relaxed">
                為您推薦今日特餐！這幾道都很受歡迎，您想加辣嗎？
              </p>
            </div>
          </div>
        </div>

        {/* 菜單網格 */}
        <div className="grid grid-cols-2 gap-4">
          {mockMenuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-xl relative overflow-hidden group hover:scale-105 transition-transform duration-200">
              <div className="text-center">
                <span className="text-4xl mb-2 block">{item.emoji}</span>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm mb-2">{item.subtitle}</p>
                <div className="flex items-center justify-center space-x-1 mb-3">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-gray-600 text-sm font-medium">{item.rating}</span>
                </div>
                <p className="text-orange-600 font-bold text-lg mb-3">¥{item.price}</p>
                <button 
                  onClick={() => addToCart(item)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  加入
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 額外空間確保內容不被底部輸入框遮擋 */}
        <div className="h-32"></div>
      </div>

      {/* 固定底部輸入框和按鈕 */}
      <div className="bg-white/10 backdrop-blur-md border-t border-white/20 p-4 flex-shrink-0">
        {/* 輸入框 */}
        <div className="flex space-x-3 mb-4">
          <input 
            type="text" 
            placeholder="我想要點一些飲料..."
            className="flex-1 px-6 py-4 bg-white rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-orange-300/50 text-gray-800 placeholder-gray-500 text-lg shadow-inner"
          />
          <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-orange-500/25 hover:scale-105 transition-all duration-300 flex items-center space-x-2">
            <span>發送</span>
            <span className="text-xl">🚀</span>
          </button>
        </div>
        
        {/* 底部長方形按鈕組 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 購物車按鈕 */}
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-6 py-4 shadow-xl flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition-all duration-300"
          >
            <span className="mr-3 text-xl">🛒</span>
            <span>購物車</span>
            {totalItems > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{totalItems}</span>
              </div>
            )}
          </button>

          {/* 訂位按鈕 */}
          <button
            onClick={() => setShowReservation(!showReservation)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl px-6 py-4 shadow-xl flex items-center justify-center text-white font-bold text-lg hover:scale-105 transition-all duration-300"
          >
            <span className="mr-3 text-xl">📅</span>
            <span>訂位</span>
          </button>
        </div>
      </div>

      {/* 購物車彈出窗口 */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up max-h-[80vh] flex flex-col">
            
            {/* 拖動條 */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <span>🛒</span>
                <span>我的訂單</span>
                {totalItems > 0 && (
                  <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                    <span className="text-sm font-bold">{totalItems}</span>
                  </div>
                )}
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="text-gray-600">✕</span>
              </button>
            </div>

            {/* 購物車項目 - 可滾動 */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-orange-600 font-bold">¥{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">-</button>
                    <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                    <button className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* 小計 - 固定在底部 */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-gray-800">小計：</span>
                <span className="font-bold text-orange-600">¥{totalPrice}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                <span>外送費</span>
                <span>¥30</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-800 mt-3 pt-3 border-t border-gray-100">
                <span>總計</span>
                <span className="text-orange-600">¥{totalPrice + 30}</span>
              </div>
            </div>

            {/* 結帳按鈕 */}
            <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-orange-500/25 flex items-center justify-center space-x-2">
              <span>💳</span>
              <span>結帳</span>
            </button>
          </div>
        </div>
      )}

      {/* 訂位彈出窗口 */}
      {showReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up max-h-[80vh] flex flex-col">
            
            {/* 拖動條 */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <span>📅</span>
                <span>訂位</span>
              </h2>
              <button
                onClick={() => setShowReservation(false)}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="text-gray-600">✕</span>
              </button>
            </div>

            {/* 訂位表單 - 可滾動 */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">選擇日期</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">選擇時間</label>
                <div className="grid grid-cols-3 gap-2">
                  {['18:00', '18:30', '19:00', '19:30', '20:00', '20:30'].map(time => (
                    <button
                      key={time}
                      className="py-2 px-4 border border-gray-300 rounded-xl text-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">人數</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300/50">
                  <option>1人</option>
                  <option>2人</option>
                  <option>3人</option>
                  <option>4人</option>
                  <option>5人以上</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">聯絡電話</label>
                <input 
                  type="tel" 
                  placeholder="請輸入手機號碼"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-300/50"
                />
              </div>
            </div>

            {/* 確認訂位按鈕 */}
            <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-blue-500/25 flex items-center justify-center space-x-2">
              <span>🎯</span>
              <span>確認訂位</span>
            </button>
          </div>
        </div>
      )}

      {/* CSS 動畫 */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default FloatingUIDemo
