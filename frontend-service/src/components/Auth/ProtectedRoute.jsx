// src/components/Auth/ProtectedRoute.jsx - MEJORADO para F5
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import Loading from '../Common/Loading'

const ProtectedRoute = ({ 
  children, 
  requiredPermission = null, 
  requiredRole = null, 
  requiredDepartment = null 
}) => {
  const { isAuthenticated, loading, user, token } = useAuth()
  
  // Extraer el usuario correctamente
  let userObject = null
  
  if (user && typeof user === 'object') {
    if (user.data && typeof user.data === 'object') {
      userObject = user.data
    } else if (user.username || user.id) {
      userObject = user
    }
  }
  
  const { canAccess, canManageUsers, canViewReports, canManageSystem } = usePermissions(userObject)

  console.log('🛡️ ProtectedRoute state:', {
    loading,
    hasToken: !!token,
    hasUser: !!user,
    isAuthenticated,
    userValid: !!(userObject?.username),
    username: userObject?.username,
    requiredPermission,
    requiredRole,
    requiredDepartment
  })

  // IMPORTANTE: Mostrar loading mientras se verifica la autenticación
  if (loading) {
    console.log('⏳ Still loading, showing loading screen...')
    return <Loading message="Verificando sesión..." />
  }

  // Si hay token pero no usuario, intentar cargar (puede ser F5)
  if (token && !user) {
    console.log('🔄 Token exists but no user data, showing loading...')
    return <Loading message="Cargando datos del usuario..." />
  }

  // Redirigir a login solo si definitivamente no está autenticado
  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Si no hay objeto de usuario válido después del loading
  if (!userObject || !userObject.username) {
    console.log('🚫 Invalid user object after loading, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Verificar rol específico si se requiere
  if (requiredRole && userObject?.role !== requiredRole) {
    console.log(`🚫 Role mismatch: required ${requiredRole}, has ${userObject?.role}`)
    return <AccessDenied reason={`Se requiere rol: ${requiredRole}`} userObject={userObject} />
  }

  // Verificar departamento específico si se requiere
  if (requiredDepartment && userObject?.department !== requiredDepartment) {
    console.log(`🚫 Department mismatch: required ${requiredDepartment}, has ${userObject?.department}`)
    return <AccessDenied reason={`Se requiere departamento: ${requiredDepartment}`} userObject={userObject} />
  }

  // Verificar permisos específicos
  if (requiredPermission) {
    let hasPermission = false

    switch (requiredPermission) {
      case 'manage_users':
        hasPermission = canManageUsers()
        break
      case 'view_reports':
        hasPermission = canViewReports()
        break
      case 'manage_system':
        hasPermission = canManageSystem()
        break
      default:
        hasPermission = canAccess(requiredPermission)
    }

    console.log(`🔒 Permission check for '${requiredPermission}': ${hasPermission}`)

    if (!hasPermission) {
      return <AccessDenied reason={`No tienes permisos para: ${requiredPermission}`} userObject={userObject} />
    }
  }

  console.log('✅ Access granted to:', userObject.username)
  return children
}

// Componente para mostrar acceso denegado
const AccessDenied = ({ reason = "No tienes permisos para acceder a esta página", userObject }) => {
  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 text-center">
          <div className="card border-warning">
            <div className="card-body">
              <i className="bi bi-shield-exclamation text-warning" style={{fontSize: '4rem'}}></i>
              <h2 className="mt-3 text-warning">Acceso Denegado</h2>
              <p className="text-muted mb-4">{reason}</p>
              
              <div className="alert alert-info">
                <strong>Tu información actual:</strong><br />
                <small>
                  Usuario: {userObject?.username || 'N/A'}<br />
                  Rol: {userObject?.role || 'N/A'}<br />
                  Departamento: {userObject?.department || 'N/A'}
                </small>
              </div>

              <div className="d-flex gap-2 justify-content-center">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.history.back()}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver
                </button>
                <a href="/dashboard" className="btn btn-outline-primary">
                  <i className="bi bi-house me-2"></i>
                  Ir al Dashboard
                </a>
              </div>

              <div className="mt-4">
                <small className="text-muted">
                  Si crees que esto es un error, contacta al administrador del sistema.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProtectedRoute