## ADDED Requirements

### Requirement: 應用程式具備統一的 Header

所有頁面（除認證頁面外）SHALL 顯示統一的 Header，包含 Logo 和導覽連結。Header 根據使用者狀態顯示不同內容。

#### Scenario: 未登入使用者看到公開導覽

- **WHEN** 未登入使用者訪問任何公開頁面
- **THEN** Header 顯示 Logo、「活動」和「排行榜」導覽連結、以及「登入」按鈕

#### Scenario: 已登入會員看到完整導覽

- **WHEN** 已登入的 MEMBER 使用者訪問頁面
- **THEN** Header 顯示 Logo、「活動」、「排行榜」、「我的活動」導覽連結、以及使用者頭像下拉選單

#### Scenario: 組織者看到管理入口

- **WHEN** 已登入的 ADMIN 使用者訪問頁面
- **THEN** Header 額外顯示「管理後台」導覽連結

#### Scenario: 認證頁面顯示簡潔 Header

- **WHEN** 使用者訪問登入頁面
- **THEN** Header 只顯示 Logo，不顯示導覽連結和登入按鈕

### Requirement: 應用程式具備統一的 Footer

所有頁面（除認證頁面外）SHALL 顯示統一的 Footer。

#### Scenario: Footer 顯示社群資訊

- **WHEN** 使用者訪問任何頁面（認證頁面除外）
- **THEN** Footer 顯示 GDG Tainan 社群資訊和版權宣告

### Requirement: 導覽列支援響應式設計

導覽列 SHALL 在不同螢幕尺寸下提供適當的操作方式。

#### Scenario: 桌面版顯示水平導覽列

- **WHEN** 使用者在寬度 >= 768px 的裝置瀏覽
- **THEN** Header 顯示水平排列的導覽連結

#### Scenario: 手機版顯示漢堡選單

- **WHEN** 使用者在寬度 < 768px 的裝置瀏覽
- **THEN** Header 隱藏水平導覽連結，顯示漢堡圖示按鈕

#### Scenario: 手機版點擊漢堡圖示開啟側邊選單

- **WHEN** 使用者在手機版點擊漢堡圖示
- **THEN** 從左側滑出側邊選單，顯示所有導覽連結

### Requirement: Route Group 提供對應的 Layout

應用程式 SHALL 為不同類型的頁面提供對應的 Layout 結構。

#### Scenario: 公開頁面使用公開 Layout

- **WHEN** 使用者訪問 `/events` 或 `/leaderboard` 等公開路徑
- **THEN** 頁面使用含 Header（公開版）和 Footer 的 Layout

#### Scenario: Dashboard 頁面使用登入後 Layout

- **WHEN** 已登入使用者訪問 `/profile` 或 `/my-events` 等路徑
- **THEN** 頁面使用含 Header（登入版）和 Footer 的 Layout

#### Scenario: Admin 頁面使用管理 Layout

- **WHEN** ADMIN 使用者訪問管理相關路徑
- **THEN** 頁面使用含 Header（管理版）和 Footer 的 Layout

### Requirement: 首頁引導使用者瀏覽活動

應用程式 SHALL 在首頁（`/`）顯示歡迎內容並引導使用者前往活動列表。

#### Scenario: 首頁顯示 Hero 區塊

- **WHEN** 使用者訪問 `/`
- **THEN** 頁面顯示「Neighborhood Helper」標題、GDG Tainan 社群簡介、以及前往活動列表的 CTA 按鈕

### Requirement: 應用程式提供 Toast 通知機制

應用程式 SHALL 提供全域的 Toast 通知元件，供各功能模組使用。

#### Scenario: Toast 可從任何頁面觸發

- **WHEN** 任何功能模組呼叫 toast 函式
- **THEN** 畫面右下角顯示通知訊息，數秒後自動消失

### Requirement: 應用程式提供 Empty State 元件

應用程式 SHALL 提供統一的空狀態元件，在沒有資料時顯示友善提示。

#### Scenario: Empty State 顯示提示訊息和操作按鈕

- **WHEN** 頁面沒有資料需要顯示
- **THEN** 顯示圖示、描述文字、以及可選的操作按鈕（例如「建立第一個活動」）
