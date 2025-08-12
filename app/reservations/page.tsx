"use client"
import React, { useRef } from 'react'
import ReservationTable from '@/components/reservations/ReservationTable'
import ReservationForm from '@/components/reservations/ReservationForm'

export default function ReservationsPage() {
  const tableRef = useRef<{ reload?: () => void } | null>(null)
  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">📅 預約管理</h1>
        <p className="text-sm text-gray-500">管理 / 建立 / 更新餐廳訂位</p>
      </header>
      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-4">
          <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h2 className="text-sm font-medium mb-3">建立新預約</h2>
            <ReservationForm onCreated={() => tableRef.current?.reload?.()} />
          </div>
          <div className="p-4 border rounded-lg bg-white shadow-sm text-xs text-gray-500 leading-relaxed">
            <p className="font-medium mb-1">提示</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>自動每 15 秒刷新資料</li>
              <li>點擊操作按鈕快速更新狀態</li>
              <li>搜尋支援姓名 / 電話</li>
              <li>CRUD API: /api/reservations/crud</li>
            </ul>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="p-4 border rounded-lg bg-white shadow-sm">
            <ReservationTable ref={tableRef as any} />
          </div>
        </div>
      </section>
    </div>
  )
}
