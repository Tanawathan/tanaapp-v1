import 'dotenv/config'

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.log('OPENAI_API_KEY not set – skipping actual AI call. Set it in .env.local to enable.')
    process.exit(0)
  }
  const res = await fetch('http://localhost:3000/api/ai/reservation-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '8月12號 晚上7點 4位 王小姐 靠窗 清淡飲食' })
  })
  const json = await res.json()
  console.log('AI reservation summary response:', json)
}

main().catch(e => { console.error(e); process.exit(1) })
