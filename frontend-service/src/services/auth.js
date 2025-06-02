// src/services/auth.js - CORREGIR refreshToken
import api from './api'

export const authService = {
  // Login de usuario
  login: async (credentials) => {
    try {
      console.log('📡 Sending login request:', credentials)
      const response = await api.post('/auth/login', credentials)
      console.log('📦 Login response:', response)
      
      if (response.status === 200 && response.data) {
        const { user, accessToken, refreshToken } = response.data
        
        if (!accessToken || !user) {
          throw new Error('Respuesta inválida del servidor - faltan datos')
        }
        
        console.log('✅ Login data extracted:', { user, hasToken: !!accessToken })
        
        return {
          token: accessToken,
          user: user,
          refreshToken: refreshToken
        }
      } else {
        throw new Error(response.message || 'Error en el login')
      }
    } catch (error) {
      console.error('❌ Error en login:', error)
      throw error
    }
  },

  // Registro de usuario
  register: async (userData) => {
    try {
      console.log('📡 Sending register request:', userData)
      const response = await api.post('/auth/register', userData)
      console.log('📦 Register response:', response)
      
      if (response.status === 201 && response.data) {
        const { user, accessToken, refreshToken } = response.data
        return {
          token: accessToken,
          user: user,
          refreshToken: refreshToken
        }
      }
      
      return response
    } catch (error) {
      console.error('❌ Error en register:', error)
      throw error
    }
  },

  // Obtener perfil del usuario (para verificar token)
  getProfile: async () => {
    try {
      console.log('📡 Fetching user profile (authService.getProfile)...')
      const userData = await api.get('/auth/profile') // userData is the direct payload due to api.js interceptor
      console.log('📦 Profile response data (authService.getProfile):', userData)

      if (userData && typeof userData === 'object' && userData.id) { // Basic check for a valid user object
        console.log('✅ Profile data seems valid (authService.getProfile):', userData)
        return userData
      } else {
        console.error('❌ Invalid or empty user data received from profile endpoint (authService.getProfile):', userData)
        throw new Error('Invalid or empty user data received from profile endpoint')
      }
    } catch (error) {
      console.error('❌ Error in authService.getProfile:', error.message)
      if (error.isAxiosError && error.response) {
        console.error('❌ Axios error details (authService.getProfile):', {
          status: error.response.status,
          data: error.response.data,
        })
      }
      throw error // Re-throw to be caught by AuthContext
    }
  },

  // Refresh token - CORREGIDO
  refreshToken: async () => {
    try {
      console.log('📡 Refreshing token...')
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      // IMPORTANTE: Usar la ruta correcta del backend
      const backendResponsePayload = await api.post('/auth/refresh-token', { refreshToken })
      console.log('📦 Refresh response payload:', backendResponsePayload)
      
      // backendResponsePayload es el cuerpo de la respuesta del backend debido al interceptor en api.js
      if (backendResponsePayload && backendResponsePayload.accessToken) {
        const { accessToken, refreshToken: newRefreshToken } = backendResponsePayload;
        return {
          token: accessToken,
          // Si el backend no devuelve un nuevo refresh token, reutilizamos el que ya teníamos en localStorage.
          refreshToken: newRefreshToken || localStorage.getItem('refreshToken') 
        };
      } else {
        // Si la respuesta no tiene la estructura esperada (ej. no hay accessToken)
        console.error('❌ Refresh token response structure incorrect:', backendResponsePayload);
        throw new Error('Invalid response structure from refresh token endpoint');
      }
    } catch (error) {
      console.error('❌ Error refreshing token:', error)
      throw error
    }
  },

  // Logout
  logout: async () => {
    try {
      console.log('📡 Logging out...')
      const refreshToken = localStorage.getItem('refreshToken')
      
      const response = await api.post('/auth/logout', { refreshToken })
      console.log('📦 Logout response:', response)
      
      return response
    } catch (error) {
      console.warn('⚠️ Error al hacer logout en el servidor:', error)
      return null
    }
  }
}