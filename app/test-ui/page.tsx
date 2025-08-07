'use client'

import React from 'react'

export default function TestUI() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">測試頁面</h1>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <p>如果您看到這個頁面，說明基本組件正常工作。</p>
        </div>
        <div className="mt-4 space-y-2">
          <div className="bg-blue-500 text-white p-3 rounded">藍色卡片</div>
          <div className="bg-green-500 text-white p-3 rounded">綠色卡片</div>
          <div className="bg-red-500 text-white p-3 rounded">紅色卡片</div>
        </div>
      </div>
    </div>
  )
}
