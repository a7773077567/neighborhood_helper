# Neighborhood Helper 專案開發規範

> **重要**：這些規範會在所有 AI 對話中生效
> **更新日期**：2026-02-13

---

## 專案概述

**專案名稱**：Neighborhood Helper（GDG Tainan 社群活動管理平台）

**核心目標**：
- 挖掘在地講者
- 透過遊戲化機制鼓勵參與
- 串連台南科技社群
- 累積社群資產

**開發目的**：
- 建立可運作的社群平台
- 透過實作學習 React、Next.js、後端開發
- 建立可重複的 AI 協作學習方法

---

## 技術棧（不可變）

### 核心技術

```
前端           Next.js 14 (App Router) + React + TypeScript
樣式           Tailwind CSS + shadcn/ui
UI/UX 設計     Pencil + shadcn/ui 設計系統
後端           Next.js API Routes
ORM            Prisma
資料庫         PostgreSQL (Supabase)
認證           NextAuth.js v5 (Auth.js)
驗證           Zod
時間處理       Day.js
表單           react-hook-form + @hookform/resolvers
Email          Resend + React Email
測試           Vitest + React Testing Library
部署           Vercel
```

**為什麼選這些？**
- Next.js 14：前後端整合，學習 React 的最佳路徑
- TypeScript：型別安全，減少 bug
- Prisma：型別安全的 ORM，migration 方便
- Supabase：免費託管 PostgreSQL
- shadcn/ui：元件可控，省開發時間

---

## 專案級規則（永久適用）

### 1. TypeScript 規範

```typescript
// ✅ 必須
- 使用 strict mode
- 所有函式都要定義回傳型別
- 避免使用 any（用 unknown 或具體型別）

// ❌ 禁止
- 使用 @ts-ignore（除非有充分理由並註解）
- 使用 any 型別
```

### 2. API 設計規範

**統一錯誤格式**：

```typescript
// 所有 API Routes 必須使用這個格式
return Response.json(
  {
    error: string,      // 錯誤訊息（給使用者看）
    code?: string       // 錯誤代碼（選擇性，方便追蹤）
  },
  { status: number }    // HTTP 狀態碼
)

// 範例
return Response.json(
  { error: '活動已額滿', code: 'EVENT_FULL' },
  { status: 400 }
)
```

**統一成功格式**：

```typescript
// 回傳資料
return Response.json({ data: result })

// 或簡單操作
return Response.json({ success: true })
```

**權限檢查**：

```typescript
// 所有需要登入的 API 都要先檢查
import { auth } from '@/lib/auth'

const session = await auth()
if (!session) {
  return Response.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}

// 組織者專用的 API
if (session.user.role !== 'ADMIN') {
  return Response.json(
    { error: 'Forbidden' },
    { status: 403 }
  )
}
```

### 3. 檔案結構規範

```
app/
  ├── (auth)/              # 認證相關（Route Group）
  ├── (public)/            # 公開頁面
  ├── (dashboard)/         # 需登入頁面
  ├── (admin)/             # 組織者專區
  └── api/                 # API Routes

components/
  ├── ui/                  # shadcn/ui 元件（不修改）
  └── features/            # 功能元件（按模組分類）
      ├── events/
      ├── registration/
      └── leaderboard/

lib/
  ├── db/                  # 資料庫相關
  ├── auth/                # 認證相關
  ├── validations/         # Zod schemas
  └── utils/               # 通用工具

openspec/
  ├── changes/             # 開發中的 changes
  │   └── <change-name>/
  │       ├── designs/     # Pencil 設計檔案（*.pen）
  │       ├── proposal.md
  │       ├── design.md
  │       ├── spec.md
  │       ├── tasks.md
  │       └── learnings.md
  └── specs/               # 主規格
```

### 4. 命名慣例

```
檔案/資料夾         慣例                    範例
────────────────  ──────────────────    ────────────────
API Routes        kebab-case             register-event
React Components  PascalCase             EventCard.tsx
Hooks             use + PascalCase       useEventList.ts
Utils             camelCase              formatDate.ts
Constants         UPPER_SNAKE_CASE       MAX_CAPACITY
Types/Interfaces  PascalCase             User, EventData
Pencil 設計檔案   kebab-case.pen         event-list.pen
```

