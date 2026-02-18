import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/db/prisma'

// 【關鍵】NextAuth() 是整個認證系統的中樞
// 它回傳 handlers（API route 用）、auth（讀取 session）、signIn、signOut
export const { handlers, auth, signIn, signOut } = NextAuth({
  // 【關鍵】Adapter 告訴 NextAuth 把使用者資料存到哪裡
  // PrismaAdapter 會自動操作 User、Account、Session、VerificationToken 四張表
  adapter: PrismaAdapter(prisma),

  // 【關鍵】認證提供者，目前只有 Google
  // NextAuth v5 會自動讀取 AUTH_GOOGLE_ID 和 AUTH_GOOGLE_SECRET 環境變數
  providers: [Google],

  // 【關鍵】指定使用 database session（不是 JWT）
  // 搭配 PrismaAdapter 時這是預設值，但明確寫出來比較清楚
  session: {
    strategy: 'database',
  },

  // 【關鍵】自訂頁面路徑
  // 不用 NextAuth 預設的 /api/auth/signin，改用我們自己設計的 /login
  pages: {
    signIn: '/login',
  },

  // 【關鍵】Callbacks 讓我們在 NextAuth 流程中插入自訂邏輯
  callbacks: {
    // session callback：每次讀取 session 時都會執行
    // 用途：把資料庫裡的 user.role 塞進 session 物件
    // 為什麼需要？因為 NextAuth 預設的 session 只有 name、email、image
    session({ session, user }) {
      session.user.id = user.id
      session.user.role = user.role
      return session
    },
  },
})
