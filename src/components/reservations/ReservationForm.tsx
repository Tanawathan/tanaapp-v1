"use client"
import React, { useState } from 'react'

interface Props { onCreated?: () => void }

export function ReservationForm({ onCreated }: Props) {
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    party_size: 2,
    reservation_date: '',
    reservation_time: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof typeof form>(k: K, v: any) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/reservations/crud', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const json = await res.json()
      if (json.errors) throw new Error(json.errors.join(', '))
      if (json.error) throw new Error(json.error)
      setForm({ customer_name: '', customer_phone: '', party_size: 2, reservation_date: '', reservation_time: '' })
      onCreated?.()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">姓名</label>
          <input className="w-full border rounded px-2 py-1 text-sm" value={form.customer_name} onChange={e => update('customer_name', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">電話</label>
            <input className="w-full border rounded px-2 py-1 text-sm" value={form.customer_phone} onChange={e => update('customer_phone', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">人數</label>
          <input type="number" min={1} className="w-full border rounded px-2 py-1 text-sm" value={form.party_size} onChange={e => update('party_size', Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">日期</label>
          <input type="date" className="w-full border rounded px-2 py-1 text-sm" value={form.reservation_date} onChange={e => update('reservation_date', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">時間</label>
          <input type="time" className="w-full border rounded px-2 py-1 text-sm" value={form.reservation_time} onChange={e => update('reservation_time', e.target.value)} />
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button disabled={loading} onClick={submit} className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
        {loading ? '建立中...' : '建立預約'}
      </button>
    </div>
  )
}

export default ReservationForm
