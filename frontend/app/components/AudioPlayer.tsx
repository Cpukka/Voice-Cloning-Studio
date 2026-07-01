'use client'

import { useState, useRef } from 'react'
import { Play, Pause, Download } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  fileName?: string
}

export function AudioPlayer({ audioUrl, fileName = 'audio.wav' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex items-center space-x-4">
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <button
        onClick={togglePlay}
        className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
      <button
        onClick={handleDownload}
        className="p-3 rounded-full bg-dark-700 text-dark-300 hover:bg-dark-600 transition-colors"
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  )
}