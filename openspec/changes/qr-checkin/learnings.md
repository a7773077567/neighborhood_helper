# QR Checkin — 學習記錄

> 這個 change 涵蓋 QR Code 簽到功能的完整實作：資料庫變更、Server Action、QR 顯示/掃描元件、簽到頁面、Admin 後台整合。

---

## 1. React Hooks 核心概念

### useRef — 跨 render 保留值，不觸發 re-render

- `useRef` 的值在 re-render 之間保持不變，修改 `.current` 不會觸發 re-render
- **常見用途**：
  - 存 DOM 元素（`ref={divRef}`）
  - 存「最新的 callback」讓一次性綁定的外部程式碼能拿到新版本
  - 存防抖用的 timestamp（`lastScanRef`）

### useCallback — 穩定函式引用

- 每次 re-render 都會重新建立函式。`useCallback` 只在依賴改變時才產生新函式
- **主要目的**：防止傳給子元件的 callback 每次都是新 reference，導致子元件不必要的 re-render（需搭配 `React.memo`）或 `useEffect` 不必要地重跑
- **注意**：單獨使用 `useCallback` 不能阻止子元件 re-render，子元件必須用 `React.memo` 包裝才有效

### useMemo — 快取計算結果

- 類似 Vue 的 `computed`，依賴不變就不重算
- **與 Vue computed 的差異**：Vue computed 有獨立的響應式追蹤，可以主動觸發；React 的 `useMemo` 只在元件 re-render 時才檢查依賴是否改變
- 如果元件沒有 re-render，即使依賴值在外部改變了，`useMemo` 也不會重算

### useEffect — 副作用管理

- **執行時機**：只在瀏覽器端執行（SSR 時跳過），mount 後和依賴改變後執行
- **cleanup 函式**：在依賴改變前、或 unmount 時執行。即使 unmount 了，cleanup 仍然重要——因為 async 操作不會因為 unmount 而停止
- **空依賴 `[]`**：只在 mount 時執行一次，cleanup 只在 unmount 時執行

### useTransition — 非阻塞的狀態更新

- 用於 Server Action 呼叫，`isPending` 在整個流程（Action 執行 + re-render）期間為 `true`
- 不會阻塞 UI，使用者可以繼續操作

---

## 2. 封裝命令式（Imperative）外部套件的模式

### 問題

html5-qrcode 是命令式 API（手動呼叫 `start()`/`stop()`），React 是宣告式（declarative）。兩者思維完全不同。

### 解法：useEffect 作為橋樑

```tsx
useEffect(() => {
  let scanner: Html5Qrcode | null = null
  let stopped = false

  async function start() {
    const { Html5Qrcode } = await import('html5-qrcode')
    if (stopped) return  // 防止 race condition
    scanner = new Html5Qrcode(elementId)
    await scanner.start(...)
  }

  start()

  return () => {
    stopped = true
    scanner?.stop().then(() => scanner!.clear())
  }
}, [])
```

**關鍵模式**：
- **Dynamic import in useEffect**：即使是 `'use client'` 元件，首次載入時 Next.js 仍會在伺服器端執行 render。`useEffect` 只在瀏覽器執行，所以把瀏覽器限定的套件放在 `useEffect` 內 dynamic import
- **`stopped` 閉包變數**：防止 race condition。`import()` 是 async 的，如果 unmount 發生在 import 完成前，`stopped` 會是 `true`，阻止後續的 `scanner.start()`
- **useRef 存最新 callback**：scanner 啟動時綁定一次 callback，之後不會重新綁定。用 `onScanRef.current` 間接呼叫，確保永遠拿到最新的 `onScan` prop

### 為什麼不用 Easy Mode

html5-qrcode 的 Easy Mode（`Html5QrcodeScanner`）會自己注入 UI，無法控制樣式。Advanced Mode（`Html5Qrcode`）只負責相機和解碼，UI 完全由我們控制，符合 neobrutalism 設計需求。

---

## 3. React 的 Re-render 機制

### 三種觸發 re-render 的原因

1. **State 改變**（`useState`, `useReducer`）
2. **Props 改變**（父元件傳入新值）
3. **Context 改變**（`useContext` 訂閱的 context 更新）

### 關鍵認知

