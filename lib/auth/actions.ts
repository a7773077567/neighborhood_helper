'use server'

import { signOut } from '@/lib/auth'

// 【改造】Server Action — 在 server 端執行 signOut
// UserMenu 是 Client Component，不能直接呼叫 signOut()（它需要存取 cookie/DB）
// 所以用 Server Action 包一層：UserMenu 的 <form action={signOutAction}> 觸發 POST → server 端執行
export async function signOutAction(): Promise<void> {
  await signOut()
}
