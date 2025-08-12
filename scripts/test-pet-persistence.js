// 簡易持久化測試腳本：執行多個互動並列出最近紀錄
const base = process.env.BASE_URL || 'http://localhost:3000'
const userId = process.env.PET_USER || 'default'

async function jsonFetch(url, options) {
  const res = await fetch(url, options)
  const text = await res.text()
  try { return { status: res.status, body: JSON.parse(text) } } catch { return { status: res.status, body: text } }
}

async function run() {
  console.log('1) GET 初始寵物')
  console.log(await jsonFetch(`${base}/api/pet?userId=${userId}`))

  const actions = ['feed','pet','play','chat']
  for (const action of actions) {
    console.log(`\n2) POST 互動: ${action}`)
    console.log(await jsonFetch(`${base}/api/pet`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ action, userId }) }))
  }

  console.log('\n3) 列出最近互動紀錄')
  console.log(await jsonFetch(`${base}/api/pet/interactions?userId=${userId}&limit=10`))
}

run().catch(e => { console.error(e); process.exit(1) })
