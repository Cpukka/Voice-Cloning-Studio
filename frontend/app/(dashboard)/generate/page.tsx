'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { voicesAPI, ttsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import { Volume2, Play, Download, Loader2, Settings } from 'lucide-react'

interface GenerateForm {
  text: string
  voiceId: number
  speed: number
}

export default function GeneratePage() {
  const [voices, setVoices] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<any>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<GenerateForm>({
    defaultValues: { speed: 1.0 }
  })

  const selectedVoiceId = watch('voiceId')

  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    try {
      const response = await voicesAPI.list()
      setVoices(response.data.filter((v: any) => v.status === 'ready'))
    } catch (error) {
      console.error('Failed to fetch voices', error)
    }
  }

  const onSubmit = async (data: GenerateForm) => {
    if (!data.text.trim()) {
      toast.error('Please enter some text to generate speech')
      return
    }

    setGenerating(true)
    setGeneratedAudio(null)
    setAudioUrl(null)

    try {
      const response = await ttsAPI.generate({
        text: data.text,
        voice_id: parseInt(String(data.voiceId)),
        speed: data.speed
      })
      
      setGeneratedAudio(response.data)
      setAudioUrl(response.data.audio_url)
      toast.success('Speech generated successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handlePlay = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  const handleDownload = () => {
    if (audioUrl) {
      window.open(audioUrl, '_blank')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Generate Speech</h1>
        <p className="text-dark-300">Convert text to speech using your cloned voices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Select Voice *
            </label>
            <select
              {...register('voiceId', { required: 'Please select a voice' })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            >
              <option value="">Select a voice model</option>
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} {voice.is_public ? '(Public)' : '(Private)'}
                </option>
              ))}
            </select>
            {errors.voiceId && (
              <p className="mt-1 text-sm text-red-500">{errors.voiceId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Text to Convert *
            </label>
            <textarea
              {...register('text', { 
                required: 'Text is required',
                maxLength: { value: 5000, message: 'Text too long (max 5000 chars)' }
              })}
              rows={6}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white resize-none"
              placeholder="Enter the text you want to convert to speech..."
            />
            {errors.text && (
              <p className="mt-1 text-sm text-red-500">{errors.text.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Speed: {watch('speed')}x
            </label>
            <input
              type="range"
              {...register('speed')}
              min="0.5"
              max="2.0"
              step="0.1"
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={generating || voices.length === 0}
            className="w-full gradient-primary text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Speech...</span>
              </div>
            ) : (
              'Generate Speech'
            )}
          </button>
        </form>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="glass-effect rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Volume2 className="w-5 h-5 mr-2 text-purple-400" />
              Audio Preview
            </h3>
            
            {generatedAudio ? (
              <div className="space-y-4">
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-sm text-dark-300 mb-3">
                    <span className="text-purple-400">Duration:</span> {generatedAudio.duration.toFixed(1)}s
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handlePlay}
                      className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Play</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center space-x-2 bg-dark-700 hover:bg-dark-600 text-white py-2 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-dark-800 rounded-lg p-4">
                  <p className="text-xs text-dark-400 mb-1">Generated Text:</p>
                  <p className="text-sm text-dark-200 line-clamp-3">{watch('text')}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Volume2 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400">Your generated speech will appear here</p>
              </div>
            )}
          </div>

          {voices.length === 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                No voice models available. Please upload a voice sample first.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}