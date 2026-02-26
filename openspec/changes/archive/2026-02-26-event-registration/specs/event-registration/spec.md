## ADDED Requirements

### Requirement: 使用者可以報名活動

系統 SHALL 允許已登入的使用者報名 PUBLISHED 狀態且尚未額滿的活動。報名 SHALL 使用 Prisma Transaction 確保容量檢查的原子性。

#### Scenario: 成功報名活動

- **WHEN** 已登入使用者對一個 PUBLISHED 且尚有名額的活動發送報名請求
- **THEN** 系統建立一筆 Registration 記錄（status 為 CONFIRMED），回傳成功訊息，活動的報名人數加 1

#### Scenario: 未登入使用者嘗試報名

- **WHEN** 未登入使用者嘗試報名活動
- **THEN** 系統回傳 401 Unauthorized

#### Scenario: 活動已額滿

- **WHEN** 已登入使用者嘗試報名一個已達容量上限的活動
- **THEN** 系統回傳錯誤訊息「活動已額滿」（code: EVENT_FULL），不建立 Registration 記錄

#### Scenario: 重複報名

- **WHEN** 已登入使用者嘗試報名一個已有 CONFIRMED 報名記錄的活動
- **THEN** 系統回傳錯誤訊息「您已報名此活動」（code: ALREADY_REGISTERED）

#### Scenario: 報名非 PUBLISHED 狀態的活動

- **WHEN** 使用者嘗試報名 DRAFT、ENDED 或 CANCELLED 狀態的活動
- **THEN** 系統回傳錯誤訊息「此活動目前無法報名」（code: EVENT_NOT_AVAILABLE）

### Requirement: 使用者可以取消報名

系統 SHALL 允許已報名的使用者在活動開始前取消報名。取消報名 SHALL 將 Registration 的 status 更新為 CANCELLED（soft delete）。

#### Scenario: 成功取消報名

- **WHEN** 已報名使用者在活動開始時間之前發送取消請求
- **THEN** 系統將該 Registration 的 status 更新為 CANCELLED，活動的報名人數減 1

#### Scenario: 活動已開始後取消

- **WHEN** 已報名使用者在活動開始時間之後嘗試取消報名
- **THEN** 系統回傳錯誤訊息「活動已開始，無法取消報名」（code: EVENT_STARTED）

#### Scenario: 未報名者嘗試取消

- **WHEN** 使用者嘗試取消一個沒有 CONFIRMED 報名記錄的活動
- **THEN** 系統回傳錯誤訊息「您尚未報名此活動」（code: NOT_REGISTERED）

### Requirement: 取消報名後可以重新報名

系統 SHALL 允許使用者在取消報名後重新報名同一活動（前提是活動仍有名額且為 PUBLISHED 狀態）。

#### Scenario: 取消後重新報名

- **WHEN** 使用者先取消報名，再對同一活動重新報名，且活動仍有名額
- **THEN** 系統建立一筆新的 CONFIRMED Registration 記錄，報名成功

### Requirement: 活動詳情頁顯示報名狀態

系統 SHALL 在活動詳情頁根據使用者的登入狀態和報名狀態顯示不同的 CTA 按鈕。

#### Scenario: 未登入使用者看到登入提示

- **WHEN** 未登入使用者瀏覽活動詳情頁
- **THEN** CTA 按鈕顯示「登入後報名」，點擊後導向登入頁面

#### Scenario: 已登入但尚未報名

- **WHEN** 已登入使用者瀏覽一個 PUBLISHED 且有名額的活動詳情頁
- **THEN** CTA 按鈕顯示「我要報名」，可點擊

#### Scenario: 已報名使用者

- **WHEN** 已報名使用者瀏覽該活動詳情頁
- **THEN** CTA 按鈕顯示「取消報名」，並顯示「已報名」狀態提示

#### Scenario: 活動已額滿

- **WHEN** 使用者瀏覽一個已額滿的活動詳情頁
- **THEN** CTA 按鈕顯示「已額滿」，狀態為 disabled

#### Scenario: 活動已結束或已取消

- **WHEN** 使用者瀏覽 ENDED 或 CANCELLED 狀態的活動
- **THEN** 不顯示報名相關的 CTA 按鈕

### Requirement: 「我的活動」頁面顯示已報名活動

系統 SHALL 在 `/my-events` 頁面顯示使用者已報名（CONFIRMED）的活動列表。

#### Scenario: 查看即將參加的活動

- **WHEN** 已登入使用者訪問 `/my-events`（預設）或 `/my-events?tab=upcoming`
- **THEN** 系統顯示使用者所有 CONFIRMED 報名且活動尚未結束的活動，依活動開始時間升序排列

#### Scenario: 查看過去參加的活動

- **WHEN** 已登入使用者訪問 `/my-events?tab=past`
- **THEN** 系統顯示使用者所有 CONFIRMED 報名且活動已結束（ENDED 或已過期）的活動，依活動開始時間降序排列

#### Scenario: 未登入使用者訪問我的活動

- **WHEN** 未登入使用者訪問 `/my-events`
- **THEN** 系統導向登入頁面

#### Scenario: 沒有已報名的活動

- **WHEN** 已登入使用者沒有任何 CONFIRMED 報名記錄
- **THEN** 系統顯示空狀態提示，引導使用者去瀏覽活動列表

### Requirement: 活動顯示真實報名人數

系統 SHALL 在所有顯示活動的頁面（活動列表、活動詳情、Admin 管理頁）顯示該活動的真實報名人數（CONFIRMED 狀態的 Registration 數量）。

#### Scenario: 活動列表顯示報名人數

- **WHEN** 使用者瀏覽活動列表頁
- **THEN** 每張 EventCard 顯示真實的報名人數和容量（如「12/50」）

#### Scenario: 活動詳情頁顯示報名人數

- **WHEN** 使用者瀏覽活動詳情頁
- **THEN** 報名卡片顯示真實的報名人數、容量上限、進度條

#### Scenario: Admin 管理頁顯示報名人數

- **WHEN** ADMIN 使用者瀏覽 `/admin/events`
- **THEN** 每個活動行顯示真實的報名人數（如「12/50 人」）
