import process from 'node:process'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/app/generated/prisma/client'

// 【關鍵】擴展 globalThis 的型別，讓 TypeScript 知道上面可能有 prisma
// 做法 A（目前）：用 as unknown as 縮小型別視角，只看到 prisma 屬性
// 做法 B（替代）：用 declare global { var prisma: PrismaClient | undefined }
//   → 會在全域型別上「追加」prisma 屬性，之後可直接寫 globalThis.prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 【關鍵】Prisma v7 需要明確提供 driver adapter 來連線資料庫
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

// 【關鍵】如果 globalThis 上已經有 prisma，就直接用；沒有才建新的
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

// 【關鍵】只在開發模式存到 globalThis（production 不需要，因為沒有 HMR）
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
