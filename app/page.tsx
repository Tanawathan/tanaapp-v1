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
  const [showCart, setShowCart] = useState(false)
  const [showReservation, setShowReservation] = useState(false)

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
    <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      
      {/* Header - 固定頂部 */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 p-4 flex items-center justify-between text-white shadow-lg flex-shrink-0">
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

      {/* Messages Area - 可滾動對話區域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-orange-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 shadow-md rounded-bl-none'
              }`}
            >
              {message.type === 'ai' && (
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">阿</span>
                  </div>
                  <span className="text-sm font-medium text-orange-600">A-Li</span>
                </div>
              )}
              <p className="text-base leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-orange-200' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        
        {/* 菜單推薦卡片 */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">阿</span>
            </div>
            <span className="text-sm font-medium text-orange-600">A-Li 推薦</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-2xl mb-2 block">🍛</span>
              <h4 className="font-bold text-gray-800 text-sm mb-1">綠咖哩雞</h4>
              <p className="text-orange-600 font-bold text-lg">¥268</p>
              <button 
                onClick={() => setCartCount(prev => prev + 1)}
                className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium text-sm mt-2 hover:bg-orange-600 transition-colors"
              >
                加入購物車
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-2xl mb-2 block">🍜</span>
              <h4 className="font-bold text-gray-800 text-sm mb-1">炒河粉</h4>
              <p className="text-orange-600 font-bold text-lg">¥180</p>
              <button 
                onClick={() => setCartCount(prev => prev + 1)}
                className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium text-sm mt-2 hover:bg-orange-600 transition-colors"
              >
                加入購物車
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Input Bar - 固定底部輸入框 */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex space-x-3 mb-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="輸入您的需求..."
            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            <span>發送</span>
            <span>🚀</span>
          </button>
        </div>
      </div>

      {/* Action Bar - 固定底部按鈕組 */}
      <div className="bg-white border-t border-gray-100 p-4 flex-shrink-0">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-orange-500 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-orange-600 transition-colors"
          >
            <span className="text-lg">🛒</span>
            <span>購物車</span>
            {cartCount > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{cartCount}</span>
              </div>
            )}
          </button>
          
          <button
            onClick={() => setShowReservation(true)}
            className="bg-blue-500 text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors"
          >
            <span className="text-lg">📅</span>
            <span>訂位</span>
          </button>
        </div>
      </div>

      {/* 購物車 Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <span>🛒</span>
                <span>購物車</span>
                {cartCount > 0 && (
                  <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-sm">
                    {cartCount}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            {cartCount === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl block mb-2">🛒</span>
                <p>購物車是空的</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-800">
                  <p className="text-lg font-medium">您已添加 {cartCount} 項商品</p>
                  <button className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold mt-4">
                    前往結帳
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 訂位 Modal */}
      {showReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <span>📅</span>
                <span>訂位預約</span>
              </h2>
              <button
                onClick={() => setShowReservation(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">時間</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>18:00</option>
                  <option>19:00</option>
                  <option>20:00</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">人數</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>2人</option>
                  <option>4人</option>
                  <option>6人</option>
                </select>
              </div>
              <button className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold mt-4">
                確認訂位
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
