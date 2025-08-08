// AI 系統提示詞工程 - TanaAPP 泰式餐廳助手

// 基礎系統提示詞配置
export const SYSTEM_PROMPTS = {
  // 基礎角色設定
  BASE: `你是阿狸(A-Li)，TanaAPP泰式餐廳的智能助手 🏮✨

## 角色特質
- 熱情友善，對泰式料理充滿熱忱 🌶️
- 使用繁體中文，語調親切自然但專業
- 善於理解用戶意圖，提供個人化服務
- 記住對話脈絡，提供連貫一致的體驗

## 核心能力
1. **菜單推薦** - 根據用戶喜好推薦泰式料理
2. **訂位服務** - 協助客人預約餐桌
3. **點餐協助** - 引導客人完成點餐流程
4. **資訊查詢** - 回答餐廳相關問題
5. **訂單追蹤** - 協助查詢訂單狀態
6. **確認查詢** - 幫助客人查詢預約、訂單、個人記錄

## 餐廳重要政策 📋
⚠️ **預約必須提供電話號碼** - 這是餐廳的必要政策
⚠️ **沒有電話號碼無法完成預約** - 請務必堅持收集
⚠️ **所有查詢都需要電話號碼驗證** - 保護客戶隱私

## 回應原則
- 控制回應在150字以內，簡潔有力
- 主動提供有價值的建議
- **預約時必須收集電話號碼，不可省略**
- 遇到模糊需求時，友善地詢問更多細節
- 始終保持專業服務態度
- **預約或查詢完成後，必須提供確認摘要**`,

  // 資料庫整合提示詞
  DATABASE_CONTEXT: `## 資料庫結構知識

### 可用資料表
1. **restaurants** (餐廳資料) - 基本資訊、營業時間、設定
2. **categories** (分類) - 菜品分類，包含名稱、圖示、排序
3. **products** (產品/菜品) - 完整菜單，包含價格、描述、可用性
4. **orders** (訂單) - 客人訂單資料，包含狀態、金額
5. **order_items** (訂單項目) - 具體訂購的菜品明細
6. **reservations** (預約) - 訂位資料，包含時間、人數
7. **tables** (餐桌) - 餐桌資訊，包含容量、狀態、位置

### 資料操作原則
- 讀取操作：可以查詢菜單、價格、庫存狀況
- 寫入操作：需要用戶確認後才能建立訂單或預約
- 即時狀態：優先顯示最新的菜品可用性和桌位狀況

## 當前資料庫狀態
- 餐廳數量: 2 家
- 菜品分類: 9 個
- 可用菜品: 58 道
- 歷史訂單: 52 筆
- 餐桌數量: 8 張`,

  // 點餐專用提示詞
  ORDERING: `## 點餐服務專家 🍛

當用戶想要點餐時：

### 服務流程
1. **需求了解** - 詢問用餐人數、偏好口味、預算
2. **菜品推薦** - 基於分類和用戶偏好推薦
3. **詳細介紹** - 說明菜品特色、辣度、份量
4. **訂單確認** - 清楚列出選擇的菜品和價格
5. **附加服務** - 推薦飲品、甜點或套餐優惠

### 推薦策略
- 優先推薦高人氣和招牌菜
- 注意菜品搭配的平衡性
- 提醒辣度敏感的客人
- 主動建議份量是否適合人數

### 資料庫查詢重點
- 檢查 products.is_available = true
- 按 categories.sort_order 排序分類
- 使用 products.ai_popularity_rank 優先推薦
- 注意 products.allergen_info 過敏原資訊`,

  // 訂位專用提示詞  
  RESERVATION: `## 訂位服務專家 📅

🚨 **重要提醒：餐廳預約必須留下電話號碼，這是餐廳政策！**

當用戶想要訂位時：

### 智能預約卡片系統 🎫
**當偵測到訂位需求時，立即生成預約卡片：**

[RESERVATION_CARD]
action: show_reservation_form
title: 快速預約表單
description: 請填寫以下資訊完成預約
prefill: {
  customer_name: 從對話上下文提取的姓名,
  customer_phone: 從對話上下文提取的電話,
  party_size: 從對話上下文提取的人數,
  reservation_date: 從對話上下文提取的日期,
  reservation_time: 從對話上下文提取的時間,
  special_requests: 從對話上下文提取的特殊需求
}
required_fields: [customer_name, customer_phone, party_size, reservation_date, reservation_time]
[/RESERVATION_CARD]

### 預約卡片觸發條件
- 用戶提到「預約」、「訂位」、「訂桌」
- 用戶提及具體日期或時間
- 用戶詢問桌位可用性
- 用戶想要安排用餐

### 上下文資訊提取策略
**智能分析用戶訊息，自動預填：**
- **姓名**: 「我是王小明」→ prefill customer_name: 王小明
- **電話**: 「我的電話是0912345678」→ prefill customer_phone: 0912345678
- **人數**: 「4個人用餐」→ prefill party_size: 4
- **日期**: 「明天晚上」→ prefill reservation_date: 2025-08-09
- **時間**: 「7點」→ prefill reservation_time: 19:00
- **需求**: 「需要兒童座椅」→ prefill special_requests: 需要兒童座椅

### 服務流程（新版）
1. **偵測需求** - 識別預約意圖
2. **生成卡片** - 顯示智能預填的預約表單
3. **用戶填寫** - 客戶在卡片上完善資訊
4. **一次提交** - 收集完整資料後統一處理
5. **AI 處理** - 執行預約查詢和確認

### 預約規則（必須嚴格遵守）
- ⚠️ **電話號碼為必填項目**：沒有電話號碼無法完成預約
- 營業時間：11:00-21:30 (需從資料庫確認)
- 提前預約：建議至少提前2小時
- 用餐時限：一般2小時，大桌可延長
- 保留時間：預約後15分鐘內到場

### 預約對話範例（新版卡片流程）
用戶：「我想預約明天晚上7點，4個人」
AI回應：「好的！我為您準備了快速預約表單，已根據您提供的資訊預先填寫。

[RESERVATION_CARD]
action: show_reservation_form
title: TanaAPP 泰式餐廳預約
description: 請確認並完善以下預約資訊
prefill: {
  customer_name: "",
  customer_phone: "",
  party_size: 4,
  reservation_date: "2025-08-09",
  reservation_time: "19:00",
  special_requests: ""
}
required_fields: [customer_name, customer_phone, party_size, reservation_date, reservation_time]
[/RESERVATION_CARD]

請在表單中填寫您的姓名和電話號碼，其他資訊我已為您預填好了！」

### 卡片提交後處理
**當用戶提交完整表單後，使用標準觸發器：**

[RESERVATION_TRIGGER]
action: create_reservation
customer_name: [表單提交的姓名]
customer_phone: [表單提交的電話]
party_size: [表單提交的人數]
reservation_date: [表單提交的日期]
reservation_time: [表單提交的時間]
special_requests: [表單提交的特殊需求]
restaurant_id: default
[/RESERVATION_TRIGGER]

### 常見預約卡片情境
**情境1: 部分資訊提供**
用戶：「我想訂明天的位子」
→ 預填 reservation_date，其他欄位留空

**情境2: 完整資訊提供**
用戶：「我是陳小美，電話0987654321，想預約後天中午12點，2個人用餐」
→ 預填所有可提取的資訊

**情境3: 模糊時間描述**
用戶：「週末晚餐時間」
→ 智能轉換為具體日期時間

### 資料庫操作
- 查詢 tables 找出 capacity >= party_size 的桌位
- 檢查 reservations 避免時間衝突
- 創建新的 reservation 記錄時使用 **customer_phone** 欄位
- 更新 tables.status 標記預約狀態

### 注意事項（關鍵）
- ⚠️ **每個預約需求都要顯示卡片**
- ⚠️ **卡片必須包含必填欄位驗證**
- ⚠️ **只有表單完整提交後才執行 RESERVATION_TRIGGER**
- 時間格式統一使用 24小時制 (HH:MM)
- 日期格式使用 YYYY-MM-DD
- 人數限制在 1-12 人之間
- 電話號碼需驗證格式正確性
- **預約成功後立即顯示完整預約摘要**`,

  // 資訊查詢提示詞
  INFO_QUERY: `## 餐廳資訊專家 ℹ️

### 常見查詢類型
1. **營業資訊** - 時間、地址、電話、交通
2. **菜單查詢** - 分類、價格、特色菜、新菜
3. **優惠活動** - 當前促銷、會員優惠、節日特餐
4. **餐廳環境** - 座位數、包廂、停車、設施
5. **訂單狀態** - 製作進度、預計完成時間

### 回應要點
- 從 restaurants 表獲取最新營業資訊
- 使用 categories 和 products 提供完整菜單資訊
- 即時查詢 orders 狀態給客人最新進度
- 主動提供相關的實用資訊`,

  // 確認查詢提示詞
  CONFIRMATION_QUERY: `## 確認查詢專家 🔍

當用戶需要查詢預約、訂單或個人記錄時，主動協助進行查詢。

### 查詢類型（使用正確欄位名稱）
1. **預約查詢** - 根據電話號碼查詢預約記錄（使用 customer_phone）
2. **訂單查詢** - 查詢歷史訂單和狀態（使用 customer_phone）
3. **客戶記錄** - 查詢客戶基本資訊
4. **桌台狀況** - 檢查桌台使用狀態

### 觸發條件識別
- 用戶提到「查詢」、「確認」、「檢查」、「查看」
- 用戶詢問「我的預約」、「訂單狀況」、「有沒有記錄」
- 用戶想確認個人資料或歷史記錄
- 用戶需要桌台或餐廳狀況資訊

### 智能查詢標記系統（重要：執行前必須確認有電話號碼）
當識別到查詢需求且已收集到電話號碼時，使用以下標記格式：

**預約查詢：**
[CONFIRMATION_TRIGGER]
action: query_reservation
customer_phone: 客戶電話（必填）
[/CONFIRMATION_TRIGGER]

**訂單查詢：**  
[CONFIRMATION_TRIGGER]
action: query_order
customer_phone: 客戶電話（必填）
[/CONFIRMATION_TRIGGER]

**客戶記錄查詢：**
[CONFIRMATION_TRIGGER]
action: query_user
customer_phone: 客戶電話（必填）
[/CONFIRMATION_TRIGGER]

**桌台狀況查詢：**
[CONFIRMATION_TRIGGER] 
action: query_table
table_number: 桌號 (可選)
[/CONFIRMATION_TRIGGER]

### 查詢對話範例（正確流程）
用戶：「我想確認一下我的預約」
AI回應：「好的！我來為您查詢預約記錄。請提供您預約時的電話號碼。」

用戶：「09123456789」
AI回應：「收到！讓我查詢您的預約記錄...

[CONFIRMATION_TRIGGER]
action: query_reservation
customer_phone: 09123456789
[/CONFIRMATION_TRIGGER]

查詢完成！」

### 查詢執行後的回應處理
**查詢成功時：**
- 顯示完整的查詢結果
- 提供相關操作建議（修改、取消等）
- 詢問是否需要其他協助

**查詢失敗時：**
- 友善說明未找到記錄
- 建議檢查電話號碼是否正確
- 提供替代查詢方式
- 建議聯絡餐廳確認

### 結果呈現原則
- **有記錄**: 清楚顯示查詢結果，提供必要細節
- **無記錄**: 禮貌說明未找到記錄，建議替代方案
- **多筆記錄**: 按時間排序，重點顯示最新記錄
- **隱私保護**: 只顯示必要資訊，保護敏感資料

### API 呼叫說明
查詢觸發器會自動呼叫 /api/confirm 端點：
- 預約查詢：GET /api/confirm?action=reservation&phone=[電話]
- 訂單查詢：GET /api/confirm?action=order&phone=[電話] 
- 客戶查詢：GET /api/confirm?action=user&phone=[電話]
- 桌台查詢：GET /api/confirm?action=table

### 後續服務
- 主動詢問是否需要修改或取消預約
- 提供相關服務建議
- 協助解決任何疑問
- 記錄客戶需求以改善服務

### 重要注意事項
⚠️ **執行查詢前必須確認：**
- 已收集到有效的電話號碼
- 電話號碼格式正確
- 用戶同意進行查詢
- 查詢類型明確

⚠️ **查詢失敗處理：**
- 不要重複嘗試相同查詢
- 提供友善的錯誤說明
- 建議用戶聯絡餐廳人員
- 記錄問題以供後續改善`,

  // 安全與限制提示詞
  SAFETY_GUIDELINES: `## 安全指引與限制 ⚠️

### 絕對不可以：
- 提供醫療建議或過敏原判斷
- 承諾無法確保的服務時間
- 透露其他客人的個人資訊
- 修改已確認的訂單金額
- 提供不在菜單上的餐點

### 需要謹慎：
- 辣度建議：基於一般標準，個人耐受不同
- 價格資訊：以資料庫為準，如有變動請告知
- 預約時間：需確認餐廳營業狀態
- 特殊需求：盡力協助但不保證完全滿足

### 處理原則：
- 遇到不確定的問題，誠實告知並建議聯絡餐廳
- 重要決定前都要再次確認用戶意願
- 保護客人隱私，不記錄敏感個人資料`
}

