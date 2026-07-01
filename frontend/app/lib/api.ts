import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - FIXED: Only logout on 401, not 404
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 (Unauthorized)
    // 404 means endpoint doesn't exist - don't logout
    if (error.response?.status === 401) {
      console.warn('🔒 401 Unauthorized - logging out')
      localStorage.removeItem('access_token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 404) {
      console.warn('⚠️ 404 Not Found - endpoint may not exist yet')
      // Don't logout, just show a warning
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data: { email: string; username: string; password: string }) => 
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) => 
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

// Voices API
export const voicesAPI = {
  upload: (formData: FormData) => 
    api.post('/voices/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  list: () => api.get('/voices'),
  get: (id: number) => api.get(`/voices/${id}`),
  delete: (id: number) => api.delete(`/voices/${id}`),
  clone: (id: number) => api.post(`/voices/${id}/clone`, {}),
}

// TTS API
export const ttsAPI = {
  generate: (data: { text: string; voice_id: number; speed: number }) => 
    api.post('/tts/generate', data),
  history: (limit: number = 50, offset: number = 0) => 
    api.get('/tts/history', { params: { limit, offset } }),
  download: (id: number) => 
    api.get(`/tts/download/${id}`, { responseType: 'blob' }),
}

// API Keys API - COMMENTED OUT temporarily until backend endpoints exist
export const apiKeysAPI = {
  create: (data: { name: string }) => {
    console.warn('⚠️ API Keys endpoint not implemented yet')
    return Promise.reject({ response: { status: 404 } })
  },
  list: () => {
    console.warn('⚠️ API Keys endpoint not implemented yet')
    return Promise.reject({ response: { status: 404 } })
  },
  revoke: (id: number) => {
    console.warn('⚠️ API Keys endpoint not implemented yet')
    return Promise.reject({ response: { status: 404 } })
  },
}

export default api