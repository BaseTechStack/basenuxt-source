// Import getActivePinia to check if Pinia is initialized
import { getActivePinia } from 'pinia'
import { useAuthStore } from '../stores/authStore'

// Use relative API path for Nuxt server routes
const API_URL = 'http://localhost:8001/api'

export const useApi = () => {
  // Only use authStore if we're in a component or if Pinia is initialized
  // This prevents the "no active Pinia" error
  const getAuthStore = () => {
    if (process.client && !getActivePinia()) {
      console.warn('No active Pinia instance found when accessing authStore in useApi')
      return { logout: async () => console.warn('Cannot logout: No active Pinia') }
    }
    return useAuthStore()
  }

  const handleResponse = async (response: Response) => {
    if (response.status === 401) {
      console.log('[API] Received 401 response, logging out')
      const authStore = getAuthStore()
      await authStore.logout()
      return null
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    console.log('API request to:', endpoint, 'with options:', options)
    const token = localStorage.getItem('auth_token')
    const url = `${API_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-API-KEY': 'api',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }

    try {
      console.log('Fetching from URL:', url)
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      })

      console.log('Response received from API:', response.status, response.statusText)
      return handleResponse(response)
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  }

  return {
    get: (endpoint: string) => fetchWithAuth(endpoint),
    post: (endpoint: string, data: any) => fetchWithAuth(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    put: (endpoint: string, data: any) => fetchWithAuth(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (endpoint: string) => fetchWithAuth(endpoint, {
      method: 'DELETE'
    })
  }
}