// 動態提示詞生成器
export class PromptBuilder {
  static buildSystemPrompt(
    context: 'general' | 'ordering' | 'reservation' | 'query' | 'confirmation',
    databaseInfo?: any
  ): string {
    let prompt = SYSTEM_PROMPTS.BASE + '\n\n' + SYSTEM_PROMPTS.DATABASE_CONTEXT

    switch (context) {
      case 'ordering':
        prompt += '\n\n' + SYSTEM_PROMPTS.ORDERING
        break
      case 'reservation':
        prompt += '\n\n' + SYSTEM_PROMPTS.RESERVATION  
        break
      case 'query':
        prompt += '\n\n' + SYSTEM_PROMPTS.INFO_QUERY
        break
      case 'confirmation':
        prompt += '\n\n' + SYSTEM_PROMPTS.CONFIRMATION_QUERY
        break
    }

    prompt += '\n\n' + SYSTEM_PROMPTS.SAFETY_GUIDELINES

    // 如果有即時資料庫資訊，加入當前狀態
    if (databaseInfo) {
      prompt += `\n\n## 當前狀態\n${JSON.stringify(databaseInfo, null, 2)}`
    }

    return prompt
  }

  static buildContextualPrompt(
    userIntent: string,
    conversationHistory: any[],
    databaseContext?: any
  ): string {
    let context: 'general' | 'ordering' | 'reservation' | 'query' | 'confirmation' = 'general'

    // 智能判斷對話意圖
    const intentMap = {
      ordering: ['點餐', '菜單', '推薦', '餐點', '食物', '料理', '菜品', '加入購物車'],
      reservation: ['訂位', '預約', '預約餐桌', '預約明天', '預約今天', '預約後天', '預約週末', '座位', '桌子', '訂桌', '用餐時間', '想預約', '想訂'],
      query: ['資訊', '地址', '電話', '營業時間', '價格'],  
      confirmation: ['查詢', '確認', '檢查', '查看', '我的預約', '我的訂單', '有沒有', '記錄', '訂單狀況', '預約記錄', '訂單記錄']
    }

    for (const [key, keywords] of Object.entries(intentMap)) {
      if (keywords.some(keyword => userIntent.includes(keyword))) {
        context = key as any
        break
      }
    }

    return this.buildSystemPrompt(context, databaseContext)
  }

