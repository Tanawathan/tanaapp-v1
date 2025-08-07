'use client'

import React from 'react'
import MessageCard from '@/components/ui/MessageDisplay/MessageCard'

export default function CardTestDemo() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center mb-6">MessageCard 測試</h1>
        
        <MessageCard
          type="ai-response"
          title="A-Li 阿狸"
          description="您好！我是您的泰式料理小助手～"
        />
        
        <MessageCard
          type="menu"
          title="綠咖哩雞肉"
          subtitle="泰式經典"
          price={268}
          rating={4.8}
          emoji="🍛"
          description="香辣適中，椰漿香濃"
        />
        
        <MessageCard
          type="restaurant"
          title="泰香味餐廳"
          rating={4.8}
          distance="距離 2.3km"
          time="營業到22:00"
          phone="02-2345-6789"
          emoji="🏪"
        />
      </div>
    </div>
  )
}
