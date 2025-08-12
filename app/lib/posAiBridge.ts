// Bridge for integrating TanaAPP chat with external Tanapos POS AI server
// The POS AI server is provided by tanapos-v4-mini (scripts/ai/server.mjs)
// It exposes endpoints:
//  - POST /api/ai/interpret { text }
//  - POST /api/ai/execute { action, arguments, confirmToken? }
//  - GET  /api/ai/meta -> { whitelist: string[], confirmRequired: string[] }
// This bridge offers thin wrappers with graceful fallback when server/env not configured.

export interface PosInterpretResponse {
  action: string
  arguments: any
  reason?: string
  raw?: string
  validation?: any
}

export interface PosExecuteResult {
  action: string
  data: any
}

interface PosMeta {
  whitelist: string[]
  confirmRequired: string[]
}

const BASE = process.env.NEXT_PUBLIC_POS_AI_BASE_URL // e.g. http://localhost:8787
let metaCache: PosMeta | null = null
let metaFetchedAt = 0

async function fetchMeta(): Promise<PosMeta | null> {
  if (!BASE) return null
  const now = Date.now()
  if (metaCache && now - metaFetchedAt < 5 * 60 * 1000) return metaCache
  try {
    const res = await fetch(`${BASE}/api/ai/meta`)
    if (!res.ok) return null
    const json = await res.json()
    metaCache = { whitelist: json.whitelist || [], confirmRequired: json.confirmRequired || [] }
    metaFetchedAt = now
    return metaCache
  } catch {
    return null
  }
}

export async function posInterpret(text: string): Promise<PosInterpretResponse | null> {
  if (!BASE) return null
  try {
    const res = await fetch(`${BASE}/api/ai/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    if (!res.ok) return null
    const data = await res.json()
    return data as PosInterpretResponse
  } catch {
    return null
  }
}

export async function posExecute(action: string, args: any, confirmToken?: string): Promise<PosExecuteResult | { confirmationRequired: true; expectedToken: string }> {
  if (!BASE) throw new Error('POS AI base URL not configured (NEXT_PUBLIC_POS_AI_BASE_URL)')
  const payload: any = { action, arguments: args }
  if (confirmToken) payload.confirmToken = confirmToken
  const res = await fetch(`${BASE}/api/ai/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (res.status === 409) {
    // confirmation required
    try {
      const json = await res.json()
      return { confirmationRequired: true, expectedToken: json.expectedToken }
    } catch {
      return { confirmationRequired: true, expectedToken: 'UNKNOWN' }
    }
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`POS execute failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  return json as PosExecuteResult
}

export async function getPosMeta() {
  return fetchMeta()
}

export function summarizeActionResult(action: string, result: any): string {
  // Simple human-readable summaries in Chinese
  try {
    switch (action) {
      case 'createReservation':
        return `✅ 已建立預約：${result?.data?.customer_name || ''} ${result?.data?.reservation_date || ''} ${result?.data?.reservation_time || ''} (人數: ${result?.data?.party_size || ''})`;
      case 'listAvailableSlots':
        return `📅 可用時段：${(result?.data?.slots || []).join(', ') || '暫無資料'}`;
      case 'assignTable':
        return `🪑 已為預約 ${result?.data?.reservation_id} 指派桌號 ${result?.data?.table_id}`;
      case 'createOrder':
        return `🧾 已建立訂單 #${result?.data?.id || ''}`;
      case 'addItemToOrder':
        return `🍽️ 已加入商品 ${result?.data?.product_id} (數量 ${result?.data?.quantity}) 到訂單 ${result?.data?.order_id}`;
      case 'closeOrder':
        return `💳 訂單 ${result?.data?.order_id} 已結帳完成`;
      default:
        return `✅ 已執行動作 ${action}`
    }
  } catch {
    return `✅ 已執行動作 ${action}`
  }
}
