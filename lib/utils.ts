import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// 擴展 tailwind-merge，讓它認識專案自訂的 Neobrutalism shadow class
// 預設的 twMerge 不認識 shadow-brutal 等自訂值，
// 會無法正確合併 shadow-xs 和 shadow-brutal（兩者同時存在）
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: ['brutal', 'brutal-sm', 'brutal-hover'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
