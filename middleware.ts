import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// 【關鍵】不 import auth — 避免 Edge Runtime 拉入 Prisma（Node.js 專用）
// 改為直接檢查 session cookie，因為 middleware 只需要知道「有沒有登入」
//
// NextAuth v5 (Auth.js) 的 session cookie 名稱：
//   - 開發環境（HTTP）：authjs.session-token
//   - 正式環境（HTTPS）：__Secure-authjs.session-token
//
// 為什麼不用 auth() wrapper？
//   auth() 會 import PrismaAdapter → import prisma → import node:process
//   Edge Runtime 沒有 node:process，會直接炸掉

export default function middleware(request: NextRequest): NextResponse {
  const { nextUrl } = request

  // 檢查 session cookie 是否存在（不驗證內容，只確認有沒有）
  const sessionCookie
    = request.cookies.get('authjs.session-token')
      ?? request.cookies.get('__Secure-authjs.session-token')
  const isLoggedIn = !!sessionCookie

  // 【規則 1】/login 頁面：已登入就 redirect 到首頁（避免重複登入）
  if (nextUrl.pathname === '/login') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
    return NextResponse.next()
  }

  // 【規則 2】/my-events、/admin 路由：沒登入就 redirect 到 /login
  // ADMIN 角色檢查不在這裡做，而是在 (admin)/layout.tsx 用 auth() 檢查
  // 因為 layout 跑在 Node.js Runtime，可以查資料庫拿到完整 session（包含 role）
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
}

// 【關鍵】matcher 決定哪些路由會觸發 middleware
// 沒列在這裡的路由（如 /、/events）完全不受影響，不會執行上面的函式
export const config = {
  matcher: ['/my-events/:path*', '/admin/:path*', '/login'],
}
