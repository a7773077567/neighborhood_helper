## MODIFIED Requirements

### Requirement: 參加者可以查看活動詳情

系統 SHALL 提供活動詳情頁，顯示活動的完整資訊，並根據使用者的登入狀態和報名狀態顯示對應的報名 CTA。

#### Scenario: 查看已發布活動的詳情

- **WHEN** 使用者訪問 `/events/[id]`，且該活動為 PUBLISHED 或 ENDED 狀態
- **THEN** 系統顯示活動標題、描述、開始/結束時間、地點、容量、目前報名人數（真實數據）、是否徵求講者，以及根據使用者狀態顯示的報名 CTA 按鈕

#### Scenario: 查看不存在或未發布的活動

- **WHEN** 使用者訪問 `/events/[id]`，且該活動不存在或為 DRAFT / CANCELLED 狀態
- **THEN** 系統顯示 404 頁面

### Requirement: 組織者可以在後台查看所有活動

系統 SHALL 提供活動管理列表，顯示所有狀態的活動（含真實報名人數）供 ADMIN 使用者管理。

#### Scenario: 查看活動管理列表

- **WHEN** ADMIN 使用者訪問 `/admin/events`
- **THEN** 系統顯示所有活動（含 DRAFT、PUBLISHED、ENDED、CANCELLED），依建立時間降序排列，每個活動顯示真實報名人數

## ADDED Requirements

### Requirement: 組織者可以查看活動報名名單

系統 SHALL 允許 ADMIN 使用者查看特定活動的報名名單。

#### Scenario: 查看報名名單

- **WHEN** ADMIN 使用者在活動管理頁點擊查看報名名單
- **THEN** 系統顯示該活動所有 CONFIRMED 狀態的報名者列表（姓名、Email、報名時間）

#### Scenario: 沒有報名者

- **WHEN** ADMIN 使用者查看一個沒有報名者的活動名單
- **THEN** 系統顯示空狀態提示「尚無人報名此活動」
