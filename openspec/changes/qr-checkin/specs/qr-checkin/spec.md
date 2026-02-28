## ADDED Requirements

### Requirement: 組織者可以掃描 QR Code 簽到

系統 SHALL 提供簽到頁面（`/admin/events/[id]/checkin`），允許 ADMIN 使用者使用手機鏡頭掃描參加者的 QR Code，驗證 qrToken 並標記出席。

#### Scenario: 成功掃描簽到

- **WHEN** ADMIN 使用者在簽到頁面掃描一個有效的 QR Code（包含有效 qrToken）
- **THEN** 系統查詢對應的 Registration 記錄，將 `attended` 設為 true、`attendedAt` 設為當前時間，並顯示參加者姓名與大頭照及「簽到成功」提示

#### Scenario: 重複掃描已簽到的 QR Code

- **WHEN** ADMIN 使用者掃描一個已經簽到（`attended` 為 true）的 QR Code
- **THEN** 系統顯示警告訊息「此參加者已簽到」及簽到時間，不重複更新記錄

#### Scenario: 掃描無效的 QR Code

- **WHEN** ADMIN 使用者掃描一個不存在於資料庫的 qrToken
- **THEN** 系統顯示錯誤訊息「無效的 QR Code」

#### Scenario: 掃描非本場活動的 QR Code

- **WHEN** ADMIN 使用者掃描一個屬於其他活動的有效 qrToken
- **THEN** 系統顯示錯誤訊息「此 QR Code 不屬於本場活動」

#### Scenario: 掃描已取消報名的 QR Code

- **WHEN** ADMIN 使用者掃描一個 Registration status 為 CANCELLED 的 qrToken
- **THEN** 系統顯示錯誤訊息「此報名已取消」

#### Scenario: 非 ADMIN 使用者無法存取簽到頁面

- **WHEN** 非 ADMIN 使用者嘗試存取 `/admin/events/[id]/checkin`
- **THEN** 系統導向首頁或顯示無權限提示

### Requirement: 簽到頁面顯示活動簽到統計

系統 SHALL 在簽到頁面顯示當前活動的簽到統計資訊。

#### Scenario: 顯示簽到統計

- **WHEN** ADMIN 使用者進入簽到頁面
- **THEN** 系統顯示活動名稱、已簽到人數 / 已報名人數（如「12/45 人已簽到」）

#### Scenario: 簽到後即時更新統計

- **WHEN** ADMIN 使用者成功掃描一個新的簽到
- **THEN** 簽到統計的已簽到人數即時加 1

### Requirement: 簽到頁面提供相機控制

系統 SHALL 在簽到頁面提供相機啟動/停止控制，並處理相機權限。

#### Scenario: 啟動相機掃描

- **WHEN** ADMIN 使用者進入簽到頁面並允許相機權限
- **THEN** 系統啟動手機鏡頭並開始偵測 QR Code

#### Scenario: 拒絕相機權限

- **WHEN** 使用者拒絕瀏覽器的相機權限請求
- **THEN** 系統顯示提示訊息「需要相機權限才能掃描 QR Code」，並說明如何在瀏覽器設定中開啟

### Requirement: 組織者可以手動簽到

系統 SHALL 允許 ADMIN 使用者在活動報名名單中手動標記參加者為已簽到，作為 QR Code 掃描的 fallback。

#### Scenario: 手動簽到成功

- **WHEN** ADMIN 使用者在報名名單頁面點擊某位 CONFIRMED 報名者的「手動簽到」按鈕
- **THEN** 系統將該 Registration 的 `attended` 設為 true、`attendedAt` 設為當前時間，並更新頁面顯示為已簽到

#### Scenario: 對已簽到者再次手動簽到

- **WHEN** ADMIN 使用者嘗試對一位已簽到的報名者點擊手動簽到
- **THEN** 該按鈕不可點擊（disabled），顯示已簽到狀態與簽到時間
