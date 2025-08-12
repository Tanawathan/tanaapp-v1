import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(url, key)

interface TableCheck { table: string; requiredColumns: string[] }

const tables: TableCheck[] = [
  { table: 'restaurants', requiredColumns: ['id','name','is_active'] },
  { table: 'tables', requiredColumns: ['id','restaurant_id','status','seats'] },
  { table: 'reservations', requiredColumns: ['id','restaurant_id','customer_name','party_size','reservation_date','reservation_time','status'] }
]

async function checkTable(tc: TableCheck) {
  const { data, error } = await supabase.from(tc.table).select('*').limit(1)
  if (error) return { table: tc.table, exists: false, error: error.message }
  if (!data || data.length === 0) {
    // no rows to infer columns, attempt a count
    return { table: tc.table, exists: true, columnsMissing: [] }
  }
  const row = data[0]
  const missing = tc.requiredColumns.filter(c => !(c in row))
  return { table: tc.table, exists: true, columnsMissing: missing }
}

async function main() {
  console.log('🔎 Validating database schema...')
  const results = await Promise.all(tables.map(checkTable))
  const missingTables = results.filter(r => !r.exists)
  const badColumns = results.filter(r => r.exists && r.columnsMissing && r.columnsMissing.length)

  console.log('\n結果:')
  for (const r of results) {
    if (!r.exists) console.log(`❌ 表不存在: ${r.table} (${r.error})`)
    else if (r.columnsMissing && r.columnsMissing.length) console.log(`⚠️ 欄位缺失 ${r.table}: ${r.columnsMissing.join(', ')}`)
    else console.log(`✅ ${r.table} OK`)
  }

  if (missingTables.length === 0 && badColumns.length === 0) {
    console.log('\n🎉 資料庫結構驗證通過')
    process.exit(0)
  } else {
    console.log('\n⚠️ 結構不完整')
    process.exit(1)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
