## ADDED Requirements

### Requirement: 組織者可以從活動管理頁進入簽到頁面

系統 SHALL 在活動管理相關頁面提供簽到頁面的入口。

#### Scenario: 活動管理列表顯示簽到入口

- **WHEN** ADMIN 使用者在 `/admin/events` 查看 PUBLISHED 狀態的活動
- **THEN** 該活動的操作選項中包含「簽到」按鈕，點擊後導向 `/admin/events/[id]/checkin`

#### Scenario: 非 PUBLISHED 活動不顯示簽到入口

- **WHEN** ADMIN 使用者在 `/admin/events` 查看 DRAFT、ENDED 或 CANCELLED 狀態的活動
- **THEN** 該活動的操作選項中不包含「簽到」按鈕

### Requirement: 組織者可以查看活動出席統計

系統 SHALL 在活動報名名單頁面顯示每位報名者的簽到狀態。

#### Scenario: 報名名單顯示簽到狀態

- **WHEN** ADMIN 使用者查看活動的報名名單
- **THEN** 每位報名者旁邊顯示簽到狀態（已簽到 ✓ / 未簽到）及簽到時間（如有）
