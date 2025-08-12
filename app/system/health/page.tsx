import React from 'react'

async function fetchHealth() {
  try {
    const res = await fetch('http://localhost:3000/api/system/health', { cache: 'no-store' })
    return await res.json()
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export default async function SystemHealthPage() {
  const data = await fetchHealth()
  return (
    <div style={{ fontFamily: 'ui-monospace, monospace', padding: '2rem', lineHeight: 1.4 }}>
      <h1>🔍 System Health</h1>
      {data.error && <p style={{ color: 'red' }}>Error: {data.error}</p>}
      <pre style={{ background: '#111', color: '#0f0', padding: '1rem', overflowX: 'auto', borderRadius: 8 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
      <p style={{ marginTop: '1rem', fontSize: 12, opacity: 0.7 }}>Live reload – {new Date().toLocaleTimeString()}</p>
    </div>
  )
}
