'use client'

import React from 'react'
import { Bell, User } from 'lucide-react'

interface TitleBarProps {
  user?: {
    name: string
    avatar?: string
  }
  onLoginClick?: () => void
  onNotificationClick?: () => void
}

export default function TitleBar({ 
  user, 
  onLoginClick, 
  onNotificationClick 
}: TitleBarProps) {
  return (
    <header className="h-16 bg-white shadow-sm border-b border-gray-100 px-4 flex items-center justify-between">
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        <span className="text-2xl">🍜</span>
        <h1 className="text-xl font-bold text-gray-800">TanaAPP</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Notification Button */}
        <button
          onClick={onNotificationClick}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="通知"
        >
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        {/* User Section */}
        {user ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-medium">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700 max-w-16 truncate">
              {user.name}
            </span>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center space-x-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            <User className="w-4 h-4" />
            <span>登入</span>
          </button>
        )}
      </div>
    </header>
  )
}
