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
  const [menuExpanded, setMenuExpanded] = useState(false) // 展開"有興趣"後的產品列表
  const [selectedProduct, setSelectedProduct] = useState(null) // 選中的產品詳情

  // 產品詳細數據
  const products = [
    {
      id: '1',
      name: '綠咖哩雞',
      price: 268,
      emoji: '🍛',
      rating: 4.8,
      category: '泰式主食',
      spiciness: '中辣',
      description: '正宗泰式綠咖哩，使用新鮮椰漿熬煮，搭配嫩滑雞肉，香料豐富層次分明，是泰式料理的經典代表。',
      ingredients: ['雞肉', '椰漿', '綠咖哩醬', '茄子', '九層塔', '辣椒']
    },
    {
      id: '2',
      name: '炒河粉',
      price: 180,
      emoji: '🍜',
      rating: 4.6,
      category: '泰式麵食',
      spiciness: '微辣',
      description: '寬版河粉配上豆芽菜、韭菜，用大火快炒，口感Q彈爽滑，是泰式街頭美食的代表。',
      ingredients: ['河粉', '豆芽菜', '韭菜', '雞蛋', '蝦仁', '醬油']
    },
    {
      id: '3',
      name: '冬陰功湯',
      price: 150,
      emoji: '🍲',
      rating: 4.9,
      category: '泰式湯品',
      spiciness: '中辣',
      description: '泰國國湯，酸辣鮮香，使用檸檬葉、香茅、南薑等香料，口感層次豐富，開胃暖胃。',
      ingredients: ['蝦子', '檸檬葉', '香茅', '南薑', '辣椒', '檸檬汁']
    },
    {
      id: '4',
      name: '芒果糯米',
      price: 120,
      emoji: '🥭',
      rating: 4.5,
      category: '泰式甜點',
      spiciness: '不辣',
      description: '香甜軟糯的椰漿糯米配上新鮮芒果，是泰式經典甜點，口感清爽不膩。',
      ingredients: ['芒果', '糯米', '椰漿', '棕櫚糖', '鹽']
    }
  ]

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
        
        {/* 用戶個人功能區域 */}
        <div className="flex items-center space-x-2">
          {/* 購物車按鈕 */}
          <button
            onClick={() => setShowCart(true)}
            className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <span className="text-lg">�</span>
            {cartCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{cartCount}</span>
              </div>
            )}
          </button>
          
          {/* 訂位按鈕 */}
          <button
            onClick={() => setShowReservation(true)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <span className="text-lg">📅</span>
          </button>
          
          {/* 用戶頭像 */}
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <span className="text-lg">�👤</span>
          </button>
        </div>
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
        
        {/* 菜單推薦卡片 - 可折疊 */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">阿</span>
              </div>
              <span className="text-sm font-medium text-orange-600">A-Li 推薦菜單</span>
              <span className="text-xs text-gray-500">(4道菜品)</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setMenuExpanded(!menuExpanded)}
                className="text-xs text-yellow-600 hover:text-yellow-700 px-3 py-1 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors font-medium"
              >
                有興趣 {menuExpanded ? '收起' : '看看'}
              </button>
            </div>
          </div>
          
          {/* 折疊狀態顯示 */}
          {!menuExpanded && (
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span>綠咖哩雞、炒河粉、冬陰功湯、芒果糯米...</span>
                <span className="text-orange-600 font-medium">點擊展開查看詳情</span>
              </div>
            </div>
          )}
          
          {/* 展開狀態顯示 */}
          {menuExpanded && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* 緊湊的emoji和內容 */}
                    <div className="flex flex-col items-center">
                      <span className="text-xl mb-1">{product.emoji}</span>
                      <h4 className="font-bold text-gray-800 text-xs mb-1">{product.name}</h4>
                      <p className="text-orange-600 font-bold text-sm mb-2">¥{product.price}</p>
                      <div className="flex space-x-1 w-full">
                        <button 
                          onClick={() => setSelectedProduct(product)}
                          className="flex-1 bg-blue-500 text-white py-1.5 rounded-md font-medium text-xs hover:bg-blue-600 transition-colors"
                        >
                          詳細
                        </button>
                        <button 
                          onClick={() => setCartCount(prev => prev + 1)}
                          className="flex-1 bg-orange-500 text-white py-1.5 rounded-md font-medium text-xs hover:bg-orange-600 transition-colors"
                        >
                          加入
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          onClick={() => setSelectedProduct(null)} // 點擊背景退出
        >
          <div 
            className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // 防止點擊內容區域時關閉Modal
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
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">主要食材</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.ingredients.map((ingredient, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 操作按鈕 */}
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => {
                    setCartCount(prev => prev + 1)
                    setSelectedProduct(null)
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
          onClick={() => setShowCart(false)} // 點擊背景退出
        >
          <div 
            className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh]"
            onClick={(e) => e.stopPropagation()} // 防止點擊內容區域時關閉Modal
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
          onClick={() => setShowReservation(false)} // 點擊背景退出
        >
          <div 
            className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh]"
            onClick={(e) => e.stopPropagation()} // 防止點擊內容區域時關閉Modal
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