### 5. 資料庫規範

**Model 必備欄位**：

```prisma
model Example {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // ... 其他欄位
}
```

**關聯刪除策略**：

```prisma
// 使用 Cascade 確保資料一致性
model Registration {
  userId  String
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**索引原則**：

```prisma
// 經常查詢的欄位要加索引
model Event {
  status    EventStatus
  startTime DateTime

  @@index([status])
  @@index([startTime])
}

// unique 會自動建立索引，不需要再加 @@index
model Registration {
  userId  String
  eventId String

  @@unique([userId, eventId])  // 自動有索引
}
```

### 6. React/Next.js 規範

**Server vs Client Components**：

```tsx
// ✅ 優先使用 Server Components
// app/events/page.tsx
export default async function EventsPage() {
  const events = await prisma.event.findMany()
  return <EventList events={events} />
}

// ✅ 需要互動時才用 Client Component
// components/features/events/register-button.tsx
'use client'

export function RegisterButton() {
  const [loading, setLoading] = useState(false)
  // ...
}
```

**環境變數**：

```typescript
// 使用 @t3-oss/env-nextjs 做型別安全的環境變數
// env.ts
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
})
```

### 7. 驗證規範

**所有外部輸入都要驗證**：

```typescript
// lib/validations/event.ts
import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(5).max(100),
  startTime: z.date().refine(
    date => date > new Date(),
    { message: '開始時間必須是未來' }
  ),
})

