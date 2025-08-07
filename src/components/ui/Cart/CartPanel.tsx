'use client'

import React from 'react'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  emoji?: string
  options?: string[]
}

interface CartPanelProps {
  items: CartItem[]
  deliveryFee?: number
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onCheckout: () => void
  className?: string
}

export default function CartPanel({
  items,
  deliveryFee = 30,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  className = ''
}: CartPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal + deliveryFee

  return (
    <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-800">我的訂單</h3>
          {items.length > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              {items.length}
            </span>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">購物車空空的</p>
            <p className="text-gray-400 text-xs mt-1">快來添加一些美味料理吧！</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1">
                    {item.emoji && <span className="text-lg">{item.emoji}</span>}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                      {item.options && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.options.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="移除商品"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                  <p className="font-semibold text-orange-600 text-sm">
                    ¥{item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary & Checkout */}
      {items.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">小計</span>
              <span className="font-medium">¥{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">外送費</span>
              <span className="font-medium">¥{deliveryFee}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="font-semibold">總計</span>
                <span className="font-bold text-lg text-orange-600">¥{total}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onCheckout}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>💳</span>
            <span>結帳</span>
          </button>
        </div>
      )}
    </div>
  )
}
