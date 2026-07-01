'use client'

import { useState, useEffect } from 'react'
import { ttsAPI, voicesAPI } from '../../lib/api'
import { formatDistanceToNow } from 'date-fns'
import { Play, Download, Trash2, Clock, FileText, Volume2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface HistoryItem {
  id: number
  text: string
  audio_url: string
  duration: number
  created_at: string
  voice_model: {
    id: number
    name: string
  }
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<number | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await ttsAPI.history(100, 0)
      setHistory(response.data)
    } catch (error) {
      console.error('Failed to fetch history', error)
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (id: number, url: string) => {
    if (playingId === id) {
      // Stop playing if already playing
      setPlayingId(null)
      return
    }
    
    setPlayingId(id)
    const audio = new Audio(url)
    audio.play()
    audio.onended = () => setPlayingId(null)
  }

  const handleDownload = async (id: number) => {
    try {
      const response = await ttsAPI.download(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `speech_${id}.wav`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Generation History</h1>
        <p className="text-dark-300">View and manage all your generated speech files</p>
      </div>

      {history.length === 0 ? (
        <div className="glass-effect rounded-xl p-12 text-center">
          <Volume2 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No generations yet</h3>
          <p className="text-dark-400">Start generating speech from the Generate page</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="glass-effect rounded-xl p-6 hover:shadow-xl transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <p className="text-white font-medium line-clamp-2">{item.text}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center space-x-1 text-dark-400">
                      <Volume2 className="w-3 h-3" />
                      <span>Voice: {item.voice_model?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-dark-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.duration.toFixed(1)}s</span>
                    </div>
                    <div className="text-dark-500 text-xs">
                      {formatDistanceToNow(new Date(item.created_at))} ago
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePlay(item.id, item.audio_url)}
                    className={`p-2 rounded-lg transition-colors ${
                      playingId === item.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                    }`}
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(item.id)}
                    className="p-2 rounded-lg bg-dark-700 text-dark-300 hover:bg-dark-600 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}