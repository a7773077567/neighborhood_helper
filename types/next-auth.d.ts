import type { Role } from '@/app/generated/prisma/client'

// 【關鍵】Module Augmentation — 擴展 NextAuth 預設的型別
// NextAuth 預設的 session.user 只有 name、email、image
// 我們需要追加 id 和 role，讓 TypeScript 知道這些屬性存在

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    role: Role
  }
}

// 【關鍵】同時擴展 @auth/core/adapters 的型別
// 原因：node_modules 裡有兩份 @auth/core（next-auth 內建一份、@auth/prisma-adapter 用另一份）
// 如果只擴展 next-auth 的 User，@auth/prisma-adapter 那份的 AdapterUser 不會有 role
// 導致 PrismaAdapter 回傳的型別跟 NextAuth 期待的對不上
declare module '@auth/core/adapters' {
  interface AdapterUser {
    role: Role
  }
}
