## MODIFIED Requirements

### Requirement: 使用者可以報名活動

系統 SHALL 允許已登入的使用者報名 PUBLISHED 狀態且尚未額滿的活動。報名 SHALL 使用 Prisma Transaction 確保容量檢查的原子性。報名時 SHALL 自動生成唯一的 qrToken。

#### Scenario: 成功報名活動

- **WHEN** 已登入使用者對一個 PUBLISHED 且尚有名額的活動發送報名請求
- **THEN** 系統建立一筆 Registration 記錄（status 為 CONFIRMED，自動生成 qrToken，attended 為 false），回傳成功訊息，活動的報名人數加 1

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

## ADDED Requirements

### Requirement: 已報名使用者可以查看 QR Code

系統 SHALL 允許已報名的使用者在活動詳情頁和我的活動頁面查看自己的 QR Code。

#### Scenario: 活動詳情頁顯示 QR Code

- **WHEN** 已報名（CONFIRMED）使用者瀏覽該活動詳情頁，且活動為 PUBLISHED 狀態
- **THEN** 系統顯示該使用者的 QR Code（基於 qrToken 生成）及「取消報名」按鈕

#### Scenario: 已結束活動不顯示 QR Code

- **WHEN** 已報名使用者瀏覽一個 ENDED 狀態的活動詳情頁
- **THEN** 系統不顯示 QR Code

#### Scenario: 我的活動頁面顯示 QR Code 入口

- **WHEN** 已登入使用者在 `/my-events` 查看即將參加的活動
- **THEN** 每張活動卡片提供「查看 QR Code」的入口（連結到活動詳情頁或展開顯示）

### Requirement: Registration Model 新增簽到相關欄位

Registration model SHALL 新增 qrToken、attended、attendedAt 欄位以支援簽到功能。

#### Scenario: 新報名記錄包含 qrToken

- **WHEN** 使用者成功報名活動
- **THEN** 新建的 Registration 記錄包含自動生成的 UUID 格式 qrToken，attended 為 false，attendedAt 為 null

#### Scenario: qrToken 唯一性

- **WHEN** 系統生成 qrToken
- **THEN** 該 token 在所有 Registration 記錄中 MUST 唯一（資料庫 unique constraint）
