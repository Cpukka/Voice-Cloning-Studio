'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { voicesAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import { Upload, Mic, FileAudio, X, Loader2 } from 'lucide-react'

interface UploadForm {
  name: string
  description: string
  isPublic: boolean
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UploadForm>()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const audioFile = acceptedFiles[0]
    if (audioFile) {
      // Validate file type
      const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3']
      if (!validTypes.includes(audioFile.type)) {
        toast.error('Please upload a valid audio file (WAV or MP3)')
        return
      }
      
      // Validate file size (max 50MB)
      if (audioFile.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB')
        return
      }
      
      setFile(audioFile)
      toast.success(`File "${audioFile.name}" loaded successfully!`)
      console.log('File loaded:', audioFile.name, audioFile.size, audioFile.type)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/wav': ['.wav'],
      'audio/mpeg': ['.mp3'],
      'audio/mp3': ['.mp3']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const onSubmit = async (data: UploadForm) => {
    console.log('Form submitted!', data)
    console.log('File:', file)
    
    if (!file) {
      toast.error('Please select an audio file')
      console.error('No file selected')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('file', file)
    if (data.description) formData.append('description', data.description)
    formData.append('is_public', String(data.isPublic))

    // Log FormData contents
    console.log('FormData entries:')
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1])
    }

    try {
      console.log('Sending upload request...')
      const response = await voicesAPI.upload(formData)
      console.log('Upload response:', response)
      
      toast.success('Voice uploaded successfully! Processing will take a few minutes.')
      setFile(null)
      reset()
      
      // Reset form fields
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
      if (nameInput) nameInput.value = ''
      const descInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement
      if (descInput) descInput.value = ''
      
      setUploadProgress(100)
      setTimeout(() => setUploadProgress(0), 3000)
      
    } catch (error: any) {
      console.error('Upload error:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      
      toast.error(error.response?.data?.detail || 'Upload failed. Please try again.')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    toast.info('File removed')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Upload Voice Sample</h1>
        <p className="text-dark-300">
          Upload a clear audio recording (3-30 seconds) for voice cloning
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-dark-700 bg-dark-800/50 hover:border-dark-600 hover:bg-dark-800/70'
              }
              ${file ? 'border-green-500 bg-green-500/5' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {file ? (
              <div className="flex flex-col items-center">
                <FileAudio className="w-16 h-16 text-green-400 mb-4" />
                <p className="text-white font-semibold">{file.name}</p>
                <p className="text-sm text-dark-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <p className="text-xs text-green-400 mt-2">✓ File ready for upload</p>
              </div>
            ) : (
              <>
                <Upload className="w-16 h-16 text-dark-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-purple-400 font-semibold">Drop your audio file here</p>
                ) : (
                  <>
                    <p className="text-dark-300 mb-2 font-semibold">Drag & drop your audio file here</p>
                    <p className="text-sm text-dark-500">or click to browse</p>
                  </>
                )}
                <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-dark-400">
                  <span className="px-3 py-1 bg-dark-800 rounded-full">🎵 WAV, MP3</span>
                  <span className="px-3 py-1 bg-dark-800 rounded-full">⏱️ 3-30 seconds</span>
                  <span className="px-3 py-1 bg-dark-800 rounded-full">📦 Max 50MB</span>
                </div>
              </>
            )}
          </div>

          {file && (
            <div className="mt-4 p-4 bg-dark-800 rounded-lg border border-green-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileAudio className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-xs text-dark-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Unknown format'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-dark-400 hover:text-red-400" />
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-dark-400 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 glass-effect rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Mic className="w-5 h-5 mr-2 text-purple-400" />
              Tips for Best Results
            </h3>
            <ul className="space-y-2 text-dark-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Use a quiet environment with minimal background noise
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Speak clearly at a natural pace
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Record 5-10 seconds of speech for optimal quality
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                Avoid overlapping voices or music in the background
              </li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Voice Name *
            </label>
            <input
              {...register('name', { 
                required: 'Voice name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white transition-all"
              placeholder="e.g., My Voice"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white resize-none transition-all"
              placeholder="Describe this voice..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              {...register('isPublic')}
              className="w-4 h-4 text-purple-600 bg-dark-800 border-dark-700 rounded focus:ring-purple-500"
              id="isPublic"
            />
            <label htmlFor="isPublic" className="text-sm text-dark-300">
              Make this voice public for other users
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full gradient-primary text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading & Cloning Voice...</span>
              </div>
            ) : (
              'Upload & Clone Voice'
            )}
          </button>

          {!file && (
            <p className="text-center text-xs text-dark-500">
              Please select an audio file first
            </p>
          )}
        </form>
      </div>
    </div>
  )
}