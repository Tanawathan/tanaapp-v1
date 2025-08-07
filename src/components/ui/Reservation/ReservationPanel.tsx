'use client'

import React from 'react'
import { Calendar, Users, MapPin, Clock, Phone, CheckCircle } from 'lucide-react'

export interface ReservationData {
  restaurant?: {
    name: string
    address: string
    phone: string
    rating: number
  }
  date?: string
  time?: string
  guests?: number
  tableType?: string
  customerInfo?: {
    name: string
    phone: string
    email?: string
  }
  estimatedWaitTime?: string
  minimumConsumption?: number
}

interface ReservationPanelProps {
  reservationData: ReservationData
  onConfirm: () => void
  onCancel: () => void
  className?: string
}

export default function ReservationPanel({
  reservationData,
  onConfirm,
  onCancel,
  className = ''
}: ReservationPanelProps) {
  const { restaurant, date, time, guests, tableType, customerInfo, estimatedWaitTime, minimumConsumption } = reservationData

  return (
    <div className={`h-full flex flex-col bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-800">預訂詳情</h3>
        </div>
      </div>

      {/* Reservation Details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Restaurant Info */}
        {restaurant && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-800 text-base">🏪 {restaurant.name}</h4>
                <div className="flex items-center space-x-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-sm ${i < Math.floor(restaurant.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                  <span className="text-sm text-gray-600 ml-1">{restaurant.rating}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{restaurant.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{restaurant.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h5 className="font-semibold text-gray-800 mb-3">預訂資訊</h5>
          <div className="space-y-3">
            {date && time && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{date} {time}</span>
              </div>
            )}
            
            {guests && (
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{guests}人</span>
                {tableType && <span className="text-sm text-gray-500">({tableType})</span>}
              </div>
            )}

            {estimatedWaitTime && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">預估等候時間</span>
                </div>
                <p className="text-sm text-orange-600 mt-1 ml-6">{estimatedWaitTime}</p>
              </div>
            )}

            {minimumConsumption && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">最低消費：</span>¥{minimumConsumption}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        {customerInfo && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-semibold text-gray-800 mb-3">👤 訂位人資訊</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">姓名</span>
                <span className="text-sm font-medium">{customerInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">電話</span>
                <span className="text-sm font-medium">{customerInfo.phone}</span>
              </div>
              {customerInfo.email && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">信箱</span>
                  <span className="text-sm font-medium">{customerInfo.email}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 bg-white space-y-3">
        <button
          onClick={onConfirm}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>確認訂位</span>
        </button>
        
        <button
          onClick={onCancel}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  )
}
