'use client'

import React from 'react'
import { Star, MapPin, Clock, Phone } from 'lucide-react'

interface MessageCardProps {
  type: 'menu' | 'restaurant' | 'ai-response' | 'time-slot' | 'info'
  title: string
  subtitle?: string
  price?: number
  rating?: number
  emoji?: string
  distance?: string
  time?: string
  phone?: string
  description?: string
  imageUrl?: string
  actionButton?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }
  onClick?: () => void
  className?: string
}

export default function MessageCard({
  type,
  title,
  subtitle,
  price,
  rating,
  emoji,
  distance,
  time,
  phone,
  description,
  imageUrl,
  actionButton,
  onClick,
  className = ''
}: MessageCardProps) {
  const getCardClasses = () => {
    const baseClasses = "bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    const clickableClasses = onClick ? "cursor-pointer hover:border-orange-300" : ""
    
    return `${baseClasses} ${clickableClasses} ${className}`
  }

  const renderCardContent = () => {
    switch (type) {
      case 'menu':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {emoji && <span className="text-2xl">{emoji}</span>}
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
                  {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
                </div>
              </div>
              {rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{rating}</span>
                </div>
              )}
            </div>
            
            {price && (
              <p className="text-orange-600 font-bold text-sm mb-2">¥{price}</p>
            )}
            
            {description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{description}</p>
            )}
            
            {actionButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  actionButton.onClick()
                }}
                className={`mt-auto px-3 py-1 rounded text-xs font-medium transition-colors ${
                  actionButton.variant === 'secondary' 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {actionButton.label}
              </button>
            )}
          </div>
        )

      case 'restaurant':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
                {rating && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{rating}分</span>
                  </div>
                )}
              </div>
              {emoji && <span className="text-2xl">{emoji}</span>}
            </div>
            
            <div className="space-y-1 mb-3">
              {distance && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{distance}</span>
                </div>
              )}
              {time && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{time}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{phone}</span>
                </div>
              )}
            </div>

            {actionButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  actionButton.onClick()
                }}
                className={`mt-auto px-3 py-1 rounded text-xs font-medium transition-colors ${
                  actionButton.variant === 'secondary' 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {actionButton.label}
              </button>
            )}
          </div>
        )

      case 'ai-response':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-start space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm">A-Li 阿狸</h4>
                <p className="text-sm text-gray-700 mt-1">{description}</p>
              </div>
            </div>
            
            {actionButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  actionButton.onClick()
                }}
                className="mt-auto px-3 py-2 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 transition-colors"
              >
                {actionButton.label}
              </button>
            )}
          </div>
        )

      case 'time-slot':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            {time && <p className="font-bold text-lg text-gray-800">{time}</p>}
            <p className="text-xs text-gray-600 mt-1">{subtitle || '可預訂'}</p>
          </div>
        )

      case 'info':
      default:
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center space-x-2 mb-2">
              {emoji && <span className="text-xl">{emoji}</span>}
              <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
            </div>
            {subtitle && <p className="text-xs text-gray-600 mb-2">{subtitle}</p>}
            {description && <p className="text-xs text-gray-700">{description}</p>}
          </div>
        )
    }
  }

  return (
    <div 
      className={getCardClasses()}
      onClick={onClick}
    >
      {renderCardContent()}
    </div>
  )
}
