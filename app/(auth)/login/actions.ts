'use server'

import { signIn } from '@/lib/auth'

// 【關鍵】Server Action — 在 server 端執行 signIn
// 呼叫流程：使用者點按鈕 → <form action> 觸發 POST → 這個函式在 server 執行
// signIn('google') 會回傳一個 redirect URL，Next.js 自動處理重導到 Google OAuth
export async function loginWithGoogle(): Promise<void> {
  await signIn('google')
}
