'use client'

import React, { useState } from 'react'

const SimpleUIDemo = () => {
  const [count, setCount] = useState(0)
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">TanaAPP UI 測試</h1>
        
        {/* 測試互動功能 */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">互動測試</h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCount(count - 1)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              -
            </button>
            <span className="text-2xl font-bold">{count}</span>
            <button 
              onClick={() => setCount(count + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              +
            </button>
          </div>
        </div>

        {/* 模擬卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-2xl mb-2">🍛</div>
            <h3 className="font-semibold">綠咖哩雞肉</h3>
            <p className="text-gray-600 text-sm">泰式經典</p>
            <p className="text-orange-600 font-bold">¥268</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-2xl mb-2">🍜</div>
            <h3 className="font-semibold">炒河粉</h3>
            <p className="text-gray-600 text-sm">街頭小食</p>
            <p className="text-orange-600 font-bold">¥180</p>
          </div>
        </div>

        {/* A-Li 聊天框 */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">阿</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">A-Li 阿狸</h3>
              <p className="text-gray-600 mt-1">
                您好！我是您的泰式料理小助手～ 想要什麼美味的泰式料理嗎？
              </p>
            </div>
          </div>
        </div>

        {/* 底部輸入框 */}
        <div className="mt-6">
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="請輸入訊息..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            />
            <button className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              發送
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleUIDemo
