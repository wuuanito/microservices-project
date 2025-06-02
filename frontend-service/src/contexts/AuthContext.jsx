// src/contexts/AuthContext.jsx - CON SISTEMA DE REFRESH TOKEN
import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Función para intentar renovar el token
  const attemptTokenRefresh = async () => {
    try {
      console.log('🔄 Attempting to refresh token (AuthContext)...');
      const refreshTokenFromStorage = localStorage.getItem('refreshToken');
      
      if (!refreshTokenFromStorage) {
        console.log('❌ No refresh token available in localStorage (AuthContext)');
        return false;
      }

      // authService.refreshToken() internally gets refreshToken from localStorage
      const refreshResponse = await authService.refreshToken(); 
      console.log('✅ Token refresh service call successful (AuthContext). Response:', refreshResponse);
      
      const { token: newToken, refreshToken: newRefreshTokenFromResponse } = refreshResponse;
      
      console.log('🔑 New token received from refresh service (AuthContext):', newToken?.substring(0, 30) + '...');
      localStorage.setItem('token', newToken);
      if (newRefreshTokenFromResponse) {
        console.log('🔄 New refresh token also received (AuthContext):', newRefreshTokenFromResponse?.substring(0, 30) + '...');
        localStorage.setItem('refreshToken', newRefreshTokenFromResponse);
      }
      setToken(newToken); // Update React state
      
      return true;
    } catch (error) {
      console.error('❌ Token refresh attempt failed (AuthContext):', error.message);
      return false;
    }
  };

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      console.log('🔍 Auth check on load:', {
        hasToken: !!savedToken,
        hasUser: !!savedUser,
        hasRefreshToken: !!localStorage.getItem('refreshToken')
      })
      
      if (savedToken) {
        try {
          // Intentar verificar el token actual
          console.log('📡 Verifying current token...')
          setToken(savedToken)
          
          const userData = await authService.getProfile()
          console.log('✅ Token is valid, user authenticated')
          
          setUser(userData)
          
          // Actualizar datos del usuario en localStorage
          localStorage.setItem('user', JSON.stringify(userData))
          
        } catch (error) {
          console.log('⚠️ Current token invalid, attempting refresh...')
          
          // Si el token actual falló, intentar refresh
          const refreshSuccessful = await attemptTokenRefresh()
          
          if (refreshSuccessful) {
            // Intentar obtener el perfil con el nuevo token
            console.log('🔍 Token in localStorage before 2nd getProfile (AuthContext):', localStorage.getItem('token')?.substring(0, 30) + '...');
            try {
              const userData = await authService.getProfile()
              console.log('✅ Token refreshed and user authenticated (AuthContext)')
              
              setUser(userData)
              localStorage.setItem('user', JSON.stringify(userData))
            } catch (profileError) {
              console.error('❌ Failed to get profile after refresh (AuthContext.jsx line ~91)', {
                message: profileError.message,
                tokenUsedInFailedRequest: profileError.isAxiosError ? profileError.config?.headers?.Authorization?.substring(0, 40) + '...' : 'N/A',
                localStorageTokenAtThisPoint: localStorage.getItem('token')?.substring(0, 40) + '...',
                errorObject: profileError
              });
              clearAuthData()
            }
          } else {
            // Si el refresh también falló, usar datos guardados temporalmente
            if (savedUser) {
              try {
                const cachedUser = JSON.parse(savedUser)
                console.log('🔄 Using cached user data temporarily')
                setUser(cachedUser)
                setToken(savedToken) // Mantener el token para intentos posteriores
              } catch (parseError) {
                console.error('❌ Failed to parse cached user data')
                clearAuthData()
              }
            } else {
              console.log('❌ No cached data available, clearing auth')
              clearAuthData()
            }
          }
        }
      } else {
        console.log('❌ No token found')
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  // Función para limpiar datos de autenticación
  const clearAuthData = () => {
    console.log('🧹 Clearing all auth data')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const login = async (credentials) => {
    try {
      console.log('🚀 Starting login...')
      const response = await authService.login(credentials)
      
      const { token: newToken, user: userData, refreshToken } = response
      
      if (!newToken || !userData) {
        throw new Error('Respuesta de login inválida')
      }
      
      console.log('💾 Saving login data...')
      
      // Guardar todo en localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      
      // Actualizar estado
      setToken(newToken)
      setUser(userData)
      
      console.log('✅ Login completed successfully')
      
      return { success: true }
    } catch (error) {
      console.error('❌ Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Error de autenticación' 
      }
    }
  }

  const logout = () => {
    console.log('👋 Logging out...')
    clearAuthData()
    console.log('✅ Logout completed')
  }

  // Sistema de auto-refresh del token
  useEffect(() => {
    if (!token || !user) return

    // Configurar refresh automático cada 30 minutos
    const refreshInterval = setInterval(async () => {
      console.log('⏰ Auto-refresh token check...')
      await attemptTokenRefresh()
    }, 30 * 60 * 1000) // 30 minutos

    return () => clearInterval(refreshInterval)
  }, [token, user])

  const isAuthenticated = !!token && !!user

  console.log('🔐 AuthContext state:', {
    hasUser: !!user,
    hasToken: !!token,
    isAuthenticated,
    loading,
    userName: user?.username || 'N/A'
  })

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    attemptTokenRefresh // Exponer para uso manual si es necesario
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}