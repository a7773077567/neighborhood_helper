# 開發指南：AI 協作學習開發方法

> **目標讀者**：想要透過 AI 協作學習並開發專案的開發者
> **核心理念**：學習與開發並存，而非只是讓 AI 做完所有事
> **更新日期**：2026-02-13

---

## 目錄

1. [核心理念](#核心理念)
2. [AI 協作學習模式](#ai-協作學習模式)
3. [完整開發流程](#完整開發流程)
4. [知識管理與學習記錄](#知識管理與學習記錄)
5. [多人協作指南](#多人協作指南)
6. [實戰範例：報名系統開發](#實戰範例報名系統開發)
7. [檢查清單與 FAQ](#檢查清單與-faq)
8. [附錄](#附錄)

---

## 核心理念

### 這不是普通的 AI 編程

| | 傳統 AI 輔助開發 | 我們的方法 |
|---|---|---|
| **你說** | 「幫我寫一個報名系統」 | 「解釋報名系統的設計思路」 |
| **AI 做** | 寫了 500 行程式碼 | 解釋概念、畫圖、說明取捨 |
| **你做** | 複製貼上 | 理解後自己實作核心邏輯 |
| **結果** | 功能完成，但你什麼都沒學到 | 功能完成，而且你學會了 |

### 三個核心原則

**1. AI 是導師，不是代筆**

| 錯誤心態 | 正確心態 |
|---|---|
| 「幫我做」 | 「教我怎麼做」 |
| 「給我程式碼」 | 「解釋為什麼這樣設計」 |
| 「我只要結果」 | 「我要理解過程」 |

**2. 學習優先於速度**

| | 快但不懂 | 慢但扎實 |
|---|---|---|
| **時間** | 2 週完成 | 4 週完成 |
| **分工** | AI 寫 90% | 你寫 60%、AI 寫 40% |
| **3 個月後** | 還是不會 | 可以獨立開發 |

**3. 主動探索而非被動接受**

| 被動學習者 | 主動學習者 |
|---|---|
| 等 AI 給答案 | 問「為什麼」 |
| 接受第一個方案 | 思考其他可能性 |
| 遇到錯誤就卡住 | 把錯誤當學習機會 |

---

## AI 協作學習模式

根據你對技術的熟悉程度，選擇不同的協作模式。

### 如何選擇模式？

問自己：**「如果現在關掉 AI，我能獨立實作這個功能的 70% 以上嗎？」**

- **不行** → [Learn+ 模式](#模式-alearn學習--練習模式)（從概念理解開始，學習效果最好）
- **可以** → [Review 模式](#模式-breview審核模式)（AI 直接實作，你審核並提問，開發速度最快）

| 能力程度 | 建議模式 | 時間倍率 | 學習效果 |
|---|---|---|---|
| 完全不懂 | Learn+ | 1.5x | ★★★ |
| 看過但不會寫 | Learn+ | 1.5x | ★★★ |
| 能寫出 50-60% | Learn+ | 1.5x | ★★☆ |
| 能寫出 70-80% | Review | 0.5x | ★★☆ |
| 很熟練，只是想加速 | Review | 0.3x | ★☆☆ |

> **提醒**：不要高估自己的熟悉度，寧可用 Learn+。同一個 task 可以混用——熟悉的部分用 Review，不熟的用 Learn+。隨時可以切換模式。

---

### 模式 A：Learn+（學習 + 練習模式）

**適用時機**：不熟悉或半熟悉的技術（無法獨立實作 70% 以上）

**核心理念**：先看到正確的寫法 → 動手練習 → 對比學習

#### 四個階段

**階段 1：Explain（理解概念）**

請 AI 解釋核心概念，持續提問直到理解。

> **你**：「Explain how Prisma transactions work and why we need them for the registration system. Walk me through step by step.」
>
> **AI**：解釋 Transaction 的概念、為什麼需要（原子性、一致性）、使用時機、常見陷阱。
>
> **你**：持續提問直到理解。

**階段 2：Show & Explain（展示標準版）**

請 AI 展示業界標準寫法，逐行解釋。

> **你**：「Show me the standard pattern and explain line by line.」

```typescript
await prisma.$transaction(async (tx) => {
  // 為什麼用 async (tx)：Transaction 回呼需要非同步
  // 為什麼用 tx 不是 prisma：確保所有操作在同一個 transaction 內
  const count = await tx.registration.count({ where: { eventId } })
  if (count >= capacity) throw new Error('Full')
  return tx.registration.create({ data: { ... } })
})
```

**階段 3：Guided Practice（挖空填空）**

AI 把核心邏輯挖空，你參考剛才的解釋填入。

```typescript
await prisma.$transaction(async (tx) => {
  // TODO: 查詢當前報名數
  // TODO: 檢查容量
  // TODO: 建立報名記錄
});
```

**階段 4：Compare & Reflect（對比學習）**

> **你**：「Review my implementation.」
>
> **AI**：對比你的版本和標準版——寫對的部分、可以改進的地方、為什麼標準版更好。

---

### 模式 B：Review（審核模式）

**適用時機**：你已經能獨立實作這個功能的 70% 以上

**核心理念**：讓 AI 產出標準實作，你透過審核和提問來確保品質

#### 五個步驟

1. **你提出需求**：描述要實作的功能
2. **AI 寫完整程式碼**：提供完整實作
3. **你逐行審核**：仔細閱讀每一行，理解設計決策，找出不合理的地方
4. **你提問深入理解**：針對不確定的部分提問
5. **你決定是否修改**：不滿意就要求調整，OK 就接受

#### 範例對話

> **你**：「Implement the leaderboard component with monthly and total rankings.」
>
> **AI**：*（提供完整實作）*
>
> **你**：「I see you're fetching leaderboard data on every render. Won't this cause performance issues?」
>
> **AI**：「Good catch! Let me add useSWR for caching and revalidation.」
>
> **你**：「Why useSWR instead of React Query?」
>
> **AI**：「In this case, useSWR is simpler — less bundle size, fits well with Next.js, built-in revalidation. But React Query would also work.」

---

## 完整開發流程

基於 OpenSpec 的 7 階段工作流程，整合 UI/UX 設計與 AI 協作學習。

### 流程總覽

```
階段 1: 探索與理解 (/opsx:explore)
  ↓
階段 2: 規格化 (/opsx:ff <feature>)
  ↓
階段 3: 規格審核與調整
  ↓
階段 4: 格式驗證 (openspec validate)
  ↓
階段 5: UI/UX 設計 (Pencil)
  ↓
階段 6: 學習式實作 (/opsx:apply)
  ↓
階段 7: 驗證與封存 (/opsx:verify + /opsx:archive)
  ↓
寫學習筆記 (5 分鐘) → 下一個功能
```

---

### 階段 1 - 探索與理解

**目標**：在寫任何程式碼前，先理解「為什麼」和「怎麼做」

**指令**：`/opsx:explore`

**你做什麼**：
1. 描述你想做的功能
2. 說出你目前的理解
3. 提出你的疑問和不確定的地方

**AI 做什麼**：
- 畫圖解釋概念、提出不同的設計選項
- 討論優缺點和取捨、挑戰你的假設

**完成檢查**：
- [ ] 我能向別人解釋這個功能的設計嗎？
- [ ] 我知道會用到哪些技術嗎？
- [ ] 我理解為什麼這樣設計嗎？

---

### 階段 2 - 規格化

**目標**：將討論的內容轉化成結構化的規格文件

**指令**：`/opsx:ff <feature-name>`

AI 自動生成以下文件在 `openspec/changes/<feature-name>/`：

| 文件 | 內容 |
|---|---|
| **proposal.md** | 做什麼、為什麼、預期成果 |
| **design.md** | 設計決策、技術選擇、架構圖 |
| **spec.md** | 詳細規格、API 介面、資料結構、邊界條件 |
| **tasks.md** | 任務分解、實作順序、預估難度 |

---

### 階段 3 - 規格審核與調整

**目標**：確保生成的規格符合需求，沒有遺漏或錯誤

**流程**：

1. **閱讀所有生成的文件**：逐一打開 proposal、design、spec、tasks
2. **檢查內容**：這些是我想要的功能嗎？有遺漏嗎？設計合理嗎？任務拆分夠細嗎？
3. **提出修改意見**，AI 調整
4. **重複直到滿意**

**審核清單**：

**proposal.md**
- [ ] 目標明確
- [ ] 範圍清楚（做什麼、不做什麼）
- [ ] 與整體專案目標一致

**design.md**
- [ ] 設計決策有說明理由
- [ ] 考慮了不同選項
- [ ] 架構圖清楚

**spec.md**
- [ ] 功能描述完整
- [ ] API 介面定義清楚
- [ ] 考慮了 edge cases
- [ ] 錯誤處理有定義

**tasks.md**
- [ ] 任務拆分合理（不太大不太小）
- [ ] 有清楚的順序
- [ ] 每個 task 目標明確

---

### 階段 4 - 格式驗證

**目標**：確保規格文件符合 OpenSpec 標準格式

```bash
openspec validate registration-system
```

系統檢查：必要欄位、格式、Scenarios、規範術語（SHALL/MUST）

- **驗證通過** → 進入階段 5
- **驗證失敗** → 回到階段 3 修正，重新驗證

---

### 階段 5 - UI/UX 設計（使用 Pencil）

**目標**：根據 design.md 的定義，設計所有頁面和元件的 UI/UX

**時機**：規格驗證通過後、實作之前

**為什麼在這個階段？** 有了 design.md 才知道要顯示哪些資料、有哪些操作、狀態如何變化，才能設計出正確的表單欄位、合理的互動流程、需要的狀態提示。

**設計工具**：Pencil + shadcn/ui 設計系統

#### 設計流程

1. **列出需要設計的頁面/元件**：根據 spec.md 和 tasks.md 列出所有需要設計的項目
2. **使用 Pencil 設計**：描述頁面需求，AI 使用 Pencil + shadcn/ui 產出設計
3. **審核設計稿**：用截圖檢查資訊完整性、布局合理性、響應式設計
4. **儲存設計檔案**：放在 `openspec/changes/<change-name>/designs/`
5. **更新 tasks.md**：在相關 task 加入設計檔案參考

#### 範例對話

> **你**：「Let's design the event detail page. According to design.md, it should display event header, description, organizer info, and registration section. Use shadcn/ui components.」
>
> **AI**：*（建立 Pencil 設計，顯示截圖）*
>
> **你**：「Can you make the registration card more prominent? Maybe add a subtle shadow?」
>
> **AI**：*（調整設計，顯示新版本）*

**完成檢查**：
- [ ] 所有頁面都有設計稿
- [ ] 設計符合 shadcn/ui 風格
- [ ] 響應式設計考慮了（mobile, tablet, desktop）
- [ ] tasks.md 已加入設計檔案參考

---

### 階段 6 - 學習式實作

**目標**：用選定的學習模式（[Learn+ 或 Review](#ai-協作學習模式)），一次完成一個 task

**指令**：`/opsx:apply`

#### 實作循環

1. **選擇 task**（從 tasks.md，依序從簡單到困難）
2. **判斷熟悉度 → 選擇模式**（參考 [AI 協作學習模式](#ai-協作學習模式)）
3. **執行選定的模式**
4. **完成後測試**：手動測試、確認符合 Definition of Done
5. **標記 task 完成**
6. **重複 1-5 直到所有 tasks 完成**

#### 搭配 Pencil 設計稿

在實作 UI 相關的 task 時，參考 `designs/` 資料夾中的 `.pen` 設計稿：

- **Learn+ 模式**：AI 從 Pencil 設計產生程式碼 → 逐行解釋 → 你參考標準版練習 → AI 審核對比
- **Review 模式**：你參考 Pencil 設計稿自己實作 → 需要時詢問細節 → AI 審核結果

---

### 階段 7 - 驗證、封存與學習記錄

**目標**：確認實作完成，封存 change，記錄學習

#### 驗證與封存

```bash
/opsx:verify   # AI 檢查：所有 tasks 完成？實作符合 spec？有遺漏嗎？
/opsx:archive  # 封存 change，更新 main specs
```

1. 執行 `/opsx:verify`
2. 手動測試功能（正常運作、沒有明顯 bug、UX 流程順暢）
3. 驗證通過 → 執行 `/opsx:archive`；未通過 → 回到階段 6 補完

#### 學習記錄（5-10 分鐘）

每個 change 完成後，花 5-10 分鐘記錄學習。

**流程**：

1. 問 AI：「總結我在這個 change 學到的關鍵概念（3-5 個 bullet points）」
2. AI 生成初稿
3. 你審核並補充
4. 存到 `openspec/changes/<change-name>/learnings.md`
5. 如果有通用 pattern → 更新 MEMORY.md（見 [知識管理](#知識管理與學習記錄)）

**learnings.md 範本**：

```markdown
# Learnings: <功能名稱>

**作者**：[你的名字]
**日期**：[完成日期]

## 新學到的概念
- [2-3 個關鍵技術或模式]

## 遇到的問題與解法

### 問題 1：[簡短描述]
**情境**：[什麼情況下發生]
**解法**：[怎麼解決]

## 下次可以改進
- [1-2 個改進點]
```

**什麼要記、什麼不記？**

| 要記錄 | 不用記錄 |
|---|---|
| 新技術的核心概念 | 細節的語法（查文件就好） |
| 設計決策的理由 | 流水帳式的步驟 |
| 遇到的坑和解法 | 顯而易見的內容 |
| 下次可以改進的 | 臨時的 workaround |

---

## 知識管理與學習記錄

### 四層知識架構

每層有明確的職責，避免重複記錄。

| 層次 | 定位 | 內容範例 | 更新頻率 |
|---|---|---|---|
| **CLAUDE.md** | 專案憲法 | 技術棧、API 規範、檔案結構、命名慣例 | 幾乎不更新 |
| **MEMORY.md** | 可重用 Patterns | Prisma Transaction 寫法、API Route 結構、Zod 整合 | Pattern 出現 3 次後加入 |
| **Skills** | 自動化工作流 | 建立 API Route 腳本、CRUD 模板（MVP 暫不建立） | 操作重複 5 次後建立 |
| **OpenSpec Specs** | 功能規格 | API endpoints、資料結構、業務邏輯、驗證規則 | 每個 change 都有 |

另外每個 change 完成後會有 **learnings.md**，屬於個人學習心得。

### 同一個知識的不同層次

以「Prisma Transaction」為例：

| 層次 | 放什麼 |
|---|---|
| **CLAUDE.md** | 「查詢 + 條件檢查 + 建立/更新 必須用 Transaction」（規則） |
| **MEMORY.md** | `await prisma.$transaction(async (tx) => { ... })`（標準寫法） |
| **OpenSpec Spec** | 「報名 API 使用 Transaction 檢查容量」（特定功能） |
| **learnings.md** | 「我第一次用 Transaction，理解了原子性的重要」（個人心得） |

### 決策流程：知識應該放哪裡？

遇到一個新的知識點時，依序判斷：

1. **是專案級的規則嗎？**（例：API 錯誤格式、檔案結構）→ **CLAUDE.md**
2. **是可重用的 pattern 嗎？且出現 3 次以上？** → **MEMORY.md**
3. **是重複的操作嗎？且重複 5 次以上？** → **Skill**（未來考慮）
4. **是功能規格嗎？**（例：報名 API 定義）→ **OpenSpec Spec**
5. **以上都不是** → **learnings.md**（個人學習心得）

### MEMORY.md 維護原則

MEMORY.md 是專案的核心知識庫，會被載入 AI 的 system prompt，影響所有未來的對話。

**什麼要放進去？**
- 會重複使用的 patterns 和常見問題的標準解法
- 不放特定功能的細節（那些放 learnings.md）

**何時更新？**
- 在第 3 個 change 遇到相同 pattern 時
- 團隊成員重複問同樣問題時
- 發現通用解決方案時

---

## 多人協作指南

雖然這個專案可能從個人開始，但之後可能有其他人加入。learnings.md 在協作中特別有價值——新成員可以直接閱讀來理解設計決策和常見陷阱，而不需要反覆口頭詢問。

### 團隊約定

**學習模式原則**：
- 新技術：優先用 Learn+ 模式
- 熟悉技術：用 Review 模式
- 不確定時：選擇 Learn+（較慢但紮實）

**Code Review 檢查點**：
- [ ] 有對應的 learnings.md
- [ ] 關鍵決策有記錄理由
- [ ] 遇到的坑有記錄解法

### 定期知識分享

建議每週 30 分鐘週會：

1. **每人分享**（10 分鐘）：完成的 change、learnings.md 重點、有趣的問題
2. **討論**（15 分鐘）：改進空間、通用 pattern、是否更新 MEMORY.md
3. **下週規劃**（5 分鐘）：分工、預期挑戰

### MEMORY.md 維護分工

- **個人負責**：自己的 learnings.md
- **團隊共同負責**：MEMORY.md，在週會討論後更新
- **原則**：一個 pattern 被 3 人用過 或 一個問題被問 3 次 → 加入 MEMORY.md

---

## 實戰範例：報名系統開發

以「報名系統」為例，展示完整流程。

**功能需求**：使用者報名活動、檢查容量限制、防止重複報名、生成 QR Code

**技術背景**：會 TypeScript/React，不熟 Next.js API Routes、Prisma、QR Code

### 時間線

| 時間 | 階段 | 做什麼 | 模式 |
|---|---|---|---|
| **Day 1 上午** | 階段 1：探索 | `/opsx:explore`，討論報名流程、Transaction、QR Code 設計 | — |
| **Day 1 下午** | 階段 2-4：規格 | `/opsx:ff registration-system`，審核文件，驗證格式 | — |
| **Day 2** | 階段 5：設計 | 用 Pencil 設計活動列表、詳情頁、報名按鈕、QR 顯示 | — |
| **Day 2-3** | 階段 6：實作 | Task 1: Prisma Schema | Learn+（不熟 relation） |
| | | Task 2a: 基本 API Route | Learn+（不懂 API Routes） |
| | | Task 2b: Transaction 邏輯 | Learn+（不熟 Transaction） |
| | | Task 2c: QR Code 生成 | Review（較簡單） |
| | | Task 3: 前端 Button | Review（熟悉 React） |
| **Day 4** | 階段 7：收尾 | 手動測試、`/opsx:verify`、`/opsx:archive`、寫 learnings.md | — |

### 成果

- **程式碼**：功能完整運作、有測試、品質好
- **學習**：理解 Next.js API Routes、Prisma Transaction、race condition 處理、QR Code 安全性
- **文件**：proposal、design、spec、tasks、learnings.md
- **時間**：約 12 小時（純讓 AI 寫可能 2 小時，但你學到的無價）

---

## 檢查清單與 FAQ

### 每個階段的檢查清單

#### 階段 1：探索

- [ ] 我清楚這個功能要解決什麼問題
- [ ] 我有列出我的疑問
- [ ] 我能向別人解釋這個設計
- [ ] 我知道會用到哪些技術

#### 階段 2-4：規格化與驗證

- [ ] proposal / design / spec / tasks 都已生成
- [ ] 我逐一閱讀並提出修改意見
- [ ] AI 已調整完成，我滿意當前規格
- [ ] `openspec validate` 通過

#### 階段 5：UI/UX 設計

- [ ] 所有頁面都有 Pencil 設計稿
- [ ] 設計符合 shadcn/ui 風格
- [ ] 考慮了響應式和不同狀態
- [ ] tasks.md 已加入設計檔案參考

#### 階段 6：實作

每個 task：
- [ ] 選擇了合適的學習模式
- [ ] 完成實作並測試
- [ ] 我理解我寫的程式碼
- [ ] 標記 task 為完成

#### 階段 7：驗證與封存

- [ ] 所有 tasks 都完成
- [ ] 功能手動測試通過
- [ ] 執行了 `/opsx:verify` 和 `/opsx:archive`
- [ ] 寫了 learnings.md

---

### FAQ

#### Q1: 如果我高估了自己的能力，選錯模式怎麼辦？

隨時可以切換。選了 Review 但看不懂？暫停，改用 Learn+ 先理解概念。選了 Learn+ 但發現很熟？跳過 Explain 階段，直接看標準版。

#### Q2: 每個 task 都要寫 learnings.md 嗎？

不用。只在完成**整個 change** 後寫一次，總結所有 tasks 的學習。

#### Q3: learnings.md 要寫多詳細？

3-5 個 bullet points 就夠。重點式，不是流水帳。

> **好的記錄**：「用 Prisma Transaction 避免報名競爭條件，查詢和建立要在同一個 transaction 內」
>
> **不好的記錄**：「先 import prisma，然後 await prisma.$transaction...」（實作細節，看程式碼就知道）
>
> **不好的記錄**：「今天花了 2 小時做報名功能」（流水帳，沒有學習價值）

#### Q4: 學習 vs 開發的時間分配？

| 階段 | 學習 | 開發 |
|---|---|---|
| Week 1-2（新手期） | 70% | 30% |
| Week 3-4（熟練期） | 30% | 70% |
| 之後（專家期） | 10% | 90% |

#### Q5: 如何避免過度依賴 AI？

每週花 30 分鐘做「不插電練習」——挑一個你「以為」已經學會的概念，關掉 AI，在白紙上寫出來或實作。寫不出來？那就還沒真的學會，回去用 Learn+ 重新學。

#### Q6: 團隊成員不想寫 learnings.md 怎麼辦？

展示價值，不要強迫。你先寫 2-3 個高品質的範例，等別人遇到問題時引導他們看 learnings.md，他們會自然發現有用。

---

## 附錄

### 有用的 Prompt 範例

**探索階段**：

> - 「Explain [concept] like I'm familiar with [related concept] but new to this specific implementation.」
> - 「What are the tradeoffs between [option A] and [option B] for [specific use case]?」
> - 「Walk me through the flow of [process] step by step, and explain why each step is necessary.」

**學習階段**：

> - 「Explain [concept] with a simple analogy first, then show me a real-world code example.」
> - 「What are the common mistakes people make when using [technology]?」
> - 「Compare [approach A] vs [approach B]. When should I use each?」

**實作階段**：

> - 「Review my implementation and check: 1) logic correct? 2) edge cases? 3) performance? 4) security?」
> - 「This code works, but is there a more idiomatic way to write it in [framework/library]?」

### 推薦學習資源

- [Next.js 官方文件](https://nextjs.org/docs)
- [Prisma 官方文件](https://www.prisma.io/docs)
- [TypeScript 手冊](https://www.typescriptlang.org/docs)
- [shadcn/ui 文件](https://ui.shadcn.com/)

### OpenSpec 指令速查

```bash
/opsx:explore                       # 探索
/opsx:ff <feature-name>             # 建立 change（快速模式）
/opsx:apply                         # 實作
/opsx:verify                        # 驗證
/opsx:archive                       # 封存
openspec validate <change-name>     # 驗證格式
openspec list                       # 列出所有 changes
```
