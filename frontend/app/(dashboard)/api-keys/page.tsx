'use client'

import { Key } from 'lucide-react'

export default function APIKeysPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">API Keys</h1>
        <p className="text-dark-300">
          API Key management is coming soon
        </p>
      </div>

      <div className="glass-effect rounded-xl p-12 text-center">
        <Key className="w-16 h-16 text-dark-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-dark-400">
          API Keys will allow you to programmatically access the TTS service.
        </p>
        <p className="text-dark-400 text-sm mt-2">
          Check back later for this feature.
        </p>
      </div>
    </div>
  )
}