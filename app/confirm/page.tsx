'use client'

import { useState } from 'react'

export default function ConfirmPage() {
  const [queryType, setQueryType] = useState('reservation')
  const [searchValue, setSearchValue] = useState('')
  const [searchType, setSearchType] = useState('phone') // phone, email, id
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('請輸入查詢內容')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const params = new URLSearchParams({
        action: queryType,
        [searchType]: searchValue.trim()
      })

      const response = await fetch(`/api/confirm?${params}`)
      const data = await response.json()

      if (data.success) {
        setResults(data)
      } else {
        setError(data.error || '查詢失敗')
      }
    } catch (err) {
      console.error('查詢錯誤:', err)
      setError('網路錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string, type: 'reservation' | 'order') => {
    try {
      const response = await fetch('/api/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: type === 'reservation' ? 'update_reservation_status' : 'update_order_status',
          data: { id, status: newStatus }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('狀態更新成功！')
        handleSearch() // 重新查詢以顯示最新狀態
      } else {
        alert(`狀態更新失敗: ${data.error}`)
      }
    } catch (err) {
      console.error('狀態更新錯誤:', err)
      alert('狀態更新失敗')
    }
  }

  const renderResults = () => {
    if (!results || !results.found) {
      return (
        <div className="text-center py-8 text-gray-500">
          {results?.message || '沒有找到相關記錄'}
        </div>
      )
    }

    if (queryType === 'reservation' && results.reservations) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">預約記錄 ({results.count})</h3>
          {results.reservations.map((reservation: any) => (
            <div key={reservation.id} className="bg-white p-6 rounded-lg shadow-md border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>預約 ID:</strong> {reservation.id}</p>
                  <p><strong>客人姓名:</strong> {reservation.customerName}</p>
                  <p><strong>電話:</strong> {reservation.phone}</p>
                  <p><strong>電子郵件:</strong> {reservation.email}</p>
                </div>
                <div>
                  <p><strong>預約日期:</strong> {reservation.reservationDate}</p>
                  <p><strong>預約時間:</strong> {reservation.reservationTime}</p>
                  <p><strong>人數:</strong> {reservation.partySize}人</p>
                  <p><strong>狀態:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.status === 'confirmed' ? '已確認' :
                       reservation.status === 'pending' ? '待確認' :
                       reservation.status === 'cancelled' ? '已取消' : reservation.status}
                    </span>
                  </p>
                </div>
              </div>
              {reservation.specialRequests && (
                <div className="mt-4">
                  <p><strong>特殊需求:</strong> {reservation.specialRequests}</p>
                </div>
              )}
              {reservation.restaurant && (
                <div className="mt-4">
                  <p><strong>餐廳:</strong> {reservation.restaurant.name}</p>
                </div>
              )}
              <div className="mt-4 flex space-x-2">
                {reservation.status !== 'confirmed' && (
                  <button
                    onClick={() => updateStatus(reservation.id, 'confirmed', 'reservation')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    確認預約
                  </button>
                )}
                {reservation.status !== 'cancelled' && (
                  <button
                    onClick={() => updateStatus(reservation.id, 'cancelled', 'reservation')}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    取消預約
                  </button>
                )}
                {reservation.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatus(reservation.id, 'completed', 'reservation')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    標記完成
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (queryType === 'order' && results.orders) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">訂單記錄 ({results.count})</h3>
          {results.orders.map((order: any) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>訂單 ID:</strong> {order.id}</p>
                  <p><strong>電話:</strong> {order.phone}</p>
                  <p><strong>總金額:</strong> ${order.total_amount}</p>
                </div>
                <div>
                  <p><strong>狀態:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </p>
                  <p><strong>建立時間:</strong> {new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
              {order.order_items && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">訂單項目:</h4>
                  <ul className="space-y-1">
                    {order.order_items.map((item: any, index: number) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.products?.name || '未知商品'} x{item.quantity}</span>
                        <span>${item.subtotal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (queryType === 'user' && results.user) {
      const user = results.user
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">用戶資訊</h3>
          {user.summary && (
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>姓名:</strong> {user.summary.name}</p>
                  <p><strong>電話:</strong> {user.summary.phone}</p>
                  {user.summary.email && (
                    <p><strong>電子郵件:</strong> {user.summary.email}</p>
                  )}
                </div>
                <div>
                  <p><strong>預約次數:</strong> {user.summary.totalReservations} 次</p>
                  <p><strong>訂單次數:</strong> {user.summary.totalOrders} 次</p>
                  <p><strong>最後活動:</strong> {new Date(user.summary.lastActivity).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          
          {user.reservations && user.reservations.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3">最近預約記錄</h4>
              <div className="space-y-3">
                {user.reservations.slice(0, 3).map((reservation: any) => (
                  <div key={reservation.id} className="bg-gray-50 p-4 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p><strong>預約日期:</strong> {reservation.reservation_date} {reservation.reservation_time}</p>
                        <p><strong>人數:</strong> {reservation.party_size}人</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {reservation.status === 'confirmed' ? '已確認' :
                         reservation.status === 'pending' ? '待確認' :
                         reservation.status === 'cancelled' ? '已取消' : reservation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.orders && user.orders.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3">最近訂單記錄</h4>
              <div className="space-y-3">
                {user.orders.slice(0, 3).map((order: any) => (
                  <div key={order.id} className="bg-gray-50 p-4 rounded border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p><strong>訂單編號:</strong> {order.order_number}</p>
                        <p><strong>金額:</strong> ${order.total_amount}</p>
                        <p><strong>訂單時間:</strong> {new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    if (queryType === 'table' && results.tables) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">桌台狀態 ({results.count})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.tables.map((table: any) => (
              <div key={table.id} className="bg-white p-4 rounded-lg shadow-md border">
                <h4 className="font-semibold text-lg">桌號 {table.table_number}</h4>
                <p><strong>容納人數:</strong> {table.capacity}人</p>
                <p><strong>狀態:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    table.status === 'available' ? 'bg-green-100 text-green-800' :
                    table.status === 'occupied' ? 'bg-red-100 text-red-800' :
                    table.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {table.status === 'available' ? '空桌' :
                     table.status === 'occupied' ? '使用中' :
                     table.status === 'reserved' ? '已預訂' : table.status}
                  </span>
                </p>
                {table.restaurants && (
                  <p><strong>餐廳:</strong> {table.restaurants.name}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-center mb-6">🔍 確認查詢系統</h1>
          
          {/* 查詢類型選擇 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { value: 'reservation', label: '預約確認', icon: '📅' },
              { value: 'order', label: '訂單查詢', icon: '🛒' },
              { value: 'user', label: '用戶查詢', icon: '👤' },
              { value: 'table', label: '桌台狀態', icon: '🪑' }
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setQueryType(type.value)}
                className={`p-4 rounded-lg text-center transition-all ${
                  queryType === type.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="text-sm font-medium">{type.label}</div>
              </button>
            ))}
          </div>

          {/* 搜尋選項 */}
          {queryType !== 'table' && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {queryType === 'reservation' && (
                  <>
                    <option value="phone">電話號碼</option>
                    <option value="email">電子郵件</option>
                    <option value="id">預約 ID</option>
                  </>
                )}
                {queryType === 'order' && (
                  <>
                    <option value="phone">電話號碼</option>
                    <option value="id">訂單 ID</option>
                  </>
                )}
                {queryType === 'user' && (
                  <>
                    <option value="phone">電話號碼</option>
                    <option value="email">電子郵件</option>
                  </>
                )}
              </select>
              
              <input
                type="text"
                placeholder={`輸入${
                  searchType === 'phone' ? '電話號碼' :
                  searchType === 'email' ? '電子郵件' :
                  searchType === 'id' ? 'ID' : '查詢內容'
                }`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? '查詢中...' : '查詢'}
              </button>
            </div>
          )}

          {/* 桌台查詢按鈕 */}
          {queryType === 'table' && (
            <div className="text-center mb-6">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? '查詢中...' : '查詢所有桌台狀態'}
              </button>
            </div>
          )}

          {/* 錯誤訊息 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
        </div>

        {/* 查詢結果 */}
        {results && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderResults()}
          </div>
        )}
      </div>
    </div>
  )
}
