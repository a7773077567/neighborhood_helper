'use client'

// ============================================================
// QrCodeDisplay — QR Code 顯示元件（Client Component）
// ============================================================
//
// 【用途】
// 已報名的使用者在活動詳情頁看到自己的簽到 QR Code
// 活動現場出示給工作人員掃描即可完成簽到
//
// 【為什麼是 Client Component？】
// qrcode.react 的 QRCodeSVG 需要在瀏覽器端渲染
//
// 【設計稿】
// designs/app-shell.pen → "QR Code Display - Registered State"
// 180×180 白底方框 + 黑邊框 + 提示文字
// ============================================================

import { QRCodeSVG } from 'qrcode.react'

type QrCodeDisplayProps = {
  qrToken: string
}

export function QrCodeDisplay({ qrToken }: QrCodeDisplayProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code Box — 180×180 白底方框，對應設計稿 "QR Code Box" */}
      <div className="flex size-[180px] items-center justify-center rounded-lg border-2 border-ink-primary bg-white">
        <QRCodeSVG value={qrToken} size={148} level="M" />
      </div>
      {/* 提示文字 */}
      <p className="text-center text-[13px] text-ink-secondary">
        請在活動現場出示此 QR Code
      </p>
    </div>
  )
}
