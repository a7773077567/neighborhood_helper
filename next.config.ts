import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 【改造】允許 Next.js Image 載入 Google OAuth 大頭照
  // Google 個人照片託管在 lh3.googleusercontent.com
  // 不加這個設定，<Image src="https://lh3.googleusercontent.com/..." /> 會報錯
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

export default nextConfig