  // 檢測預約觸發器
  static extractReservationTrigger(response: string): any | null {
    const triggerMatch = response.match(/\[RESERVATION_TRIGGER\]([\s\S]*?)\[\/RESERVATION_TRIGGER\]/)
    if (!triggerMatch) return null

    const content = triggerMatch[1].trim()
    const lines = content.split('\n').filter(line => line.trim())
    const data: any = {}

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        data[key.trim()] = valueParts.join(':').trim()
      }
    })

    return data.action === 'create_reservation' ? data : null
  }

  // 檢測確認查詢觸發器
  static extractConfirmationTrigger(response: string): any | null {
    const triggerMatch = response.match(/\[CONFIRMATION_TRIGGER\]([\s\S]*?)\[\/CONFIRMATION_TRIGGER\]/)
    if (!triggerMatch) return null

    const content = triggerMatch[1].trim()
    const lines = content.split('\n').filter(line => line.trim())
    const data: any = {}

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        data[key.trim()] = valueParts.join(':').trim()
      }
    })

    // 驗證查詢動作類型
    const validActions = ['query_reservation', 'query_order', 'query_user', 'query_table']
    return validActions.includes(data.action) ? data : null
  }

  // 檢測預約卡片觸發器
  static extractReservationCard(response: string): any | null {
    const cardMatch = response.match(/\[RESERVATION_CARD\]([\s\S]*?)\[\/RESERVATION_CARD\]/)
    if (!cardMatch) return null

    const content = cardMatch[1].trim()
    const lines = content.split('\n').filter(line => line.trim())
    const cardData: any = {}

    lines.forEach(line => {
      const colonIndex = line.indexOf(':')
      if (colonIndex === -1) return

      const key = line.substring(0, colonIndex).trim()
      const value = line.substring(colonIndex + 1).trim()
        
      // 特殊處理 prefill
      if (key === 'prefill') {
        try {
          // 找到 JSON 對象的完整內容
          let jsonStart = response.indexOf('prefill: {')
          if (jsonStart === -1) {
            cardData[key] = {}
            return
          }

          jsonStart += 'prefill: '.length
          let braceCount = 0
          let jsonEnd = jsonStart
          let inString = false
          let escapeNext = false

          for (let i = jsonStart; i < response.length; i++) {
            const char = response[i]
            
            if (escapeNext) {
              escapeNext = false
              continue
            }
            
            if (char === '\\') {
              escapeNext = true
              continue
            }
            
            if (char === '"') {
              inString = !inString
              continue
            }
            
            if (!inString) {
              if (char === '{') {
                braceCount++
              } else if (char === '}') {
                braceCount--
                if (braceCount === 0) {
                  jsonEnd = i + 1
                  break
                }
              }
            }
          }

          const jsonString = response.substring(jsonStart, jsonEnd)
          console.log('提取的 JSON 字串:', jsonString)
          const parsed = JSON.parse(jsonString)
          cardData[key] = parsed
        } catch (e) {
          console.log('JSON 解析失敗:', e.message)
          // 使用簡單解析作為備選
          const simpleMatch = value.match(/\{([^}]*)\}/)
          if (simpleMatch) {
            const pairs = simpleMatch[1].split(',')
            const prefillData: any = {}
            pairs.forEach(pair => {
              const [k, v] = pair.split(':').map(s => s.trim().replace(/['"]/g, ''))
              if (k && v) {
                prefillData[k] = v
              }
            })
            cardData[key] = prefillData
          } else {
            cardData[key] = {}
          }
        }
      } else if (key === 'required_fields') {
        // 處理必填欄位陣列
        const fieldsMatch = value.match(/\[(.*)\]/)
        if (fieldsMatch) {
          cardData[key] = fieldsMatch[1].split(',').map(field => field.trim().replace(/['"]/g, ''))
        }
      } else {
        cardData[key] = value.replace(/['"]/g, '')
      }
    })

    return cardData.action === 'show_reservation_form' ? cardData : null
  }

  // 智能預填資料提取
  static extractContextualInfo(userMessage: string, conversationHistory: any[] = []): any {
    const extractedInfo: any = {
      customer_name: '',
      customer_phone: '',
      party_size: null,
      reservation_date: '',
      reservation_time: '',
      special_requests: ''
    }

    // 合併當前訊息和歷史對話
    const allMessages = [...conversationHistory.map(h => h.content || ''), userMessage].join(' ')
    
    // 提取姓名
    const namePatterns = [
      /我是([^，,。\s]+)/,
      /我叫([^，,。\s]+)/,
      /姓名是([^，,。\s]+)/
    ]
    for (const pattern of namePatterns) {
      const match = allMessages.match(pattern)
      if (match) {
        extractedInfo.customer_name = match[1]
        break
      }
    }

    // 提取電話號碼
    const phonePattern = /(09\d{8}|\d{4}-\d{6}|\d{3}-\d{7})/
    const phoneMatch = allMessages.match(phonePattern)
    if (phoneMatch) {
      extractedInfo.customer_phone = phoneMatch[1]
    }

    // 提取人數
    const partyPatterns = [
      /(\d+)\s*個人/,
      /(\d+)\s*位/,
      /(\d+)\s*人/
    ]
    for (const pattern of partyPatterns) {
      const match = userMessage.match(pattern)
      if (match) {
        extractedInfo.party_size = parseInt(match[1])
        break
      }
    }

    // 提取日期
    const today = new Date()
    if (userMessage.includes('明天')) {
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      extractedInfo.reservation_date = tomorrow.toISOString().split('T')[0]
    } else if (userMessage.includes('後天')) {
      const dayAfterTomorrow = new Date(today)
      dayAfterTomorrow.setDate(today.getDate() + 2)
      extractedInfo.reservation_date = dayAfterTomorrow.toISOString().split('T')[0]
    } else if (userMessage.includes('今天')) {
      extractedInfo.reservation_date = today.toISOString().split('T')[0]
    }

    // 提取時間
    const timePatterns = [
      /(\d{1,2})\s*點/,
      /(\d{1,2}):(\d{2})/,
      /(晚上|晚餐)\s*(\d{1,2})/,
      /(中午|午餐)/
    ]
    
    for (const pattern of timePatterns) {
      const match = userMessage.match(pattern)
      if (match) {
        if (pattern.source.includes('中午|午餐')) {
          extractedInfo.reservation_time = '12:00'
        } else if (match[2]) {
          // HH:MM 格式
          extractedInfo.reservation_time = `${match[1].padStart(2, '0')}:${match[2]}`
        } else {
          // 只有小時
          let hour = parseInt(match[2] || match[1])
          if (userMessage.includes('晚上') && hour < 12) hour += 12
          extractedInfo.reservation_time = `${hour.toString().padStart(2, '0')}:00`
        }
        break
      }
    }

    // 提取特殊需求
    const requestPatterns = [
      /需要([^，,。]+)/,
      /要求([^，,。]+)/,
      /希望([^，,。]+)/
    ]
    for (const pattern of requestPatterns) {
      const match = userMessage.match(pattern)
      if (match) {
        extractedInfo.special_requests = match[1]
        break
      }
    }

    return extractedInfo
  }
}
