import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Voice Cloning Studio',
  description: 'Professional AI Voice Cloning and Text-to-Speech Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}