// src/components/Auth/RoleBasedComponent.jsx - NUEVO ARCHIVO
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'

export const RoleBasedComponent = ({ 
  children, 
  allowedRoles = [], 
  allowedDepartments = [], 
  requiredPermission = null,
  fallback = null 
}) => {
  const { user } = useAuth()
  const { canAccess, canManageUsers, canViewReports, canManageSystem } = usePermissions(user)

  if (!user) return fallback

  // Verificar roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return fallback
  }

  // Verificar departamentos
  if (allowedDepartments.length > 0 && !allowedDepartments.includes(user.department)) {
    return fallback
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

    if (!hasPermission) return fallback
  }

  return children
}

export default RoleBasedComponent