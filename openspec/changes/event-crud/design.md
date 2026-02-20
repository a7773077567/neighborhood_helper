## Context

Neighborhood Helper 目前有完整的認證系統（Google OAuth + 路由保護）和 App Shell（Header、Footer、Landing Page），但核心功能——活動管理——尚未實作。現有的 `/events` 和 `/admin` 頁面都是空白佔位頁。

Prisma schema 目前只有 User、Account、Session、VerificationToken（認證相關）。PRODUCT_SPEC 定義了完整的 Event 資料結構，本次 change 將實作第一個業務 model。

## Goals / Non-Goals

**Goals:**
- 建立 Event model，支援完整的活動生命週期（DRAFT → PUBLISHED → ENDED / CANCELLED）
- 組織者可以建立、編輯活動（含表單驗證）
- 參加者可以瀏覽活動列表（Tab 篩選：即將舉辦 / 已結束）和詳情
- 活動詳情頁預留報名按鈕位置（為 Change 2 準備）

**Non-Goals:**
- 報名 / 取消報名功能（Change 2: registration-system）
- QR Code 簽到、積分發放（Change 3: checkin-and-points）
- 講者申請系統（後續 change）
- 活動封面圖片上傳（未來考慮）
- 活動刪除（用 CANCELLED 狀態取代硬刪除）

## Decisions

### 1. Event Schema 設計

```prisma
enum EventStatus {
  DRAFT
  PUBLISHED
  ENDED
  CANCELLED
}

model Event {
  id              String      @id @default(cuid())
  title           String
  description     String
  startTime       DateTime
  endTime         DateTime
  location        String
  capacity        Int
  status          EventStatus @default(DRAFT)
  seekingSpeaker  Boolean     @default(false)
  organizerId     String
  organizer       User        @relation(fields: [organizerId], references: [id])
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([status])
  @@index([startTime])
}
```

**為什麼這樣設計？**
- `status` 使用 enum 而非 boolean，支援完整的生命週期管理
- `seekingSpeaker` 現在就加，避免後續講者系統還要跑 migration
- `organizerId` 連結 User，未來可查詢「某組織者建立的所有活動」
- `capacity` 為 Int，供報名系統做容量限制檢查
- 加 `status` 和 `startTime` 索引，列表頁查詢頻繁

### 2. API 路由設計

| 方法 | 路徑 | 權限 | 用途 |
|------|------|------|------|
| GET | `/api/events` | Public | 活動列表（只回傳 PUBLISHED，支援 filter） |
| GET | `/api/events/[id]` | Public | 活動詳情 |
| POST | `/api/events` | Admin | 建立活動 |
| PUT | `/api/events/[id]` | Admin | 編輯活動 |

**不用 API route，改用 Server Component 直接查詢？**
- 公開列表頁和詳情頁：用 Server Component 直接 `prisma.event.findMany()` — 不需要 API
- 組織者建立/編輯：用 Server Actions — 不需要 API route
- 這是 Next.js App Router 的慣用做法，減少不必要的 API 層

**決策：列表頁和詳情頁用 Server Component 直接查 DB，表單用 Server Actions。不建立 REST API routes。**

如果未來需要對外提供 API（如第三方整合），再另外建立。

### 3. 表單實作方案

使用 `react-hook-form` + `@hookform/resolvers` + `zod` 組合：
- Zod schema 定義在 `lib/validations/event.ts`，前後端共用
- Server Action 用 `safeParse` 驗證
- Client Component 用 `zodResolver` 做即時驗證
- 需要安裝 `react-hook-form` 和 `@hookform/resolvers`（目前未安裝）

**為什麼不用 Next.js 原生的 `useActionState`？**
- react-hook-form 提供更完善的表單管理（field-level validation、dirty tracking）
- CLAUDE.md 已經指定使用 react-hook-form
- Zod resolver 讓前後端驗證規則一致

### 4. 頁面結構

```
app/(public)/events/
  ├── page.tsx              # 活動列表（Server Component）
  └── [id]/
      └── page.tsx          # 活動詳情（Server Component）

app/(admin)/admin/events/
  ├── page.tsx              # 活動管理列表（Server Component）
  ├── new/
  │   └── page.tsx          # 建立活動（Client + Server Action）
  └── [id]/
      └── edit/
          └── page.tsx      # 編輯活動（Client + Server Action）
```

### 5. Admin 權限保護

現有 `middleware.ts` 已保護 `/admin/*` 路由（需要登入），但不檢查 role。

**方案：在 `(admin)/layout.tsx` 加上 role 檢查**
- 用 `auth()` 讀取 session，檢查 `user.role === 'ADMIN'`
- 非 ADMIN 導向首頁或顯示 403
- 這符合現有架構（middleware 做 cookie 檢查，layout 做 role 檢查）

### 6. 活動列表篩選邏輯

「即將舉辦」和「已結束」的判斷：
- **即將舉辦**：`status === 'PUBLISHED' AND endTime > now()`，依 `startTime` 升序
- **已結束**：`status === 'ENDED' OR (status === 'PUBLISHED' AND endTime <= now())`，依 `startTime` 降序
- 使用 URL search params（`?tab=upcoming` / `?tab=past`）管理 Tab 狀態，支援分享連結
- 預設顯示「即將舉辦」

## Risks / Trade-offs

- **[不建立 REST API]** → 未來若需要開放 API，要額外新增 route handlers。但目前 MVP 只有 web 前端，Server Component + Server Actions 更簡潔
- **[seekingSpeaker 欄位先加]** → 講者系統尚未設計，欄位可能需要調整。但一個 boolean 的變更成本很低
- **[不做活動刪除]** → 組織者無法刪除已建立的活動，只能取消。這是有意的設計決策，保留資料完整性
- **[Admin role 在 layout 檢查]** → 每次進入 admin 頁面都會查一次 DB。但 admin 用戶極少（3 人），效能影響可忽略
