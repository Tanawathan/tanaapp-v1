# POS AI Server 建置與整合指南

本指南說明如何啟動 `tanapos-v4-mini` 的 AI 指令伺服器，並讓 **TanaAPP** 聊天介面透過已加入的 `posAiBridge` 呼叫餐廳 / POS 動作（建立預約、建立訂單等）。

---
## 1. 目錄關係
- 顧客端 (本專案)：`tanaapp-v1`
- POS + AI 指令層：`tanapos-v4-mini` (`scripts/ai/server.mjs`)

TanaAPP 直接以 **瀏覽器 fetch** 呼叫外部 AI Server (`NEXT_PUBLIC_POS_AI_BASE_URL`) 的 `/api/ai/*` 端點。

---
## 2. 在 tanapos-v4-mini 準備環境
```bash
cd tanapos-v4-mini
cp .env.example .env    # 若尚未建立
```
編輯 `.env` 必填：
```
VITE_SUPABASE_URL=...            # Supabase 專案 URL
VITE_SUPABASE_ANON_KEY=...       # Anon Key
PRIVATE_SUPABASE_SERVICE_ROLE_KEY=...   # Service Role Key (僅伺服端)
VITE_RESTAURANT_ID=<對應餐廳 UUID>

OPENAI_API_KEY=sk-...            # 若暫時沒有可留空，則 interpret 會給 clarify
OPENAI_MODEL=gpt-4.1-mini        # 或你的模型代號
AI_TEMPERATURE=0

AI_ACTION_WHITELIST=createReservation,listAvailableSlots,assignTable,createOrder,addItemToOrder,closeOrder
AI_REQUIRE_CONFIRMATION_ACTIONS=createReservation,createOrder,closeOrder
AI_AUDIT_ENABLED=true            # 若要寫入 ai_audit
```
（可選）指定埠：`AI_SERVER_PORT=8787`

安裝依賴並啟動：
```bash
npm install       # 或 pnpm / yarn
npm run ai:server # 等同 node scripts/ai/server.mjs
# 或開發快速啟動 (dummy key)： npm run ai:dev
```
啟動後 console 會顯示：`[AI] server listening on :8787`

### 健康檢查
```bash
curl http://localhost:8787/api/ai/health
curl http://localhost:8787/api/ai/meta
```

---
## 3. 建立審計資料表 (可選)
若啟用 `AI_AUDIT_ENABLED=true`，請在 Supabase SQL 執行：
```sql
-- 來源：tanapos-v4-mini/scripts/ai/sql/create-ai-audit-table.sql
create table if not exists public.ai_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  ip text null,
  action text not null,
  args jsonb not null default '{}'::jsonb,
  success boolean not null default false,
  error_message text null,
  raw_output text null,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_audit_created_at on public.ai_audit(created_at);
```

---
## 4. 在 TanaAPP 設定環境
於 `tanaapp-v1/.env.local` 新增：
```
NEXT_PUBLIC_POS_AI_BASE_URL=http://localhost:8787
```
（若不同埠或已佈署，替換為對外可訪問的完整 URL）

重新啟動 TanaAPP dev server 後，聊天訊息流程會：
1. 先呼叫 POS AI `/api/ai/interpret` 解讀 `userInput`
2. 若回傳 `action != unknown`：
   - 若動作需要確認 → 回覆提示輸入 `CONFIRM-<ACTION>`
   - 否則直接呼叫 `/api/ai/execute` 執行，並以中文摘要回覆
3. 若 interpret 失敗或為 `unknown` → 回退原本 OpenAI/heuristic 模式

> 已修改檔案：`app/utils/aiChatManager.ts` + 新增 `app/lib/posAiBridge.ts`

---
## 5. 動作確認流程 (敏感動作)
`AI_REQUIRE_CONFIRMATION_ACTIONS` 中的動作（例如建立預約 / 訂單）第一次只會提示：
```
⚠️ 準備執行動作: createReservation
請輸入: CONFIRM-CREATERESERVATION 以確認。
```
使用者再次輸入該 token（或在 UI 上封裝自動送出）後即可真正執行。

（目前 TanaAPP 尚未自動捕捉確認 token，可後續擴充：偵測以 `CONFIRM-` 開頭的輸入直接走 interpret→execute）

---
## 6. 測試範例
```bash
curl -X POST http://localhost:8787/api/ai/interpret \
  -H 'Content-Type: application/json' \
  -d '{"text":"幫我 12/25 晚上 18:30 訂四位的位子 名字王小明"}'

# interpret 回傳類似： { "action":"createReservation", "arguments":{...} }

# （若動作不需確認）可直接手動測：
curl -X POST http://localhost:8787/api/ai/execute \
  -H 'Content-Type: application/json' \
  -d '{"action":"listAvailableSlots","arguments":{"date":"2025-12-25","party_size":4}}'
```

---
## 7. 常見問題
| 問題 | 排查 |
|------|------|
| 瀏覽器無回應 POS 動作 | 檢查 TanaAPP `.env.local` 是否含 `NEXT_PUBLIC_POS_AI_BASE_URL`，並重新啟動 dev server |
| 409 confirmation_required | 依回覆 expectedToken 再次發送該 token |
| interpret 一直回 clarify / unknown | 確認 `OPENAI_API_KEY` 有值且模型代號正確；或暫時降低語句複雜度 |
| execute 500 | 看 AI server console / Supabase 日誌；檢查資料表 (reservations/orders) 欄位是否存在 |
| CORS 錯誤 | server.mjs 已 `app.use(cors())`，若改自訂網域再檢查瀏覽器 console |

---
## 8. 後續可選擴充
- 在 TanaAPP 偵測 `CONFIRM-<ACTION>` 自動直接呼叫 `posExecute`（跳過 interpret）
- 將 POS 動作結果（例如預約 ID / 訂單號）存入對話上下文供後續追蹤查詢
- 加入動作錯誤的翻譯與友善提示 mapping
- 以 server-side Route 代理外部 AI Server（避免直接暴露 BASE URL）

---
完成以上步驟後，使用者即可在 TanaAPP 聊天中直接輸入自然語言並觸發 POS 指令。