- 父元件 re-render 時，**所有子元件都會 re-render**，不管 props 有沒有變。除非子元件用 `React.memo` 包裝
- `React.memo`：淺比較 props，props 沒變就跳過整個元件的 re-render
- `useMemo`：在元件內部快取一個計算結果，不是跳過元件 re-render
- 兩者常搭配使用：`useCallback` 穩定 callback reference → `React.memo` 子元件看到 props 沒變 → 跳過 re-render

### revalidatePath vs 路由變化

- `revalidatePath`：Server Component 重新查詢 + re-render，但 Client Component **保留 state**（是 re-render 不是 remount）
- URL `[id]` 改變：整個頁面 remount，所有 state 重置

---

## 4. React vs Vue 的差異

### Emit vs Callback Props

- Vue 用 `emit('scan', data)` 讓子元件通知父元件
- React 沒有 emit，用 callback props：父元件傳 `onScan={handleScan}`，子元件呼叫 `onScan(data)`
- 本質一樣，只是語法不同

### 狀態管理

- Vue 有 Pinia（集中式 store），React 有 Redux / Zustand
- **但 Next.js App Router 大幅減少了對狀態管理的需求**：Server Component 直接查 DB，`revalidatePath` 自動重新 fetch，不需要前端 store 存 API 資料
- 我們這個專案不需要 Redux / Zustand / TanStack Query，因為 Server Component + Server Action + revalidatePath 已經覆蓋了所有資料流

---

## 5. TypeScript 技巧

### Inline Import Type

```typescript
let scanner: import('html5-qrcode').Html5Qrcode | null = null
```

- `import('module').Type` 只在編譯時讀取型別，不會產生 runtime import
- 適合在不想 top-level import 整個模組時使用（例如瀏覽器限定的套件）

### 自訂 Props Type vs 套件匯出

- `QrScannerProps` 定義在元件檔案內，而非從 html5-qrcode 匯入
- 原因：我們的 React 元件 props 是自己的介面（只需要 `onScan` callback），跟底層套件的設定型別無關。這是良好的封裝

---

## 6. Server Action 設計

### 統一回傳格式

```typescript
type CheckinResult =
  | { success: true; attendee: { name: string } }
  | { success: false; error: string; code: string }
```

- 用 discriminated union 讓 TypeScript 能根據 `success` 自動 narrow 型別
- 每個錯誤情況都有 `code`，方便前端做不同的 toast 處理（`ALREADY_CHECKED_IN` → warning，其他 → error）

### revalidatePath 的資料流

```
使用者操作 → startTransition → Server Action（DB 更新 + revalidatePath）
→ Server Component 重新查詢 → 新 props 傳入 Client Component → re-render
```

- Client Component 不需要手動維護 registrations 的 local state
- `isPending` 會在整個流程（Action + re-render）期間為 `true`

---

## 7. 設計決策

### 掃描器防抖放在 CheckinClient 而非 QrScanner

- QrScanner 是純粹的掃描元件，職責是「掃到東西就通知」
- 防抖是業務邏輯（「同一張 QR 3 秒內不重複簽到」），屬於使用端的決策
- 這樣 QrScanner 可以被其他場景複用，不會被特定的防抖邏輯綁死

### FAB 取代矩形按鈕

- 原始設計用矩形「開啟掃描器 / 關閉掃描器」按鈕，佔用頁面空間
- 改為 FAB（浮動圓形按鈕），固定在右下角，不佔用內容空間
- 掃描器開啟時顯示 CameraOff icon，關閉時顯示 ScanLine icon
- 白底 + 橘色 icon + 黑邊框 + 實心陰影，符合 neobrutalism 風格

### Admin 後台按鈕配置

- PUBLISHED 活動：簽到 + 編輯 + 結束（簽到頁已有完整名單，不需要獨立「名單」按鈕）
- DRAFT 活動：名單 + 編輯 + 發布
- ENDED/CANCELLED 活動：只有名單

---

## 8. 過程中遇到的坑

### html5-qrcode SSR 報錯

- 症狀：`ReferenceError: navigator is not defined`
- 原因：`'use client'` 不代表「只在瀏覽器執行」，Next.js 首次載入時仍會在伺服器端 render Client Component
- 解法：在 `useEffect` 內 dynamic import，確保只在瀏覽器環境載入

### useEffect cleanup 的必要性

- 即使元件 unmount，正在執行的 async 操作（如 `import()`）不會自動停止
- 需要 `stopped` flag 讓 async callback 知道「已經不需要繼續了」
- 相機資源必須手動 `stop()` + `clear()`，否則相機會持續運作
