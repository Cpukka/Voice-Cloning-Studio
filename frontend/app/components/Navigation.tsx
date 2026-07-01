'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Upload, Mic2, History, Key, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload Voice', icon: Upload },
  { href: '/generate', label: 'Generate Speech', icon: Mic2 },
  { href: '/history', label: 'History', icon: History },
  { href: '/api-keys', label: 'API Keys', icon: Key },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
              ${isActive 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                : 'text-dark-300 hover:text-white hover:bg-dark-800'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}