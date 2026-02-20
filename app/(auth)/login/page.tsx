import Image from 'next/image'
import { loginWithGoogle } from './actions'

// 【關鍵】這是 Server Component — 不需要 'use client'
// 因為互動行為（登入）透過 <form action={serverAction}> 處理
// Server Component 的好處：不送 JS bundle 到前端，效能更好

export default function LoginPage(): React.ReactElement {
  return (
    // 【設計對照】Pencil: Main Content (kbKUu / kJFDV)
    // flex-1 填滿 layout 中 Header 和 Footer 之間的空間
    // pt-[25vh] → 從頂部留 25% 視窗高度，讓內容偏上（比 justify-center + pb 更可靠）
    <div className="flex flex-1 flex-col items-center gap-7 px-6 pt-[25vh] md:gap-8">
      {/* ── 標題區 ── */}
      {/* 【設計對照】Pencil: Title Group (h93PL / EG5qo) */}
      <div className="flex flex-col items-center gap-2.5 md:gap-3">
        <h1 className="font-mono text-2xl font-bold text-ink-primary md:text-[32px]">
          登入解鎖
        </h1>
        <p className="text-[15px] text-ink-body md:text-base">
          報活動 · 集積分 · 認識厲害的人
        </p>
      </div>

      {/* ── Google 登入按鈕 ── */}
      {/* 【關鍵】<form action={loginWithGoogle}> 觸發 Server Action
       *  使用者點擊 → 瀏覽器 POST → Server 執行 signIn('google') → redirect 到 Google
       *
       * 【設計對照】Pencil: Google Login Button (42ds7 / K53PN)
       *  橘色底 + 粗邊框 + Neobrutalism 陰影
       */}
      <form action={loginWithGoogle} className="w-full md:w-auto">
        <button
          type="submit"
          className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border-2 border-ink-primary bg-brand-orange px-5 shadow-brutal transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:h-14 md:w-80 md:gap-3 md:px-6"
        >
          {/* Google icon：白底圓角方塊 + 彩色 G */}
          <span className="flex size-[26px] items-center justify-center rounded-md bg-white md:size-7">
            <Image
              src="/images/google.png"
              alt="Google"
              width={18}
              height={18}
              className="size-4 md:size-[18px]"
            />
          </span>
          <span className="text-base font-bold text-white md:text-[17px]">
            使用 Google 帳號登入
          </span>
        </button>
      </form>

      {/* ── 提示文字 ── */}
      {/* 【設計對照】Pencil: hint (BTt1B / nGpYi) */}
      <p className="text-xs text-ink-body md:text-[13px]">
        對，就是你平常用的那個 Google 帳號
      </p>
    </div>
  )
}
