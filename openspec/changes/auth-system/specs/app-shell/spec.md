## MODIFIED Requirements

### Requirement: 應用程式具備統一的 Header

所有頁面（除認證頁面外）SHALL 顯示統一的 Header，包含 Logo 和導覽連結。Header SHALL 透過 `auth()` 讀取 session 自動判斷使用者登入狀態和角色，不再依賴 variant prop。

#### Scenario: 未登入使用者看到公開導覽

- **WHEN** 未登入使用者訪問任何公開頁面
- **THEN** Header 顯示 Logo、「活動」和「排行榜」導覽連結、以及「登入」按鈕

#### Scenario: 已登入會員看到完整導覽

- **WHEN** 已登入的 MEMBER 使用者訪問頁面
- **THEN** Header 顯示 Logo、「活動」、「排行榜」、「我的活動」導覽連結、以及使用者頭像下拉選單（顯示真實名稱和 email）

#### Scenario: 組織者看到管理入口

- **WHEN** 已登入的 ADMIN 使用者訪問頁面
- **THEN** Header 額外顯示「管理後台」導覽連結

#### Scenario: 認證頁面顯示簡潔 Header

- **WHEN** 使用者訪問登入頁面
- **THEN** Header 只顯示 Logo，不顯示導覽連結和登入按鈕

### Requirement: Route Group 提供對應的 Layout

應用程式 SHALL 為不同類型的頁面提供對應的 Layout 結構。各 Layout 不再需要傳遞 variant prop 給 Header，Header 自行判斷狀態。

#### Scenario: 公開頁面使用公開 Layout

- **WHEN** 使用者訪問 `/events` 或 `/leaderboard` 等公開路徑
- **THEN** 頁面使用含 Header 和 Footer 的 Layout

#### Scenario: Dashboard 頁面使用登入後 Layout

- **WHEN** 已登入使用者訪問 `/my-events` 等路徑
- **THEN** 頁面使用含 Header 和 Footer 的 Layout

#### Scenario: Admin 頁面使用管理 Layout

- **WHEN** ADMIN 使用者訪問管理相關路徑
- **THEN** 頁面使用含 Header 和 Footer 的 Layout
