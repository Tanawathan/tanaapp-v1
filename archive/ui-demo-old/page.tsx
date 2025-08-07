'use client'

import React, { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import MosaicGrid from '@/components/ui/MessageDisplay/MosaicGrid'
import MessageCard from '@/components/ui/MessageDisplay/MessageCard'
import { LayoutMode } from '@/components/ui/MessageDisplay/DynamicLayout'
import { CartItem } from '@/components/ui/Cart/CartPanel'
import { ReservationData } from '@/components/ui/Reservation/ReservationPanel'

const mockUser = {
  name: "阿狸",
  avatar: ""
}

const mockMenuItems = [
  {
    id: '1',
    title: '綠咖哩雞肉',
    subtitle: '泰式經典',
    price: 268,
    rating: 4.8,
    emoji: '🍛',
    description: '香辣適中，椰漿香濃，搭配泰式香米'
  },
  {
    id: '2', 
    title: '炒河粉',
    subtitle: '街頭小食',
    price: 180,
    rating: 4.6,
    emoji: '🍜',
    description: '經典泰式炒河粉，酸甜開胃'
  },
  {
    id: '3',
    title: '冬陰功湯',
    subtitle: '酸辣湯品',
    price: 150,
    rating: 4.9,
    emoji: '🍲',
    description: '酸辣鮮香，泰式經典湯品'
  },
  {
    id: '4',
    title: '芒果糯米',
    subtitle: '泰式甜點',
    price: 120,
    rating: 4.5,
    emoji: '🥭',
    description: '香甜芒果配糯米，經典泰式甜品'
  }
]

const mockRestaurant = {
  id: 'r1',
  name: '泰香味餐廳',
  rating: 4.8,
  distance: '距離 2.3km',
  time: '營業到22:00',
  phone: '02-2345-6789',
  emoji: '🏪'
}

export default function UIDemo() {
  const [mode, setMode] = useState<LayoutMode>('browse')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [reservationData, setReservationData] = useState<ReservationData>({})

  const detectIntent = (message: string): LayoutMode => {
    const orderKeywords = ['點餐', '訂購', '我要', '加入', '購買']
    const reservationKeywords = ['訂位', '預約', '空位', '桌子', '位子']
    
    if (orderKeywords.some(keyword => message.includes(keyword))) {
      return 'ordering'
    }
    if (reservationKeywords.some(keyword => message.includes(keyword))) {
      return 'reservation'
    }
    return 'browse'
  }

  const handleSendMessage = async (message: string) => {
    console.log('用戶訊息:', message)
    
    // 模擬 AI 響應延遲
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 根據訊息內容切換模式
    const newMode = detectIntent(message)
    setMode(newMode)

    // 模擬不同模式的數據更新
    if (newMode === 'ordering') {
      // 模擬添加商品到購物車
      if (message.includes('綠咖哩') || message.includes('咖哩')) {
        const newItem: CartItem = {
          id: '1',
          name: '綠咖哩雞肉',
          price: 268,
          quantity: 1,
          emoji: '🍛',
          options: ['中辣', '加飯']
        }
        setCartItems(prev => {
          const existing = prev.find(item => item.id === newItem.id)
          if (existing) {
            return prev.map(item => 
              item.id === newItem.id 
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
          return [...prev, newItem]
        })
      }
    } else if (newMode === 'reservation') {
      // 模擬訂位數據
      setReservationData({
        restaurant: {
          name: '泰香味餐廳',
          address: '台北市中山路123號',
          phone: '02-2345-6789',
          rating: 4.8
        },
        date: '今晚',
        time: '7:30PM',
        guests: 4,
        tableType: '4人桌',
        customerInfo: {
          name: '陳先生',
          phone: '0912-345-678'
        },
        estimatedWaitTime: '15-20分鐘',
        minimumConsumption: 800
      })
    }
  }

  const handleAddToCart = (item: typeof mockMenuItems[0]) => {
    const cartItem: CartItem = {
      id: item.id,
      name: item.title,
      price: item.price,
      quantity: 1,
      emoji: item.emoji
    }
    
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, cartItem]
    })
    
    setMode('ordering')
  }

  const handleUpdateCart = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId))
    } else {
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      )
    }
  }

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId))
  }

  const handleCheckout = () => {
    alert('結帳功能開發中...')
  }

  const handleConfirmReservation = () => {
    alert('訂位確認！我們會盡快為您安排位子。')
  }

  const handleCancelReservation = () => {
    setReservationData({})
    setMode('browse')
  }

  const renderContent = () => {
    switch (mode) {
      case 'ordering':
        return (
          <div className="space-y-6">
            {/* AI Response */}
            <MessageCard
              type="ai-response"
              title="A-Li 阿狸"
              description="為您推薦今日特餐！這幾道都很受歡迎，您想加辣嗎？"
            />

            {/* Menu Items */}
            <MosaicGrid size="2x1" gap="md">
              <MessageCard
                type="menu"
                title={mockMenuItems[0].title}
                subtitle={mockMenuItems[0].subtitle}
                price={mockMenuItems[0].price}
                rating={mockMenuItems[0].rating}
                emoji={mockMenuItems[0].emoji}
                description={mockMenuItems[0].description}
                actionButton={{
                  label: "加入",
                  onClick: () => handleAddToCart(mockMenuItems[0])
                }}
              />
              <MessageCard
                type="menu"
                title={mockMenuItems[1].title}
                subtitle={mockMenuItems[1].subtitle}
                price={mockMenuItems[1].price}
                rating={mockMenuItems[1].rating}
                emoji={mockMenuItems[1].emoji}
                description={mockMenuItems[1].description}
                actionButton={{
                  label: "加入",
                  onClick: () => handleAddToCart(mockMenuItems[1])
                }}
              />
            </MosaicGrid>
          </div>
        )

      case 'reservation':
        return (
          <div className="space-y-6">
            {/* AI Response */}
            <MessageCard
              type="ai-response"
              title="A-Li 阿狸"
              description="為您找到了空位！這家餐廳環境很棒，適合家庭聚餐，而且今晚還有現場泰式音樂表演呢！"
            />

            {/* Restaurant Info */}
            <MessageCard
              type="restaurant"
              title={mockRestaurant.name}
              rating={mockRestaurant.rating}
              distance={mockRestaurant.distance}
              time={mockRestaurant.time}
              phone={mockRestaurant.phone}
              emoji={mockRestaurant.emoji}
              actionButton={{
                label: "📞 電話",
                onClick: () => alert('撥打電話: ' + mockRestaurant.phone),
                variant: "secondary"
              }}
            />

            {/* Available Time Slots */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">還有其他時間可選：</h4>
              <MosaicGrid size="2x1" gap="sm">
                <MessageCard
                  type="time-slot"
                  title=""
                  time="8:00"
                  subtitle="可預訂"
                  onClick={() => console.log('選擇 8:00')}
                />
                <MessageCard
                  type="time-slot" 
                  title=""
                  time="8:30"
                  subtitle="可預訂"
                  onClick={() => console.log('選擇 8:30')}
                />
              </MosaicGrid>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            {/* Welcome Message */}
            <MessageCard
              type="ai-response"
              title="A-Li 阿狸"
              description="您好！我是您的泰式料理小助手～ 想要什麼美味的泰式料理嗎？"
            />

            {/* Today's Special */}
            <MosaicGrid size="2x1" gap="md">
              <MessageCard
                type="info"
                title="今日特餐"
                subtitle="限時優惠"
                emoji="🍛"
                description="綠咖哩雞肉 原價¥280 特價¥220"
              />
              <MessageCard
                type="info"
                title="推薦餐廳"
                subtitle="高評分"
                emoji="🏪"
                description="泰香味餐廳 ⭐4.8分 距離2.3km"
              />
            </MosaicGrid>

            {/* Menu Grid */}
            <MosaicGrid size="2x2" gap="md">
              {mockMenuItems.map((item) => (
                <MessageCard
                  key={item.id}
                  type="menu"
                  title={item.title}
                  price={item.price}
                  rating={item.rating}
                  emoji={item.emoji}
                  onClick={() => handleAddToCart(item)}
                />
              ))}
            </MosaicGrid>

            {/* Mode Switch Buttons */}
            <div className="flex space-x-2 pt-4">
              <button
                onClick={() => setMode('ordering')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm"
              >
                切換到點餐模式
              </button>
              <button
                onClick={() => setMode('reservation')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm"
              >
                切換到訂位模式
              </button>
              <button
                onClick={() => setMode('browse')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm"
              >
                切換到瀏覽模式
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <MainLayout
      user={mockUser}
      mode={mode}
      cartItems={cartItems}
      reservationData={reservationData}
      onSendMessage={handleSendMessage}
      onUpdateCart={handleUpdateCart}
      onRemoveFromCart={handleRemoveFromCart}
      onCheckout={handleCheckout}
      onConfirmReservation={handleConfirmReservation}
      onCancelReservation={handleCancelReservation}
      onLoginClick={() => alert('登入功能開發中...')}
      onNotificationClick={() => alert('通知功能開發中...')}
    >
      {renderContent()}
    </MainLayout>
  )
}