// app/api/events/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  const result = createEventSchema.safeParse(body)

  if (!result.success) {
    return Response.json(
      { error: 'Invalid input', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // 使用驗證過的資料
  const { title, startTime } = result.data
}
```

### 8. 測試規範

**測試策略**：

```
優先級 1（必測）：
- 積分計算邏輯
- 報名 API（含 Transaction）
- Zod Validation Schemas

優先級 2（選測）：
- React 元件
- 其他 API Routes

不測：
- UI 樣式
- shadcn/ui 元件
- Prisma 查詢本身
```

**測試檔案位置**：

```
tests/
  ├── unit/
  │   ├── points.test.ts
  │   └── validations.test.ts
  └── integration/
      └── api/
          └── registration.test.ts
```

---

## 開發流程（必須遵循）

### 使用 OpenSpec + AI 協作學習 + Pencil 設計

```
1. 探索 (/opsx:explore)
   → 討論功能、理解需求

2. 規格化 (/opsx:ff <feature>)
   → 生成 proposal、design、spec、tasks

3. 審核與驗證
   → 審核規格、執行 openspec validate

4. UI/UX 設計 (Pencil)
   → 使用 Pencil + shadcn/ui 設計系統
   → 設計所有頁面和元件
   → 設計檔案放在 openspec/changes/<name>/designs/

5. 學習式實作 (/opsx:apply)
   → 使用 Learn+ 或 Review 模式
   → 參考 Pencil 設計稿
   → 一次一個 task
   → 遇到技術坑、設計決策、好問題時，即時追加到 learnings.md

6. 測試（關鍵邏輯）
   → 寫測試確保正確性

7. 驗證與封存 (/opsx:verify + /opsx:archive)
   → 確認完成、封存 change（包含設計檔案）

8. 學習記錄整理（5-10 分鐘）
   → 整理 learnings.md：把過程中的零散筆記串成有脈絡的文章
```

**詳細說明**：參考 [DEV_GUIDE.md](../DEV_GUIDE.md)

---

## UI/UX 設計規範（必須遵循）

### Pencil 使用原則

**設計優先**：
- ✅ 所有頁面和元件必須先用 Pencil 設計
- ✅ 使用 shadcn/ui 設計系統
- ✅ 設計完成後才開始實作
- ✅ 所有 UI 實作前必須先讀取 `STYLE_GUIDE.md`，遵循專案視覺風格

**設計時機**：
```
在 design.md 審核完成後 → 開始 Pencil 設計
在 /opsx:apply 實作之前 → 設計必須完成
```

**為什麼在 design.md 之後？**
- 有資料結構才知道要顯示什麼
- 有 API 定義才知道有哪些操作
- 有業務邏輯才知道狀態如何變化

### 設計檔案結構

**檔案位置**：
```
openspec/changes/<change-name>/designs/
```

**命名規範**：
```
kebab-case.pen

範例：
- event-list.pen        (活動列表頁)
- event-detail.pen      (活動詳情頁)
- register-button.pen   (報名按鈕元件)
- qr-display.pen        (QR Code 顯示)
```

**檔案組織**：
```
openspec/changes/registration-system/
├── proposal.md
├── design.md
├── spec.md
├── tasks.md
├── designs/              ← 設計檔案資料夾
│   ├── event-list.pen
│   ├── event-detail.pen
│   ├── register-button.pen
│   └── qr-display.pen
└── learnings.md
```

### 設計標準

**必須使用 shadcn/ui 設計系統**：
- ✅ 使用 shadcn/ui 提供的元件
- ✅ 遵循 shadcn/ui 的設計規範
- ✅ 確保設計可以直接轉換成 shadcn/ui 程式碼

**設計要求**：
```
必須考慮：
✅ 響應式設計（mobile, tablet, desktop）
✅ 不同狀態（loading, empty, error, success）
✅ 互動效果（hover, active, disabled）
✅ 無障礙設計（ARIA labels, keyboard navigation）
```

### 設計與實作的整合

**在 tasks.md 中引用設計檔案**：
```markdown
## Task 1: 實作活動列表頁

**設計稿**：designs/event-list.pen

**使用的 shadcn/ui 元件**：
- Card
- Badge
- Button

**實作要求**：
- 響應式 grid 布局
- 符合設計稿的間距和顏色
- ...
```

**Learn+ 模式**：
```
AI 從 Pencil 設計產生程式碼
→ 逐行解釋為什麼這樣寫
→ 你參考標準版練習
→ AI 審核並對比
```

**Review 模式**：
```
你參考 Pencil 設計稿
→ 自己實作
→ 需要時詢問細節
→ AI 審核最終結果
```

### 設計檔案的生命週期

```
1. 開發中
   openspec/changes/<name>/designs/*.pen

2. Archive 後
   整個 change 資料夾封存
   設計檔案一起保存

3. 可重用的設計 pattern
   → 提取到 MEMORY.md 作為文字描述
   → 或建立共用元件庫（未來考慮）
```

### 禁止事項

```
❌ 不使用 Pencil 直接開始寫 UI 程式碼
❌ 設計與實作不一致
❌ 使用 shadcn/ui 以外的設計系統
❌ 忽略響應式設計
❌ 設計檔案放在錯誤的位置
```

---

## 學習模式（必須遵循）

### 兩種模式

**Learn+ 模式**（不熟悉的技術）：
1. AI 解釋概念
2. AI 展示標準版 + 逐行解釋
3. AI 挖空，你填入核心邏輯
4. 對比學習，理解差異

**Review 模式**（熟悉的技術）：
1. AI 直接實作
2. 你逐行審核
3. 提問深入理解
4. 決定是否調整

**判斷標準**：
- 能獨立實作 70% 以上 → Review
- 否則 → Learn+

---

## 知識管理（必須遵循）

### 四層架構

```
CLAUDE.md（本文件）
├─ 專案憲法，永久不變的規則

MEMORY.md
├─ 可重用的 patterns
├─ 開發過程中累積

Skills（未來考慮）
├─ 重複的工作流程
├─ 可自動化的步驟

OpenSpec Specs
├─ 功能規格
├─ 每個 change 的定義
```

**何時更新哪裡？**

| 知識類型 | 放在哪裡 | 範例 |
|---------|---------|------|
| 專案級規則 | CLAUDE.md | API 錯誤格式 |
| 可重用 pattern | MEMORY.md | Prisma Transaction 寫法 |
| 功能規格 | OpenSpec Specs | 報名 API 定義 |
| 學習記錄 | learnings.md | 這個 change 學到什麼 |

**詳細說明**：參考 [DEV_GUIDE.md](../DEV_GUIDE.md#知識管理架構)

---

## Git 工作流程

### Branch 策略

```
main              生產環境（Vercel 自動部署）
  └─ develop      開發環境
      └─ feature/<name>  功能分支
```

### Commit 訊息格式

```
<type>: <subject>

<body>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Type**：
- `feat`: 新功能
- `fix`: Bug 修復
- `refactor`: 重構
- `test`: 測試
- `docs`: 文件
- `chore`: 雜項

**範例**：
```
feat: add event registration with capacity check

Implement registration system with:
- Capacity limit validation
- Duplicate registration prevention
- QR code generation for check-in

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## 安全性規範

### 必須遵守

```
✅ 所有 API input 用 Zod 驗證
✅ 所有需要登入的 API 檢查 session
✅ 敏感操作檢查權限（role）
✅ 使用 Prisma（防 SQL Injection）
✅ React 自動跳脫（防 XSS）
✅ NextAuth CSRF 保護

⚠️ 注意
- 不要在 client code 暴露敏感資訊
- 環境變數不要提交到 Git
- API Keys 用 Vercel 環境變數
```

### 不允許

```
❌ 直接拼接 SQL
❌ 在前端存 API Keys
❌ 跳過驗證（即使是 admin）
❌ 用 innerHTML（使用 dangerouslySetInnerHTML 要有理由）
```

---

## 效能規範

### 圖片優化

```tsx
// ✅ 使用 Next.js Image
import Image from 'next/image'

<Image
  src="/event-cover.jpg"
  alt="活動封面"
  width={800}
  height={400}
  priority={isAboveFold}
/>

// ❌ 不要用 <img>
```

### 資料庫查詢優化

```typescript
// ❌ N+1 問題
const events = await prisma.event.findMany()
for (const event of events) {
  const count = await prisma.registration.count({ where: { eventId: event.id } })
}

// ✅ 用 include 一次查詢
const events = await prisma.event.findMany({
  include: {
    _count: {
      select: { registrations: true }
    }
  }
})
```

---

## 程式碼品質

### ESLint + Prettier

```
必須：
- 所有程式碼通過 ESLint
- 提交前執行 Prettier
- 沒有 console.log 在 production code
```

### Code Review 檢查點

```
□ 符合本文件的規範
□ 有對應的 OpenSpec spec
□ 關鍵邏輯有測試
□ 有 learnings.md（如果是新 change）
□ 沒有 TODO 或 FIXME（除非有 issue）
□ TypeScript 沒有錯誤
□ 沒有 console.log 或 debugger
```

---

## 部署規範

### 環境變數

```bash
# .env.local（本機，不提交）
DATABASE_URL="..."
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# .env.example（提交，供參考）
DATABASE_URL="postgresql://user:pass@host:5432/db"
NEXTAUTH_SECRET="generate-with-openssl"
```

### Vercel 部署

```
main branch push → 自動部署到 production
feature/* PR    → 自動產生 preview URL
```

---

## 團隊協作

### 多人開發時

```
必須：
□ 每個 change 寫 learnings.md
□ 重要決策記錄在 design.md
□ 發現通用 pattern 更新 MEMORY.md
□ 週會分享學習（從 learnings.md）
```

### 新成員 Onboarding

```
1. 閱讀 PRODUCT_SPEC.md（理解專案）
2. 閱讀 DEV_GUIDE.md（理解開發方法）
3. 閱讀本文件（CLAUDE.md）
4. 閱讀現有的 learnings.md（學習前人經驗）
5. 從小 task 開始
```

---

## 常見問題

### Q: 什麼時候可以違反這些規範？

A: 原則上不應該違反。如果真的需要，必須：
1. 在 PR 中說明理由
2. 加上註解解釋為什麼
3. 團隊討論同意

### Q: 規範會更新嗎？

A: 會，但很少。更新時機：
- 發現規範有問題
- 技術棧重大變更
- 團隊共識調整

更新時必須：
1. 團隊討論
2. 更新本文件
3. 通知所有成員

### Q: CLAUDE.md vs MEMORY.md 的差異？

A:
- CLAUDE.md = 專案憲法（很少改）
- MEMORY.md = 活的知識庫（經常加）

---

**最後更新**：2026-02-13
**維護者**：專案組織者
