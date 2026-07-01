'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { voicesAPI, ttsAPI } from '../../lib/api'
import { 
  Mic, 
  Clock, 
  Volume2, 
  TrendingUp,
  Plus,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const [voices, setVoices] = useState<any[]>([])
  const [recentGenerations, setRecentGenerations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
    } else {
      fetchDashboardData()
    }
  }, [router])

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching dashboard data...')
      
      // Try to fetch voices
      let voicesData = []
      try {
        const voicesRes = await voicesAPI.list()
        voicesData = voicesRes.data || []
        console.log('✅ Voices loaded:', voicesData.length)
      } catch (voiceError: any) {
        // If voices endpoint fails (404), just use empty array
        console.warn('⚠️ Could not load voices:', voiceError.response?.status)
        voicesData = []
      }
      
      // Try to fetch history
      let historyData = []
      try {
        const historyRes = await ttsAPI.history(5, 0)
        historyData = historyRes.data || []
        console.log('✅ History loaded:', historyData.length)
      } catch (historyError: any) {
        // If history endpoint fails (404), just use empty array
        console.warn('⚠️ Could not load history:', historyError.response?.status)
        historyData = []
      }
      
      setVoices(voicesData)
      setRecentGenerations(historyData)
      
    } catch (error: any) {
      console.error('❌ Failed to fetch dashboard data:', error)
      // Don't logout on 404 errors
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token')
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-dark-300 mt-4">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const totalDuration = recentGenerations.reduce((acc, curr) => acc + (curr.duration || 0), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-300 mt-1">Welcome to your Voice Cloning Studio</p>
        </div>
        <Link
          href="/upload"
          className="gradient-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Voice</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-dark-300">Voice Models</h3>
            <Mic className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{voices.length}</p>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-dark-300">Generations</h3>
            <Volume2 className="w-5 h-5 text-pink-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{recentGenerations.length}</p>
        </div>
        
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-dark-300">Total Duration</h3>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{Math.floor(totalDuration / 60)}m {totalDuration % 60}s</p>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-dark-300">Quick Actions</h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <Link href="/generate" className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block">
            Generate Speech →
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/generate"
          className="glass-effect rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Generate Speech</h3>
              <p className="text-dark-300 text-sm">Convert text to speech with your cloned voice</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
              <ArrowRight className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Link>

        <Link
          href="/upload"
          className="glass-effect rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Upload Voice</h3>
              <p className="text-dark-300 text-sm">Clone a new voice from your audio samples</p>
            </div>
            <div className="p-3 rounded-xl bg-pink-500/20 group-hover:bg-pink-500/30 transition-colors">
              <Plus className="w-6 h-6 text-pink-400" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Generations */}
      <div className="glass-effect rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Generations</h2>
        {recentGenerations.length === 0 ? (
          <div className="text-center py-8">
            <Volume2 className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No generations yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentGenerations.map((gen: any) => (
              <div key={gen.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">{gen.text}</p>
                  <p className="text-xs text-dark-400 mt-1">
                    {new Date(gen.created_at).toLocaleDateString()} • {gen.duration}s
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}