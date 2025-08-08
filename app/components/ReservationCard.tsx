'use client'

import { useState } from 'react'

interface ReservationCardProps {
  cardData: {
    action: string
    title: string
    description: string
    prefill: {
      customer_name?: string
      customer_phone?: string
      party_size?: number
      reservation_date?: string
      reservation_time?: string
      special_requests?: string
    }
    required_fields: string[]
  }
  onSubmit?: (formData: any) => void
  onCancel?: () => void
}

export default function ReservationCard({ cardData, onSubmit, onCancel }: ReservationCardProps) {
  const [formData, setFormData] = useState({
    customer_name: cardData.prefill?.customer_name || '',
    customer_phone: cardData.prefill?.customer_phone || '',
    party_size: cardData.prefill?.party_size || 2,
    reservation_date: cardData.prefill?.reservation_date || '',
    reservation_time: cardData.prefill?.reservation_time || '',
    special_requests: cardData.prefill?.special_requests || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    cardData.required_fields?.forEach(field => {
      if (!formData[field as keyof typeof formData] || formData[field as keyof typeof formData] === '') {
        newErrors[field] = '此欄位為必填'
      }
    })

    // 驗證電話號碼格式
    if (formData.customer_phone && !/^09\d{8}$/.test(formData.customer_phone)) {
      newErrors.customer_phone = '請輸入正確的手機號碼格式 (09xxxxxxxx)'
    }

    // 驗證人數
    if (formData.party_size < 1 || formData.party_size > 12) {
      newErrors.party_size = '用餐人數必須在 1-12 人之間'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit?.(formData)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-orange-200 p-6 max-w-md mx-auto my-4">
      {/* 卡片標題 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎫</span>
          <h3 className="text-lg font-bold text-gray-900">{cardData.title}</h3>
        </div>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* 描述 */}
      <p className="text-sm text-gray-600 mb-4">{cardData.description}</p>

      {/* 表單 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            姓名 {cardData.required_fields?.includes('customer_name') && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={formData.customer_name}
            onChange={(e) => handleInputChange('customer_name', e.target.value)}
            placeholder="請輸入您的姓名"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.customer_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.customer_name && (
            <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
          )}
        </div>

        {/* 電話號碼 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            電話號碼 {cardData.required_fields?.includes('customer_phone') && <span className="text-red-500">*</span>}
          </label>
          <input
            type="tel"
            value={formData.customer_phone}
            onChange={(e) => handleInputChange('customer_phone', e.target.value)}
            placeholder="09xxxxxxxx"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.customer_phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.customer_phone && (
            <p className="text-red-500 text-xs mt-1">{errors.customer_phone}</p>
          )}
        </div>

        {/* 用餐人數 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            用餐人數 {cardData.required_fields?.includes('party_size') && <span className="text-red-500">*</span>}
          </label>
          <select
            value={formData.party_size}
            onChange={(e) => handleInputChange('party_size', parseInt(e.target.value))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.party_size ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} 人
              </option>
            ))}
          </select>
          {errors.party_size && (
            <p className="text-red-500 text-xs mt-1">{errors.party_size}</p>
          )}
        </div>

        {/* 預約日期 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            預約日期 {cardData.required_fields?.includes('reservation_date') && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            value={formData.reservation_date}
            onChange={(e) => handleInputChange('reservation_date', e.target.value)}
            min={new Date().toISOString().split('T')[0]} // 不能選擇過去的日期
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.reservation_date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.reservation_date && (
            <p className="text-red-500 text-xs mt-1">{errors.reservation_date}</p>
          )}
        </div>

        {/* 預約時間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            預約時間 {cardData.required_fields?.includes('reservation_time') && <span className="text-red-500">*</span>}
          </label>
          <input
            type="time"
            value={formData.reservation_time}
            onChange={(e) => handleInputChange('reservation_time', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              errors.reservation_time ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.reservation_time && (
            <p className="text-red-500 text-xs mt-1">{errors.reservation_time}</p>
          )}
        </div>

        {/* 特殊需求 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            特殊需求
          </label>
          <textarea
            value={formData.special_requests}
            onChange={(e) => handleInputChange('special_requests', e.target.value)}
            placeholder="如需兒童座椅、無障礙設施等..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* 提交按鈕 */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          >
            確認預約
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              取消
            </button>
          )}
        </div>
      </form>

      {/* 小提示 */}
      <div className="mt-4 p-3 bg-orange-50 rounded-lg">
        <p className="text-xs text-orange-800">
          💡 提示：填寫完成後點擊「確認預約」，系統將為您處理預約申請
        </p>
      </div>
    </div>
  )
}
