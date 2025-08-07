'use client'

import React, { useState } from 'react'
import TitleBar from '../ui/Header/TitleBar'
import DynamicLayout, { LayoutMode } from '../ui/MessageDisplay/DynamicLayout'
import TextInput from '../ui/Input/TextInput'
import CartPanel from '../ui/Cart/CartPanel'
import ReservationPanel from '../ui/Reservation/ReservationPanel'
import { CartItem } from '../ui/Cart/CartPanel'
import { ReservationData } from '../ui/Reservation/ReservationPanel'

interface MainLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    avatar?: string
  }
  mode?: LayoutMode
  cartItems?: CartItem[]
  reservationData?: ReservationData
  onLoginClick?: () => void
  onNotificationClick?: () => void
  onSendMessage?: (message: string) => void
  onUpdateCart?: (itemId: string, quantity: number) => void
  onRemoveFromCart?: (itemId: string) => void
  onCheckout?: () => void
  onConfirmReservation?: () => void
  onCancelReservation?: () => void
  loading?: boolean
}

export default function MainLayout({
  children,
  user,
  mode = 'browse',
  cartItems = [],
  reservationData = {},
  onLoginClick,
  onNotificationClick,
  onSendMessage,
  onUpdateCart,
  onRemoveFromCart,
  onCheckout,
  onConfirmReservation,
  onCancelReservation,
  loading = false
}: MainLayoutProps) {
  const [inputLoading, setInputLoading] = useState(false)

  const handleSendMessage = async (message: string) => {
    if (onSendMessage) {
      setInputLoading(true)
      try {
        await onSendMessage(message)
      } finally {
        setInputLoading(false)
      }
    }
  }

  const renderSidePanel = () => {
    switch (mode) {
      case 'ordering':
        return (
          <CartPanel
            items={cartItems}
            onUpdateQuantity={onUpdateCart || (() => {})}
            onRemoveItem={onRemoveFromCart || (() => {})}
            onCheckout={onCheckout || (() => {})}
          />
        )
      
      case 'reservation':
        return (
          <ReservationPanel
            reservationData={reservationData}
            onConfirm={onConfirmReservation || (() => {})}
            onCancel={onCancelReservation || (() => {})}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <TitleBar
        user={user}
        onLoginClick={onLoginClick}
        onNotificationClick={onNotificationClick}
      />

      {/* Main Content with Dynamic Layout */}
      <div className="flex-1 overflow-hidden">
        <DynamicLayout
          mode={mode}
          sidePanel={renderSidePanel()}
        >
          <div className="h-full overflow-y-auto p-4">
            {children}
          </div>
        </DynamicLayout>
      </div>

      {/* Input Area */}
      <TextInput
        onSend={handleSendMessage}
        loading={inputLoading || loading}
        placeholder={
          mode === 'ordering' ? "我還想要點一些飲料..." :
          mode === 'reservation' ? "我想改到8點，可以嗎？" :
          "請輸入您的需求..."
        }
      />
    </div>
  )
}
