'use client'

import { useState } from 'react'
import { aiChatManager } from './utils/aiChatManager'

// 消息類型定義
interface Message {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: Date
}

export default function Home() {
  // 消息狀態
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '您好！我是阿狸，您的泰式料理小助手 🍛 今天想吃點什麼呢？',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 添加AI訊息
  const addAiMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  // 添加用戶訊息
  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  // AI訊息處理
  const processAIMessage = async (userInput: string) => {
    try {
      setIsLoading(true)
      
      // 調用AI服務處理訊息
      const result = await aiChatManager.processUserMessage(userInput)
      
      // 添加AI回應
      addAiMessage(result.response)

    } catch (error) {
      console.error('AI Processing Error:', error)
      addAiMessage('抱歉，我現在有點忙，請稍後再試 😅')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = () => {
    if (inputText.trim() && !isLoading) {
      const userMessage = inputText.trim()
      
      // 添加用戶訊息
      addUserMessage(userMessage)
      
      // 處理AI回應
      processAIMessage(userMessage)
      
      // 清空輸入框
      setInputText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header - 固定頂部 */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">TanaAPP</h1>
              <p className="text-xs text-gray-500">泰式餐廳助手</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm">🛒</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 對話區域 - 佔滿整個寬度 */}
        <div className="flex-1 flex flex-col">
          {/* 對話訊息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-orange-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('zh-TW', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* 載入指示器 */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-sm border border-gray-200 px-4 py-2 rounded-lg">
                  <p className="text-sm">🤔 讓我想想...</p>
                </div>
              </div>
            )}
          </div>

          {/* 輸入框 - 固定底部 */}
          <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="輸入您的訊息..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                發送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
