// ============================================================
// 報名 / 取消報名 Server Action 單元測試
// ============================================================
//
// 【關鍵概念】
// 1. Mock 外部依賴
//    vi.mock() 把真正的 auth、prisma、revalidatePath 替換成假的
//    每個 test 可以用 mockResolvedValue 控制「假的回傳什麼」
//
// 2. Transaction mock 策略
//    prisma.$transaction 收到一個 callback (fn)
//    我們讓它直接呼叫 fn(mockPrisma) — 把 mockPrisma 當作 tx
//    因為 tx 內外呼叫的方法不重疊，不會衝突
//
// 3. 每個 test 前 clearAllMocks
//    確保上一個 test 的設定不會影響下一個
// ============================================================

import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Import 被測模組和 mock 引用 ──────────────────────────────

import { cancelRegistration, registerEvent } from '@/lib/actions/registration'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

// ── Mock 設定（必須在 import 被測模組之前） ─────────────────

// 👈 vi.mock 會被 Vitest 提升到檔案最頂端（hoisting）
//    所以即使寫在這裡，實際執行時會先跑 mock，再跑 import

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    event: { findUnique: vi.fn() },
    registration: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    // 👈 $transaction 的 mock：收到 callback 就用 mockPrisma 當 tx 執行
    $transaction: vi.fn(),
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// 👈 把 import 的東西轉型成 mock 版本，方便呼叫 .mockResolvedValue()
const mockAuth = vi.mocked(auth)
const mockPrisma = vi.mocked(prisma, true)

// ── 共用測試資料 ────────────────────────────────────────────

const TEST_USER_ID = 'user-123'
const TEST_EVENT_ID = 'event-456'

const mockSession = {
  user: { id: TEST_USER_ID, role: 'USER' as const },
  expires: '2099-01-01',
}

const mockPublishedEvent = {
  id: TEST_EVENT_ID,
  status: 'PUBLISHED' as const,
  capacity: 30,
}

// ── beforeEach ──────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()

  // 👈 每個 test 開始時，$transaction 預設行為：呼叫 callback 並傳入 mockPrisma
  mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(mockPrisma))
})

// ════════════════════════════════════════════════════════════
// registerEvent 測試
// ════════════════════════════════════════════════════════════

describe('registerEvent', () => {
  it('成功報名 — 建立 CONFIRMED 記錄', async () => {
    // Arrange
    mockAuth.mockResolvedValue(mockSession as never)
    mockPrisma.event.findUnique.mockResolvedValue(mockPublishedEvent as never)
    mockPrisma.registration.findUnique.mockResolvedValue(null as never)
    mockPrisma.registration.count.mockResolvedValue(10 as never) // 有名額
    mockPrisma.registration.create.mockResolvedValue({} as never)

    // Act
    const result = await registerEvent(TEST_EVENT_ID)

    // Assert
    expect(result).toEqual({ success: true })
    expect(mockPrisma.registration.create).toHaveBeenCalledOnce()
  })

  it('未登入 → UNAUTHORIZED', async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await registerEvent(TEST_EVENT_ID)

    expect(result).toEqual({
      success: false,
      error: '請先登入',
      code: 'UNAUTHORIZED',
    })
    // 👈 未登入不應該查 DB
    expect(mockPrisma.event.findUnique).not.toHaveBeenCalled()
  })

  it('活動不存在 → EVENT_NOT_FOUND', async () => {
    mockAuth.mockResolvedValue(mockSession as never)
    mockPrisma.event.findUnique.mockResolvedValue(null as never)

    const result = await registerEvent(TEST_EVENT_ID)

    expect(result).toEqual({
      success: false,
      error: '找不到此活動',
      code: 'EVENT_NOT_FOUND',
    })
  })

  it('活動非 PUBLISHED（DRAFT）→ EVENT_NOT_AVAILABLE', async () => {
    mockAuth.mockResolvedValue(mockSession as never)
    mockPrisma.event.findUnique.mockResolvedValue({
      ...mockPublishedEvent,
      status: 'DRAFT',
    } as never)

    const result = await registerEvent(TEST_EVENT_ID)

    expect(result).toEqual({
      success: false,
      error: '此活動目前無法報名',
      code: 'EVENT_NOT_AVAILABLE',
    })
  })

  it('已報名（CONFIRMED）→ ALREADY_REGISTERED', async () => {
    mockAuth.mockResolvedValue(mockSession as never)
    mockPrisma.event.findUnique.mockResolvedValue(mockPublishedEvent as never)
    mockPrisma.registration.findUnique.mockResolvedValue({
      id: 'reg-789',
      status: 'CONFIRMED',
    } as never)

    const result = await registerEvent(TEST_EVENT_ID)

    expect(result).toEqual({
      success: false,
      error: '您已報名此活動',
      code: 'ALREADY_REGISTERED',
    })
    // 👈 不應該進入 transaction
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('已額滿 → EVENT_FULL', async () => {
    mockAuth.mockResolvedValue(mockSession as never)
    mockPrisma.event.findUnique.mockResolvedValue({
      ...mockPublishedEvent,
      capacity: 30,
    } as never)
    mockPrisma.registration.findUnique.mockResolvedValue(null as never)
    mockPrisma.registration.count.mockResolvedValue(30 as never) // 👈 已達上限

    const result = await registerEvent(TEST_EVENT_ID)

    expect(result).toEqual({
      success: false,
      error: '活動已額滿',
      code: 'EVENT_FULL',
    })
    expect(mockPrisma.registration.create).not.toHaveBeenCalled()
  })

  it('取消後重新報名 → update 而非 create', async () => {
    mockAuth.mockResolvedValue(mockSession as never)
    mockPrisma.event.findUnique.mockResolvedValue(mockPublishedEvent as never)
    // 👈 有一筆 CANCELLED 的舊記錄
    mockPrisma.registration.findUnique.mockResolvedValue({
      id: 'reg-789',
      status: 'CANCELLED',
    } as never)
    mockPrisma.registration.count.mockResolvedValue(10 as never)
    mockPrisma.registration.update.mockResolvedValue({} as never)

    const result = await registerEvent(TEST_EVENT_ID)

    expect(result).toEqual({ success: true })
    // 👈 應該 update 現有記錄，不是 create 新的
    expect(mockPrisma.registration.update).toHaveBeenCalledOnce()
    expect(mockPrisma.registration.create).not.toHaveBeenCalled()
  })
})

// ════════════════════════════════════════════════════════════
// cancelRegistration 測試
// ════════════════════════════════════════════════════════════

describe('cancelRegistration', () => {
  it('成功取消報名 — 更新 status 為 CANCELLED', async () => {
    mockAuth.mockResolvedValue(mockSession as never)
    mockPrisma.registration.findUnique.mockResolvedValue({
      id: 'reg-789',
      status: 'CONFIRMED',
      event: { startTime: new Date('2099-01-01') }, // 👈 未來的活動
    } as never)
    mockPrisma.registration.update.mockResolvedValue({} as never)

    const result = await cancelRegistration(TEST_EVENT_ID)

    expect(result).toEqual({ success: true })
    expect(mockPrisma.registration.update).toHaveBeenCalledWith({
      where: { id: 'reg-789' },
      data: { status: 'CANCELLED' },
    })
  })

  it('未登入 → UNAUTHORIZED', async () => {
    mockAuth.mockResolvedValue(null as never)

    const result = await cancelRegistration(TEST_EVENT_ID)

    expect(result).toEqual({
      success: false,
      error: '請先登入',
      code: 'UNAUTHORIZED',
    })
  })

  it('未報名（無記錄）→ NOT_REGISTERED', async () => {
    mockAuth.mockResolvedValue(mockSession as never)
    mockPrisma.registration.findUnique.mockResolvedValue(null as never)

    const result = await cancelRegistration(TEST_EVENT_ID)

    expect(result).toEqual({
      success: false,
      error: '您尚未報名此活動',
      code: 'NOT_REGISTERED',
    })
  })

  it('活動已開始 → EVENT_STARTED', async () => {
    mockAuth.mockResolvedValue(mockSession as never)
    mockPrisma.registration.findUnique.mockResolvedValue({
      id: 'reg-789',
      status: 'CONFIRMED',
      event: { startTime: new Date('2020-01-01') }, // 👈 過去的時間
    } as never)

    const result = await cancelRegistration(TEST_EVENT_ID)

    expect(result).toEqual({
      success: false,
      error: '活動已開始，無法取消報名',
      code: 'EVENT_STARTED',
    })
    // 👈 不應該呼叫 update
    expect(mockPrisma.registration.update).not.toHaveBeenCalled()
  })
})
