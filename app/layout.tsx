import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TanaAPP v1.0 - AI 社交餐廳平台',
  description: '與阿狸 AI 助手一起探索美味泰式料理的社交平台',
  keywords: ['AI', '餐廳', '泰式料理', '社交平台', 'TanaAPP'],
  authors: [{ name: 'TanaAPP Team' }],
  openGraph: {
    title: 'TanaAPP - AI 社交餐廳平台',
    description: '智能餐廳點餐體驗，適合年輕人與長者',
    type: 'website'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
