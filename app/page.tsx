'use client'

import { useState, useEffect } from 'react'
import { aiChatManager, ReadStatus, TypingStatus } from './utils/aiChatManager'
import PetDisplay from './components/PetDisplay'
import PetStatus from './components/PetStatus'
import PetShop from './components/PetShop'
import AchievementPanel from './components/AchievementPanel'

// 消息類型定義
interface Message {
  id: string
  type: 'ai' | 'user'
  content: string
  timestamp: Date
  isRead?: boolean
  readAt?: Date
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
  const [readStatus, setReadStatus] = useState<ReadStatus>({ isRead: false })
  const [typingStatus, setTypingStatus] = useState<TypingStatus>({ isTyping: false })
  const [showPet, setShowPet] = useState(false) // 改為預設關閉，手機優先
  const [showShop, setShowShop] = useState(false) // 控制商店顯示
  const [showAchievements, setShowAchievements] = useState(false) // 控制成就顯示
  const [currentView, setCurrentView] = useState<'chat' | 'pet' | 'shop' | 'achievements'>('chat') // 手機版切換

  // 設定AI Chat Manager的回調函數
  useEffect(() => {
    aiChatManager.setReadStatusCallback((status: ReadStatus) => {
      setReadStatus(status)
      // 更新最後一條用戶消息的已讀狀態
      setMessages(prev => {
        const updated = [...prev]
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].type === 'user') {
            updated[i] = {
              ...updated[i],
              isRead: status.isRead,
              readAt: status.readAt
            }
            break
          }
        }
        return updated
      })
    })

    aiChatManager.setTypingStatusCallback((status: TypingStatus) => {
      setTypingStatus(status)
    })
  }, [])

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

  // 處理寵物互動回饋
  const handlePetInteraction = (message: string) => {
    addAiMessage(`🦊 阿狸: ${message}`)
  }

  // 處理成就解鎖
  const handleAchievementUnlocked = (achievements: any[]) => {
    achievements.forEach(achievement => {
      addAiMessage(`🏆 成就解鎖: ${achievement.title}! ${achievement.description}`)
    })
  }

  // 處理視圖切換
  const handleViewChange = (view: 'chat' | 'pet' | 'shop' | 'achievements') => {
    setCurrentView(view)
    // 在桌面版本也同步更新側邊欄狀態
    setShowPet(view === 'pet')
    setShowShop(view === 'shop')
    setShowAchievements(view === 'achievements')
  }

  const handleShopPurchase = (item: any, message: string) => {
    addAiMessage(`🛒 商店: ${message}`)
    // 如果寵物面板是開著的，可以考慮刷新寵物狀態
    if (showPet) {
      // 這裡可以添加刷新寵物狀態的邏輯
    }
  }

  const processAIMessage = async (userInput: string) => {
    try {
      setIsLoading(true)
      
      // 重置狀態
      setReadStatus({ isRead: false })
      setTypingStatus({ isTyping: false })
      
      // 調用AI服務處理訊息
      const result = await aiChatManager.processUserMessage(userInput)
      
      // 添加AI回應
      addAiMessage(result.response)

    } catch (error) {
      console.error('AI Processing Error:', error)
      addAiMessage('抱歉，我現在有點忙，請稍後再試 😅')
    } finally {
      setIsLoading(false)
      setTypingStatus({ isTyping: false })
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
              <p className="text-xs text-gray-500">
                {typingStatus.isTyping 
                  ? '阿狸正在輸入中...' 
                  : readStatus.isRead 
                    ? '已讀 - 泰式餐廳助手'
                    : '泰式餐廳助手'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <PetStatus 
              compact={true}
              onPetClick={() => handleViewChange('pet')}
            />
            <button 
              onClick={() => handleViewChange('shop')}
              className="relative"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <span className="text-sm">🛒</span>
              </div>
            </button>
            <button 
              onClick={() => handleViewChange('achievements')}
              className="relative"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <span className="text-sm">🏆</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 手機版全屏內容切換 */}
        <div className="flex-1 flex flex-col lg:hidden pb-16">
          {currentView === 'chat' && (
            <>
              {/* 對話訊息列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex flex-col">
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.type === 'user' ? 'text-orange-200' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString('zh-TW', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          {/* 已讀狀態顯示 - 只顯示在用戶消息上 */}
                          {message.type === 'user' && (
                            <div className="flex items-center space-x-1">
                              {message.isRead ? (
                                <span className="text-orange-200 text-xs flex items-center">
                                  <span className="mr-1">✓✓</span>
                                  已讀
                                </span>
                              ) : (
                                <span className="text-orange-300 text-xs flex items-center">
                                  <span className="mr-1">✓</span>
                                  已送達
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 打字狀態指示器 */}
                {typingStatus.isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 shadow-sm border border-gray-200 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">阿狸正在輸入中...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 輸入框 */}
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
            </>
          )}

          {currentView === 'pet' && (
            <div className="flex-1 overflow-y-auto p-4">
              <PetDisplay 
                onInteraction={handlePetInteraction}
                onAchievementUnlocked={handleAchievementUnlocked}
              />
            </div>
          )}

          {currentView === 'shop' && (
            <div className="flex-1 overflow-y-auto p-4">
              <PetShop 
                onPurchase={handleShopPurchase}
                onClose={() => handleViewChange('chat')}
              />
            </div>
          )}

          {currentView === 'achievements' && (
            <div className="flex-1 overflow-y-auto p-4">
              <AchievementPanel onClose={() => handleViewChange('chat')} />
            </div>
          )}
        </div>

        {/* 桌面版左右分欄布局 */}
        <div className="hidden lg:flex flex-1">
          {/* 對話區域 */}
          <div className={`flex flex-col transition-all duration-300 ${(showPet || showShop || showAchievements) ? 'flex-1' : 'w-full'}`}>
            {/* 對話訊息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col">
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          message.type === 'user' ? 'text-orange-200' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString('zh-TW', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        {/* 已讀狀態顯示 - 只顯示在用戶消息上 */}
                        {message.type === 'user' && (
                          <div className="flex items-center space-x-1">
                            {message.isRead ? (
                              <span className="text-orange-200 text-xs flex items-center">
                                <span className="mr-1">✓✓</span>
                                已讀
                              </span>
                            ) : (
                              <span className="text-orange-300 text-xs flex items-center">
                                <span className="mr-1">✓</span>
                                已送達
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 打字狀態指示器 */}
              {typingStatus.isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 shadow-sm border border-gray-200 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">阿狸正在輸入中...</span>
                    </div>
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

          {/* 桌面版右側面板 */}
          {showPet && (
            <div className="w-80 bg-gray-50 border-l border-gray-200 flex-shrink-0 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">虛擬寵物 阿狸</h2>
                  <button
                    onClick={() => setShowPet(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <PetDisplay 
                  onInteraction={handlePetInteraction}
                  onAchievementUnlocked={handleAchievementUnlocked}
                />
              </div>
            </div>
          )}

          {showShop && (
            <div className="w-80 bg-gray-50 border-l border-gray-200 flex-shrink-0 overflow-y-auto">
              <div className="p-4">
                <PetShop 
                  onPurchase={handleShopPurchase}
                  onClose={() => setShowShop(false)}
                />
              </div>
            </div>
          )}

          {showAchievements && (
            <div className="w-80 bg-gray-50 border-l border-gray-200 flex-shrink-0 overflow-y-auto">
              <div className="p-4">
                <AchievementPanel onClose={() => setShowAchievements(false)} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 手機版底部導航欄 */}
      <div className="lg:hidden">
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
          <div className="grid grid-cols-4 gap-0">
            <button
              onClick={() => setCurrentView('chat')}
              className={`flex flex-col items-center py-2 px-1 ${
                currentView === 'chat'
                  ? 'text-orange-500 bg-orange-50'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-lg">💬</span>
              <span className="text-xs mt-1">聊天</span>
            </button>
            <button
              onClick={() => setCurrentView('pet')}
              className={`flex flex-col items-center py-2 px-1 ${
                currentView === 'pet'
                  ? 'text-orange-500 bg-orange-50'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-lg">🦊</span>
              <span className="text-xs mt-1">阿狸</span>
            </button>
            <button
              onClick={() => setCurrentView('shop')}
              className={`flex flex-col items-center py-2 px-1 ${
                currentView === 'shop'
                  ? 'text-orange-500 bg-orange-50'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-lg">🛍️</span>
              <span className="text-xs mt-1">商店</span>
            </button>
            <button
              onClick={() => setCurrentView('achievements')}
              className={`flex flex-col items-center py-2 px-1 ${
                currentView === 'achievements'
                  ? 'text-orange-500 bg-orange-50'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-lg">🏆</span>
              <span className="text-xs mt-1">成就</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
