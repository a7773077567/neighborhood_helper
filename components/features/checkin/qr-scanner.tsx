'use client'

// ============================================================
// QrScanner — html5-qrcode 封裝（Client Component）
// ============================================================
//
// 【為什麼要封裝？】
// html5-qrcode 直接操作 DOM（建立 <video> 元素），跟 React 的宣告式
// 渲染模型衝突。封裝的目的是把 DOM 操作隔離在 useEffect 裡，
// 對外只暴露 onScan callback。
//
// 【生命週期控制】
// mount → 啟動相機掃描
// unmount → 停止相機、清理 DOM
// 父元件用條件式渲染控制開關：{open && <QrScanner />}
//
// 【onScanRef 技巧】
// Html5Qrcode.start() 綁定的 callback 是一次性的，
// 如果 onScan prop 因 re-render 變了，scanner 不會自動更新。
// 用 useRef 存最新 callback，scanner 回呼時讀 ref.current，
// 確保永遠拿到最新版本。
//
// 【Dynamic Import】
// html5-qrcode 依賴 browser API（navigator.mediaDevices），
// 在 SSR 時會報錯，所以用 dynamic import 延遲到 client 端。
//
// 【設計稿】
// designs/app-shell.pen → "Checkin Page - Mobile (Scanner On)"
// Camera Viewfinder: 黑底 #1A1A1A, cornerRadius 12, height 240
// ============================================================

import { useEffect, useRef, useState } from 'react'

type QrScannerProps = {
  onScan: (decodedText: string) => void
}

const SCANNER_ELEMENT_ID = 'qr-reader'

export function QrScanner({ onScan }: QrScannerProps): React.ReactElement {
  const onScanRef = useRef(onScan)
  const [error, setError] = useState<string | null>(null)

  // ── 保持 callback ref 最新 ──
  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  // ── 啟動 / 停止相機 ──
  useEffect(() => {
    let scanner: import('html5-qrcode').Html5Qrcode | null = null
    let stopped = false

    async function start(): Promise<void> {
      // Dynamic import 避免 SSR 報錯
      const { Html5Qrcode } = await import('html5-qrcode')
      if (stopped)
        return

      scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)

      try {
        await scanner.start(
          { facingMode: 'environment' }, // 後置鏡頭
          {
            fps: 10,
            qrbox: { width: 200, height: 200 },
            // 請求 4:3 比例 + 較低解析度，從源頭降低 video 高度
            // Beta 功能，瀏覽器不保證遵守，搭配外層 overflow-hidden 保底
            videoConstraints: {
              facingMode: { exact: 'environment' },
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          },
          (decodedText) => {
            onScanRef.current(decodedText)
          },
          () => {}, // 每一幀沒掃到 QR 時的回呼，不需要處理
        )
      }
      catch {
        // 相機權限被拒絕或裝置不支援
        if (!stopped) {
          setError('無法開啟相機。請確認已允許相機權限後重新整理頁面。')
        }
      }
    }

    start()

    // cleanup：stop() 是 async，必須等完成才能 clear()
    // 直接連續呼叫會噴 "Cannot clear while scan is ongoing"
    return () => {
      stopped = true
      if (scanner) {
        scanner.stop().then(() => scanner!.clear()).catch(() => {})
      }
    }
  }, [])

  // ── 相機啟動失敗 ──
  if (error) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-xl bg-[#1A1A1A] px-6">
        <p className="text-center text-sm text-white/80">{error}</p>
      </div>
    )
  }

  // ── html5-qrcode 會在這個 div 裡建立 <video> 元素 ──
  // 【高度控制策略】
  // 外層 wrapper：overflow-hidden + maxHeight 裁切視覺高度
  // 內層 scanner：負 marginTop 把 qrbox 掃描框推到可見區域中央
  // ⚠️ 不能在 scanner 容器或 video 上加高度/object-cover（會破壞掃描邏輯）
  return (
    <div style={{ maxHeight: 230, overflow: 'hidden' }} className="rounded-xl">
      <div id={SCANNER_ELEMENT_ID} style={{ marginTop: -150 }} />
    </div>
  )
}
