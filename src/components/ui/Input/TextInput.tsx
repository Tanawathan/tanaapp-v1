'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader } from 'lucide-react'

interface TextInputProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  className?: string
}

export default function TextInput({
  onSend,
  placeholder = "請輸入您的需求...",
  disabled = false,
  loading = false,
  className = ''
}: TextInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() && !disabled && !loading) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getSuggestions = () => {
    return [
      "我想吃不辣的泰式料理",
      "推薦附近的泰式餐廳", 
      "今天有什麼特價菜單？"
    ]
  }

  return (
    <div className={`bg-white border-t border-gray-200 p-4 ${className}`}>
      {/* Input Area */}
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || loading}
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 min-h-[48px] max-h-32"
            rows={1}
          />
          
          {/* Character count or loading indicator */}
          <div className="absolute bottom-2 right-2 flex items-center space-x-1">
            {loading && <Loader className="w-4 h-4 text-gray-400 animate-spin" />}
            {message.length > 100 && (
              <span className={`text-xs ${message.length > 200 ? 'text-red-500' : 'text-gray-400'}`}>
                {message.length}/200
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || loading}
          className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          aria-label="發送訊息"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Suggestions */}
      {message.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 mb-1 w-full">範例：</span>
          {getSuggestions().map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setMessage(suggestion)}
              className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              "{suggestion}"
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
