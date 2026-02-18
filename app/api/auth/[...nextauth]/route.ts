import { handlers } from '@/lib/auth'

// 【關鍵】Catch-all route — /api/auth/* 的所有請求都交給 NextAuth 處理
// 包含：signin、signout、callback/google、session 等
// handlers 是 { GET, POST }，解構後匯出給 Next.js App Router 使用
export const { GET, POST } = handlers
