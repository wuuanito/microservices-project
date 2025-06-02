// src/services/api.js - MEJORADO para manejar errores de red
import axios from 'axios'

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasToken: !!token,
      headers: config.headers
    })
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data ? 'Present' : 'Empty'
    })
    
    return response.data
  },
  (error) => {
    console.error('❌ API Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    })
    
    // Manejar diferentes tipos de errores
    if (error.response?.status === 401) {
      // Token inválido o expirado
      console.log('🔐 401 Unauthorized - Token issue detected on URL:', error.config?.url);
      // La lógica de AuthContext.jsx se encargará de intentar el refresh y limpiar los datos si es necesario.
      // No se limpia localStorage ni se redirige aquí para permitir que AuthContext maneje el flujo.
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      // Error de timeout
      console.log('⏰ Request timeout - keeping session')
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      // Error de red
      console.log('🌐 Network error - keeping session')
    }
    
    return Promise.reject(error)
  }
)

export default api