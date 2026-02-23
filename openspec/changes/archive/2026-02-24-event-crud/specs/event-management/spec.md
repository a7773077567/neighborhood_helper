## ADDED Requirements

### Requirement: 組織者可以建立活動

系統 SHALL 允許具有 ADMIN 角色的使用者建立新活動，包含標題、描述、時間、地點、容量等資訊。

#### Scenario: 成功建立活動

- **WHEN** ADMIN 使用者填寫完整的活動資訊（標題、描述、開始時間、結束時間、地點、容量）並提交
- **THEN** 系統建立一筆 Event 記錄（status 為 DRAFT），並導向活動管理列表

#### Scenario: 表單驗證失敗

- **WHEN** ADMIN 使用者提交的表單缺少必填欄位或格式不正確（如開始時間晚於結束時間）
- **THEN** 系統顯示對應的錯誤訊息，不建立 Event 記錄

#### Scenario: 非 ADMIN 使用者無法建立活動

- **WHEN** 非 ADMIN 使用者嘗試存取建立活動頁面
- **THEN** 系統導向首頁或顯示無權限提示

### Requirement: 組織者可以編輯活動

系統 SHALL 允許 ADMIN 使用者編輯現有活動的資訊。

#### Scenario: 成功編輯活動

- **WHEN** ADMIN 使用者修改活動資訊並提交
- **THEN** 系統更新該 Event 記錄，並導向活動管理列表

#### Scenario: 編輯不存在的活動

- **WHEN** ADMIN 使用者嘗試編輯一個不存在的活動 ID
- **THEN** 系統顯示 404 頁面或導向活動管理列表

### Requirement: 組織者可以管理活動狀態

系統 SHALL 允許 ADMIN 使用者管理活動的生命週期狀態。

#### Scenario: 發布草稿活動

- **WHEN** ADMIN 使用者將 DRAFT 狀態的活動發布
- **THEN** 活動 status 變為 PUBLISHED，活動在公開列表中可見

#### Scenario: 結束活動

- **WHEN** ADMIN 使用者將 PUBLISHED 狀態的活動標記為結束
- **THEN** 活動 status 變為 ENDED

#### Scenario: 取消活動

- **WHEN** ADMIN 使用者取消一個活動
- **THEN** 活動 status 變為 CANCELLED，活動從公開列表中隱藏

### Requirement: 組織者可以在後台查看所有活動

系統 SHALL 提供活動管理列表，顯示所有狀態的活動供 ADMIN 使用者管理。

#### Scenario: 查看活動管理列表

- **WHEN** ADMIN 使用者訪問 `/admin/events`
- **THEN** 系統顯示所有活動（含 DRAFT、PUBLISHED、ENDED、CANCELLED），依建立時間降序排列

### Requirement: 參加者可以瀏覽公開活動列表

系統 SHALL 提供公開的活動列表頁，顯示已發布的活動，支援篩選。

#### Scenario: 查看即將舉辦的活動

- **WHEN** 使用者訪問 `/events`（預設）或 `/events?tab=upcoming`
- **THEN** 系統顯示所有 PUBLISHED 且尚未結束的活動，依開始時間升序排列

#### Scenario: 查看已結束的活動

- **WHEN** 使用者訪問 `/events?tab=past`
- **THEN** 系統顯示所有已結束的活動（ENDED 狀態或 PUBLISHED 但已過期），依開始時間降序排列

#### Scenario: 沒有符合條件的活動

- **WHEN** 使用者瀏覽活動列表，但沒有符合當前篩選條件的活動
- **THEN** 系統顯示空狀態提示（如「目前沒有即將舉辦的活動」）

### Requirement: 參加者可以查看活動詳情

系統 SHALL 提供活動詳情頁，顯示活動的完整資訊。

#### Scenario: 查看已發布活動的詳情

- **WHEN** 使用者訪問 `/events/[id]`，且該活動為 PUBLISHED 或 ENDED 狀態
- **THEN** 系統顯示活動標題、描述、開始/結束時間、地點、容量、目前報名人數、是否徵求講者，以及一個預留的報名按鈕（disabled 狀態，顯示「即將開放報名」）

#### Scenario: 查看不存在或未發布的活動

- **WHEN** 使用者訪問 `/events/[id]`，且該活動不存在或為 DRAFT / CANCELLED 狀態
- **THEN** 系統顯示 404 頁面

### Requirement: 活動表單驗證規則

系統 SHALL 對活動資料進行以下驗證，前後端共用同一套規則。

#### Scenario: 標題長度限制

- **WHEN** 使用者輸入的標題少於 5 字或超過 100 字
- **THEN** 系統顯示錯誤訊息

#### Scenario: 時間邏輯驗證

- **WHEN** 使用者設定的結束時間早於或等於開始時間
- **THEN** 系統顯示「結束時間必須晚於開始時間」錯誤訊息

#### Scenario: 建立活動時開始時間必須是未來

- **WHEN** 使用者建立新活動，設定的開始時間是過去的時間
- **THEN** 系統顯示「開始時間必須是未來」錯誤訊息

#### Scenario: 容量必須為正整數

- **WHEN** 使用者輸入的容量不是正整數
- **THEN** 系統顯示錯誤訊息
