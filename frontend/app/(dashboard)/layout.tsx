'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Upload, 
  Mic2, 
  History, 
  LogOut,
  Menu,
  X,
  User,
  Loader2,
  Home
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload Voice', icon: Upload },
  { href: '/generate', label: 'Generate Speech', icon: Mic2 },
  { href: '/history', label: 'History', icon: History },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/')
      return
    }
    fetchUserInfo()
  }, [router])

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else if (response.status === 401) {
        localStorage.removeItem('access_token')
        router.push('/')
      } else {
        setUser({ username: 'User', role: 'user' })
      }
    } catch (error) {
      setUser({ username: 'User', role: 'user' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      setIsLoggingOut(true)
      setTimeout(() => {
        localStorage.removeItem('access_token')
        toast.success('Logged out successfully')
        router.push('/')  // ✅ Go to homepage, not login
        setIsLoggingOut(false)
      }, 500)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        w-64 bg-dark-900 border-r border-dark-800
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-dark-800">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="gradient-primary p-2 rounded-xl">
              <Mic2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">VoiceStudio</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-dark-800">
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.username || 'User'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user?.role === 'admin' 
                        ? 'bg-pink-500/20 text-pink-400' 
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {user?.role || 'user'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {/* Home button */}
                <Link
                  href="/"
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-lg bg-dark-800 text-dark-300 hover:bg-dark-700 transition-colors duration-200 group"
                >
                  <Home className="w-5 h-5 group-hover:text-white transition-colors" />
                  <span className="font-medium group-hover:text-white transition-colors">Home</span>
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                      <span className="font-medium">Sign Out</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}