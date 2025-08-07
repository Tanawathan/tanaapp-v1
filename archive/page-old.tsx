'use client'

import { useState } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: '您好！我是阿狸，您的泰式料理小助手 🍛 今天想吃點什麼呢？',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [cartCount, setCartCount] = useState(0)

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputText.trim(),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
      setInputText('')
      
      // AI 回覆模擬
      setTimeout(() => {
        const aiReply = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: '我了解您的需求！讓我為您推薦幾道美味的料理 ✨',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiReply])
      }, 1000)
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      
      {/* Header - 固定頂部 */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 p-4 flex items-center justify-between text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">TanaAPP</h1>
            <p className="text-sm text-orange-100">AI 泰式料理助手</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-lg">👤</span>
        </button>
      </header>

        {/* 主要內容 */}
        <div className="p-4 space-y-6">
          
          {/* AI 社交餐廳平台標題 - 浮動效果 */}
          <div className="text-center py-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-md">AI 社交餐廳平台</h2>
              <p className="text-white/80 text-lg">與阿狸一起探索美味✨</p>
            </div>
          </div>

          {/* A-Li 阿狸問候 - 3D 效果 */}
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
                  您好！我是您的泰式料理小助手～ 想要什麼美味的泰式料理嗎？
                </p>
              </div>
            </div>
          </div>

          {/* 特色卡片網格 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 今日特餐 - 漸變卡片 */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">🍛</span>
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">HOT</div>
                </div>
                <h3 className="font-bold text-white text-lg mb-1 drop-shadow-md">今日特餐</h3>
                <p className="text-white/90 text-sm font-medium">限時優惠</p>
                <p className="text-white/80 text-xs mt-2">綠咖哩雞肉</p>
                <p className="text-white text-sm font-bold">
                  <span className="line-through opacity-70">¥280</span> <span className="text-yellow-100">¥220</span>
                </p>
              </div>
            </div>

            {/* 推薦餐廳 - 藍色漸變 */}
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-6"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">🏪</span>
                  <div className="flex items-center">
                    <span className="text-yellow-300 text-lg">⭐</span>
                    <span className="text-white text-sm font-bold ml-1">4.8</span>
                  </div>
                </div>
                <h3 className="font-bold text-white text-lg mb-1 drop-shadow-md">推薦餐廳</h3>
                <p className="text-white/90 text-sm font-medium">高評分</p>
                <p className="text-white/80 text-xs mt-2">泰香味餐廳</p>
                <p className="text-white/80 text-xs">距離 2.3km</p>
              </div>
            </div>
          </div>

          {/* 功能按鈕 - 現代化設計 */}
          <div className="space-y-4">
            <Link 
              href="/floating-demo" 
              className="group block w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <span className="text-2xl">🚀</span>
                <span>浮動式 UI (推薦)</span>
              </div>
            </Link>

            <Link 
              href="/ui-demo" 
              className="group block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-orange-500/25 hover:scale-105 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <span className="text-2xl">🎨</span>
                <span>完整 UI 展示</span>
              </div>
            </Link>
            
            <Link 
              href="/integration-test" 
              className="group block w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <span className="text-2xl">🔧</span>
                <span>API 功能測試</span>
              </div>
            </Link>

            <Link 
              href="/fixed-demo" 
              className="group block w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <span className="text-2xl">📱</span>
                <span>簡化版本</span>
              </div>
            </Link>
          </div>

          {/* 輸入框 - 現代化設計 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
            <div className="flex space-x-3">
              <input 
                type="text" 
                placeholder="跟阿狸說話..."
                className="flex-1 px-6 py-4 bg-white rounded-2xl border-0 focus:outline-none focus:ring-4 focus:ring-orange-300/50 text-gray-800 placeholder-gray-500 text-lg shadow-inner"
              />
              <button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-orange-500/25 hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                <span>發送</span>
                <span className="text-xl">🚀</span>
              </button>
            </div>
          </div>

          {/* 底部裝飾 */}
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <span className="text-white/80 text-sm font-medium">TanaAPP v1.0</span>
              <span className="text-white/60">•</span>
              <span className="text-white/80 text-sm">結合 AI 智能的泰式餐廳社交平台</span>
            </div>
            <p className="text-white/60 text-sm mt-4 flex items-center justify-center space-x-2">
              <span>與 TanaPOS 系統完美整合</span>
              <span className="text-lg">🔗</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}