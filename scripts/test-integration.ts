/**
 * TanaAPP x TanaPOS 整合測試
 * 測試 API 連接和資料同步
 */

const API_BASE = 'http://localhost:3000/api'

async function testAPIEndpoint(endpoint: string, options?: RequestInit) {
  try {
    console.log(`\n🧪 Testing: ${endpoint}`)
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    })

    if (!response.ok) {
      const error = await response.text()
      console.log(`❌ Error ${response.status}: ${error}`)
      return null
    }

    const data = await response.json()
    console.log(`✅ Success:`, JSON.stringify(data, null, 2))
    return data
  } catch (error) {
    console.log(`❌ Network Error:`, error)
    return null
  }
}

async function runTests() {
  console.log('🚀 TanaAPP API Integration Tests\n')
  console.log('=' .repeat(50))

  // 1. 測試菜單 API
  console.log('\n📋 1. Menu API Tests')
  await testAPIEndpoint('/menu')
  
  // 2. 測試搜尋 API
  console.log('\n🔍 2. Search API Tests')
  await testAPIEndpoint('/menu/search?q=炒')
  await testAPIEndpoint('/menu/search?q=湯')

  // 3. 測試餐廳狀態 API
  console.log('\n🏪 3. Restaurant API Tests')
  await testAPIEndpoint('/restaurant')

  // 4. 測試 AI 推薦 API
  console.log('\n🤖 4. AI Recommendation Tests')
  await testAPIEndpoint('/ai/recommend', {
    method: 'POST',
    body: JSON.stringify({
      preferences: ['辣', '酸'],
      budget: 300,
      partySize: 2
    })
  })

  // 5. 測試訂單 API
  console.log('\n📦 5. Order API Tests')
  
  // 先獲取菜單以取得商品 ID
  const menuData = await testAPIEndpoint('/menu')
  
  if (menuData?.menu?.products?.length > 0) {
    const firstProductId = menuData.menu.products[0].id
    
    // 測試建立訂單
    const orderData = await testAPIEndpoint('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          {
            productId: firstProductId,
            quantity: 1,
            notes: 'API 測試訂單'
          }
        ],
        specialRequests: '這是一個測試訂單'
      })
    })

    // 如果訂單建立成功，測試查詢訂單狀態
    if (orderData?.order?.id) {
      console.log('\n📋 6. Order Status Test')
      await testAPIEndpoint(`/orders?id=${orderData.order.id}`)
    }
  }

  console.log('\n' + '=' .repeat(50))
  console.log('🎉 Integration tests completed!')
}

// 執行測試
if (typeof window === 'undefined') {
  // Node.js 環境
  runTests().catch(console.error)
} else {
  // 瀏覽器環境
  (window as any).runTanaAPPTests = runTests
  console.log('Run tests with: runTanaAPPTests()')
}

export { runTests }
