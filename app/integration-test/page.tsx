'use client'

import { NextPage } from 'next'
import { useEffect, useState } from 'react'

interface APITestResult {
  endpoint: string
  status: 'loading' | 'success' | 'error'
  data?: any
  error?: string
  timestamp?: string
}

const IntegrationTestPage: NextPage = () => {
  const [results, setResults] = useState<APITestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const testEndpoints = [
    { path: '/api/restaurant', method: 'GET', name: '餐廳狀態' },
    { path: '/api/menu', method: 'GET', name: '菜單資料' },
    { path: '/api/menu/search?q=炒', method: 'GET', name: '搜尋功能' },
    { 
      path: '/api/ai/recommend', 
      method: 'POST', 
      name: 'AI 推薦',
      body: { preferences: ['辣'], budget: 200, partySize: 2 }
    }
  ]

  const runTests = async () => {
    setIsRunning(true)
    setResults([])
    
    for (const endpoint of testEndpoints) {
      const result: APITestResult = {
        endpoint: endpoint.name,
        status: 'loading'
      }
      
      setResults(prev => [...prev, result])

      try {
        const response = await fetch(endpoint.path, {
          method: endpoint.method,
          headers: endpoint.body ? { 'Content-Type': 'application/json' } : {},
          body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
        })

        if (response.ok) {
          const data = await response.json()
          result.status = 'success'
          result.data = data
          result.timestamp = new Date().toLocaleTimeString()
        } else {
          result.status = 'error'
          result.error = `HTTP ${response.status}: ${response.statusText}`
        }
      } catch (error) {
        result.status = 'error'
        result.error = (error as Error).message
      }

      setResults(prev => prev.map(r => r.endpoint === result.endpoint ? result : r))
      
      // 延遲一下避免請求過快
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔗 TanaAPP x TanaPOS 整合測試
            </h1>
            <p className="text-gray-600">
              驗證 AI 社交平台與後台管理系統的 API 整合狀況
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <button
              onClick={runTests}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-semibold ${
                isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRunning ? '測試進行中...' : '🚀 開始整合測試'}
            </button>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  result.status === 'success'
                    ? 'border-green-200 bg-green-50'
                    : result.status === 'error'
                    ? 'border-red-200 bg-red-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {result.status === 'loading' && '⏳'}
                    {result.status === 'success' && '✅'}
                    {result.status === 'error' && '❌'}
                    {' '}
                    {result.endpoint}
                  </h3>
                  {result.timestamp && (
                    <span className="text-sm text-gray-500">
                      {result.timestamp}
                    </span>
                  )}
                </div>

                {result.status === 'loading' && (
                  <p className="text-yellow-600">測試中...</p>
                )}

                {result.status === 'error' && (
                  <div className="text-red-600">
                    <p className="font-medium">錯誤：</p>
                    <p className="text-sm">{result.error}</p>
                  </div>
                )}

                {result.status === 'success' && result.data && (
                  <div className="text-green-600">
                    <p className="font-medium mb-2">成功！資料預覽：</p>
                    <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {results.length > 0 && !isRunning && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-4 bg-gray-100 rounded-lg p-4">
                <span className="text-gray-700">測試結果：</span>
                <span className="text-green-600 font-semibold">
                  ✅ {results.filter(r => r.status === 'success').length} 成功
                </span>
                <span className="text-red-600 font-semibold">
                  ❌ {results.filter(r => r.status === 'error').length} 失敗
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📋 整合架構說明
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">資料流向</h3>
                <p>TanaAPP (AI 社交) ←→ 共享 Supabase ←→ TanaPOS (後台管理)</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">主要功能</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>即時菜單同步</li>
                  <li>智能商品推薦</li>
                  <li>訂單狀態追蹤</li>
                  <li>餐廳狀況查詢</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegrationTestPage
