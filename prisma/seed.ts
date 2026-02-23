// ============================================================
// Prisma Seed Script — 塞入測試用活動資料
// ============================================================
//
// 【用途】
// 開發環境初始化測試資料，讓每種 EventStatus 都有至少一筆
// 新成員 clone 專案後只要跑 `npx prisma db seed` 就有完整測試資料
//
// 【執行方式】
// npx prisma db seed       ← Prisma 會讀 package.json 的 prisma.seed 設定
// npx tsx prisma/seed.ts   ← 或直接用 tsx 跑
//
// 【設計決策】
// 1. upsert — 用固定 id，重複執行不會炸（有就更新、沒有就建立）
// 2. 先建 User — Event 需要 organizerId 外鍵，必須先有 User
// 3. 日期用相對時間 — 用 now ± N 天，不管什麼時候跑都有合理的測試資料
// ============================================================

import process from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

// Prisma v7 需要 driver adapter 連線
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// ── 工具函式：相對於現在的日期 ────────────────────────────
function daysFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

function hoursFromNow(hours: number): Date {
  const date = new Date()
  date.setHours(date.getHours() + hours)
  return date
}

// ── 主程式 ──────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('🌱 開始 seed...')

  // ── 1. 建立測試用 ADMIN User ─────────────────────────
  // 用固定 email 做 upsert，避免每次跑都建新 user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gdg-tainan.dev' },
    update: { name: 'GDG Tainan Organizer', role: 'ADMIN' },
    create: {
      email: 'admin@gdg-tainan.dev',
      name: 'GDG Tainan Organizer',
      role: 'ADMIN',
    },
  })
  console.log(`  ✓ Admin user: ${admin.email} (${admin.id})`)

  // ── 2. 建立各種狀態的測試活動 ─────────────────────────
  // 用固定 id 做 upsert，重複跑不會重複建立
  const events = [
    {
      id: 'seed-event-draft',
      title: '【草稿】AI 讀書會第 5 期',
      description: '這是一個草稿活動，還在規劃中。\n\n預計討論 Transformer 架構與 Attention 機制的最新論文。',
      startTime: daysFromNow(30),
      endTime: daysFromNow(30),
      location: '台南市東區 成功大學資訊系館 4F',
      capacity: 25,
      status: 'DRAFT' as const,
      seekingSpeaker: false,
    },
    {
      id: 'seed-event-published-1',
      title: 'Next.js 15 新功能實戰工作坊',
      description: '一起動手玩 Next.js 15 的最新功能！\n\n本次工作坊將涵蓋：\n• Server Actions 進階用法\n• Partial Prerendering (PPR)\n• 新的 Cache API\n• Turbopack 正式版體驗\n\n適合有 React 基礎的開發者參加，會從概念講起再帶實作。',
      startTime: daysFromNow(7),
      endTime: daysFromNow(7),
      location: '好想工作室（台南市東區北門路二段 16 號 L2A）',
      capacity: 40,
      status: 'PUBLISHED' as const,
      seekingSpeaker: true,
    },
    {
      id: 'seed-event-published-2',
      title: 'Flutter × Firebase 快速開發 — 從零到上架',
      description: '用 Flutter 搭配 Firebase 打造完整的行動應用！\n\n涵蓋 Authentication、Firestore、Cloud Functions、推播通知等核心功能。\n\n每位參加者都會在工作坊結束時有一個可以上架的 MVP。',
      startTime: daysFromNow(14),
      endTime: daysFromNow(14),
      location: '台南市中西區 南門電影書院',
      capacity: 30,
      status: 'PUBLISHED' as const,
      seekingSpeaker: false,
    },
    {
      id: 'seed-event-published-soon',
      title: 'GDG Tainan 月聚：開源貢獻入門',
      description: '不知道怎麼開始參與開源？這場聚會帶你從零開始！\n\n• 如何找到適合的開源專案\n• 你的第一個 Pull Request\n• 開源社群禮儀與溝通技巧\n• 實際操作：一起發 PR',
      startTime: hoursFromNow(48),
      endTime: hoursFromNow(51),
      location: '胖地（台南市中西區南門路 21 號）',
      capacity: 20,
      status: 'PUBLISHED' as const,
      seekingSpeaker: true,
    },
    {
      id: 'seed-event-ended',
      title: 'Google I/O Extended Tainan 2025',
      description: 'Google I/O 2025 重點回顧！\n\n由在地開發者帶你走過今年 I/O 的重要更新：\n• Gemini 2.0 與 AI Studio\n• Android 16 開發者新功能\n• Web Platform 最新標準\n• Cloud 與 DevOps 更新',
      startTime: daysFromNow(-14),
      endTime: daysFromNow(-14),
      location: '成功大學綠色魔法學校 崇華廳',
      capacity: 80,
      status: 'ENDED' as const,
      seekingSpeaker: false,
    },
    {
      id: 'seed-event-cancelled',
      title: '【已取消】Kubernetes 入門工作坊',
      description: '因場地問題取消，將擇期重辦。\n\n原定內容：K8s 基礎概念、Pod/Service/Deployment、Helm Charts。',
      startTime: daysFromNow(3),
      endTime: daysFromNow(3),
      location: '台南市安平區 某共享空間',
      capacity: 15,
      status: 'CANCELLED' as const,
      seekingSpeaker: false,
    },
  ]

  for (const event of events) {
    const result = await prisma.event.upsert({
      where: { id: event.id },
      update: {
        ...event,
        organizerId: admin.id,
      },
      create: {
        ...event,
        organizerId: admin.id,
      },
    })
    console.log(`  ✓ Event [${result.status.padEnd(9)}] ${result.title}`)
  }

  console.log(`\n🌱 Seed 完成！共 ${events.length} 筆活動`)
}

main()
  .catch((e: unknown) => {
    console.error('❌ Seed 失敗:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
