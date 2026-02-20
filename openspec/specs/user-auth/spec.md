## Requirements

### Requirement: 使用者可以透過 Google 帳號登入

系統 SHALL 提供 Google OAuth 登入功能，使用者點擊登入按鈕後透過 Google 授權完成認證。

#### Scenario: 首次登入自動建立帳號

- **WHEN** 使用者首次使用 Google 帳號登入
- **THEN** 系統自動建立 User 記錄（role 為 MEMBER、points 為 0），並建立登入 session

#### Scenario: 再次登入使用既有帳號

- **WHEN** 使用者使用已註冊的 Google 帳號登入
- **THEN** 系統找到既有 User 記錄，建立新的登入 session

#### Scenario: 登入頁面顯示 Google 登入按鈕

- **WHEN** 使用者訪問 `/login`
- **THEN** 頁面顯示「使用 Google 登入」按鈕，點擊後跳轉到 Google OAuth 授權頁面

### Requirement: 使用者可以登出

系統 SHALL 允許已登入使用者登出，清除 session。

#### Scenario: 點擊登出

- **WHEN** 已登入使用者在 UserMenu 中點擊「登出」
- **THEN** 系統清除該使用者的 session，重新導向至首頁

### Requirement: 已登入使用者不需要重複登入

系統 SHALL 在已登入使用者訪問登入頁面時自動導向。

#### Scenario: 已登入使用者訪問登入頁

- **WHEN** 已登入使用者訪問 `/login`
- **THEN** 系統自動重新導向至首頁

### Requirement: Dashboard 路由需要登入才能存取

系統 SHALL 保護所有 `(dashboard)` 路由群組下的頁面，未登入使用者無法存取。

#### Scenario: 未登入使用者存取 dashboard 路由

- **WHEN** 未登入使用者訪問 `/my-events` 或其他 dashboard 路徑
- **THEN** 系統重新導向至 `/login`

#### Scenario: 已登入使用者存取 dashboard 路由

- **WHEN** 已登入使用者（MEMBER 或 ADMIN）訪問 dashboard 路徑
- **THEN** 正常顯示頁面內容

### Requirement: Admin 路由需要 ADMIN 角色才能存取

系統 SHALL 保護所有 `(admin)` 路由群組下的頁面，僅 ADMIN 角色可存取。

#### Scenario: MEMBER 使用者存取 admin 路由

- **WHEN** role 為 MEMBER 的已登入使用者訪問 `/admin` 或其他 admin 路徑
- **THEN** 系統重新導向至首頁

#### Scenario: ADMIN 使用者存取 admin 路由

- **WHEN** role 為 ADMIN 的已登入使用者訪問 admin 路徑
- **THEN** 正常顯示頁面內容

### Requirement: Session 包含使用者角色資訊

系統 SHALL 在 session 中包含使用者的 role 欄位，供路由保護和 UI 渲染使用。

#### Scenario: Session 包含完整使用者資訊

- **WHEN** 使用者登入後，任何 Server Component 或 API Route 呼叫 `auth()`
- **THEN** 回傳的 session 物件包含 `user.id`、`user.name`、`user.email`、`user.role`

### Requirement: User 資料模型支援角色區分

系統 SHALL 使用 User model 的 `role` 欄位區分使用者權限，預設為 MEMBER。

#### Scenario: 新使用者預設為 MEMBER

- **WHEN** 系統建立新的 User 記錄
- **THEN** role 欄位預設值為 MEMBER

#### Scenario: ADMIN 角色由資料庫手動設定

- **WHEN** 需要設定某使用者為組織者
- **THEN** 直接在資料庫修改該使用者的 role 為 ADMIN
