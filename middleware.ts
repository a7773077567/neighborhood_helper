import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// 【關鍵】auth() 當 middleware wrapper 使用
// 它會攔截請求 → 嘗試讀取 session → 把結果塞進 req.auth → 呼叫你的 callback
// 注意：Edge Runtime 下使用 database session，req.auth 可能為 null（無法查資料庫）
// 所以這裡只做「有沒有 cookie」的基本檢查，不檢查 role
export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

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
})

// 【關鍵】matcher 決定哪些路由會觸發 middleware
// 沒列在這裡的路由（如 /、/events）完全不受影響，不會執行上面的函式
export const config = {
  matcher: ['/my-events/:path*', '/admin/:path*', '/login'],
}
