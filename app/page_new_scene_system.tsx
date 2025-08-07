'use client'

import { useState, useEffect } from 'react'
import { BaseScene } from './types/scenes'
import { sceneManager } from './utils/sceneManager'
import { SceneContainer, SceneSwitcher } from './components/SceneContainer'

export default function Home() {
  // 場景系統狀態
  const [currentScene, setCurrentScene] = useState<BaseScene>(sceneManager.getCurrentScene())
  
  // 原有狀態
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
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  
  // 場景推薦卡片狀態
  const [showSceneRecommendation, setShowSceneRecommendation] = useState(true)

  // 初始化場景管理器
  useEffect(() => {
    sceneManager.setOnSceneChange((scene) => {
      setCurrentScene(scene)
      // 當場景切換時，添加AI訊息
      addAiMessage(`已為您切換到「${scene.name}」場景 ${scene.icon} ${scene.description}`)
    })
  }, [])

  // 添加AI訊息
  const addAiMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  // 場景切換處理
  const handleSceneChange = (sceneId: string) => {
    const success = sceneManager.switchScene(sceneId)
    if (!success) {
      addAiMessage('抱歉，無法切換到該場景。請稍後再試。')
    }
  }

  // 智能場景建議
  const suggestSceneFromInput = (userInput: string) => {
    const suggestedScene = sceneManager.suggestScene(userInput)
    if (suggestedScene && suggestedScene !== currentScene.id) {
      // 詢問是否要切換場景
      addAiMessage(`我覺得您可能需要「${sceneManager.getAllScenes().find(s => s.id === suggestedScene)?.name}」相關的服務，要切換過去看看嗎？`)
    }
  }

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputText.trim(),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
      
      // 智能場景建議
      suggestSceneFromInput(inputText.trim())
      
      setInputText('')
      
      // AI 回覆模擬
      setTimeout(() => {
        const aiReply = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `我了解您的需求！目前我們在「${currentScene.name}」場景中，我來為您提供相關服務 ✨`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiReply])
      }, 1000)
    }
  }

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product)
  }

  const handleAddToCart = (product: any) => {
    setCartCount(prev => prev + 1)
    addAiMessage(`已將「${product.name}」加入購物車！`)
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
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors"
            >
              <span className="text-orange-600">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setShowReservation(true)}
              className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
            >
              <span className="text-blue-600">📅</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area - 可滾動對話區域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}

          {/* 場景推薦卡片 */}
          {showSceneRecommendation && (
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-sm font-medium text-orange-600">
                    {currentScene.icon} {currentScene.name}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{currentScene.description}</p>
                </div>
                <button
                  onClick={() => setShowSceneRecommendation(!showSceneRecommendation)}
                  className="text-xs text-yellow-600 hover:text-yellow-700 px-3 py-1 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors font-medium"
                >
                  收起
                </button>
              </div>
              
              {/* 場景內容 */}
              <SceneContainer
                currentScene={currentScene}
                onSceneChange={handleSceneChange}
                onProductSelect={handleProductSelect}
                onAddToCart={handleAddToCart}
              />
            </div>
          )}

          {/* 場景切換器 */}
          <SceneSwitcher
            currentScene={currentScene}
            onSceneChange={handleSceneChange}
          />
        </div>
      </div>

      {/* Input Bar - 固定底部輸入框 */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex space-x-3">
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
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
          >
            發送
          </button>
        </div>
      </div>

      {/* 產品詳情 Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center z-50"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <span>{selectedProduct.emoji}</span>
                <span>{selectedProduct.name}</span>
              </h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="關閉詳情"
              >
                <span className="text-gray-600 text-lg font-bold">✕</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 產品圖片區域 */}
              <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <span className="text-6xl">{selectedProduct.emoji}</span>
              </div>
              
              {/* 基本信息 */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">{selectedProduct.category}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-gray-600 text-sm">{selectedProduct.rating}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-red-500 text-sm">{selectedProduct.spiciness}</span>
                  </div>
                </div>
                <p className="text-orange-600 font-bold text-2xl">¥{selectedProduct.price}</p>
              </div>
              
              {/* 產品描述 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">產品描述</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedProduct.description}</p>
              </div>
              
              {/* 主要食材 */}
              {selectedProduct.ingredients && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">主要食材</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.ingredients.map((ingredient: string, index: number) => (
                      <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 操作按鈕 */}
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => {
                    setCartCount(prev => prev + 1)
                    setSelectedProduct(null)
                    addAiMessage(`已將「${selectedProduct.name}」加入購物車！`)
                  }}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  加入購物車
                </button>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 購物車 Modal */}
      {showCart && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-end z-50"
          onClick={() => setShowCart(false)}
        >
          <div 
            className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
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
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="關閉購物車"
              >
                <span className="text-gray-600 text-lg font-bold">✕</span>
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
        <div 
          className="fixed inset-0 bg-black/50 flex items-end z-50"
          onClick={() => setShowReservation(false)}
        >
          <div 
            className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <span>📅</span>
                <span>訂位預約</span>
              </h2>
              <button
                onClick={() => setShowReservation(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="關閉訂位"
              >
                <span className="text-gray-600 text-lg font-bold">✕</span>
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
              <button 
                onClick={() => {
                  setShowReservation(false)
                  addAiMessage('訂位預約已送出！我們將盡快為您確認。')
                }}
                className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold mt-4"
              >
                確認訂位
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
