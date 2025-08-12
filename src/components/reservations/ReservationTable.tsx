"use client"
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Reservation } from '@/lib/types/shared'
import { CheckCircle, Clock, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  autoRefreshMs?: number
}

const statusColor: Record<Reservation['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  seated: 'bg-green-100 text-green-800 border-green-300',
  completed: 'bg-gray-200 text-gray-700 border-gray-300',
  cancelled: 'bg-red-100 text-red-700 border-red-300',
  no_show: 'bg-red-50 text-red-600 border-red-200'
}

export const ReservationTable = forwardRef<{ reload: () => void }, Props>(function ReservationTable({ autoRefreshMs = 15000 }, ref) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [refreshTick, setRefreshTick] = useState(0)
  const [filter, setFilter] = useState<string>('')

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/reservations/crud')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setReservations(json.data || [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [refreshTick])
  useEffect(() => {
    const id = setInterval(() => setRefreshTick(t => t + 1), autoRefreshMs)
    return () => clearInterval(id)
  }, [autoRefreshMs])

  const filtered = reservations.filter(r => {
    if (!filter) return true
    const f = filter.toLowerCase()
    return r.customer_name.toLowerCase().includes(f) || r.customer_phone.includes(f)
  })

  async function updateStatus(id: string, status: Reservation['status']) {
    const res = await fetch('/api/reservations/crud', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    const json = await res.json()
    if (!json.error) load()
  }

  async function remove(id: string) {
    await fetch(`/api/reservations/crud?id=${id}`, { method: 'DELETE' })
    load()
  }

  useImperativeHandle(ref, () => ({ reload: load }), [load])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input placeholder="搜尋姓名/電話" className="px-3 py-2 border rounded w-60 text-sm" value={filter} onChange={e => setFilter(e.target.value)} />
        <button onClick={() => load()} className="flex items-center gap-1 px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> 刷新
        </button>
        {loading && <span className="text-xs text-gray-500">載入中...</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left">日期</th>
              <th className="px-3 py-2 text-left">時間</th>
              <th className="px-3 py-2 text-left">人數</th>
              <th className="px-3 py-2 text-left">姓名</th>
              <th className="px-3 py-2 text-left">電話</th>
              <th className="px-3 py-2 text-left">狀態</th>
              <th className="px-3 py-2 text-left">需求</th>
              <th className="px-3 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">{r.reservation_date}</td>
                <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">{r.reservation_time}</td>
                <td className="px-3 py-2">{r.party_size}</td>
                <td className="px-3 py-2">{r.customer_name}</td>
                <td className="px-3 py-2">{r.customer_phone}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 text-xs rounded border inline-block ${statusColor[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-3 py-2 max-w-[180px] truncate" title={r.special_requests || ''}>{r.special_requests || '-'}</td>
                <td className="px-3 py-2 space-x-1">
                  <button onClick={() => updateStatus(r.id, 'confirmed')} className="inline-flex items-center px-2 py-1 text-xs border rounded hover:bg-blue-50">確</button>
                  <button onClick={() => updateStatus(r.id, 'seated')} className="inline-flex items-center px-2 py-1 text-xs border rounded hover:bg-green-50">入</button>
                  <button onClick={() => updateStatus(r.id, 'cancelled')} className="inline-flex items-center px-2 py-1 text-xs border rounded hover:bg-red-50">消</button>
                  <button onClick={() => remove(r.id)} className="inline-flex items-center px-2 py-1 text-xs border rounded hover:bg-gray-100">刪</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-400 text-sm">無預約資料</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
})

export default ReservationTable
