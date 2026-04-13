import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HR 驾驶舱',
  description: 'CBG 人力驾驶舱',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-900 text-white">{children}</body>
    </html>
  )
}