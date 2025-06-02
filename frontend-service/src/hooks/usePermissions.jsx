// src/hooks/usePermissions.js - VERSIÓN CON DEBUG ADICIONAL
import { useMemo } from 'react'

// Definir roles
export const ROLES = {
  DIRECTOR: 'director',
  ADMINISTRADOR: 'administrador', 
  EMPLEADO: 'empleado'
}

// Definir departamentos
export const DEPARTMENTS = {
  INFORMATICA: 'informatica',
  ADMINISTRACION: 'administracion',
  INTERNACIONAL: 'internacional',
  COMPRAS: 'compras',
  GERENCIA: 'gerencia',
  OFICINA_TECNICA: 'oficina_tecnica',
  CALIDAD: 'calidad',
  LABORATORIO: 'laboratorio',
  RRHH: 'rrhh',
  LOGISTICA: 'logistica',  // ← TU DEPARTAMENTO
  MANTENIMIENTO: 'mantenimiento',
  SOFTGEL: 'softgel',
  PRODUCCION: 'produccion',
  SIN_DEPARTAMENTO: 'sin_departamento'
}

// Definir permisos por rol
export const ROLE_PERMISSIONS = {
  [ROLES.DIRECTOR]: {
    canViewAll: true,
    canManageUsers: true,
    canManageSystem: true,
    canViewReports: true,
    canViewFinances: true,
    departments: 'all'
  },
  [ROLES.ADMINISTRADOR]: {
    canViewAll: false,
    canManageUsers: true,
    canManageSystem: true,
    canViewReports: true,
    canViewFinances: false,
    departments: 'all'
  },
  [ROLES.EMPLEADO]: {  // ← TU ROL
    canViewAll: false,
    canManageUsers: false,
    canManageSystem: false,
    canViewReports: false,
    canViewFinances: false,
    departments: 'own'
  }
}

// Definir menús por departamento
export const DEPARTMENT_MENUS = {
  [DEPARTMENTS.INFORMATICA]: [
    'calendar', 'profile', 'sistemas', 'infraestructura', 'soporte_tecnico', 'seguridad_ti'
  ],
  [DEPARTMENTS.ADMINISTRACION]: [
    'calendar', 'profile', 'contabilidad', 'facturacion', 'proveedores', 'documentos'
  ],
  [DEPARTMENTS.LOGISTICA]: [  // ← ESTOS SON TUS MENÚS
    'calendar', 'profile', 'almacen', 'inventario', 'distribucion', 'transporte'
  ],
  [DEPARTMENTS.PRODUCCION]: [
    'calendar', 'profile', 'ordenes_produccion', 'planificacion', 'control_proceso', 'rendimientos'
  ],
  [DEPARTMENTS.CALIDAD]: [
    'calendar', 'profile', 'control_calidad', 'auditorias', 'certificaciones', 'no_conformidades'
  ],
  [DEPARTMENTS.RRHH]: [
    'calendar', 'profile', 'empleados', 'nominas', 'capacitacion', 'evaluaciones'
  ],
  [DEPARTMENTS.MANTENIMIENTO]: [
    'calendar', 'profile', 'ordenes_trabajo', 'equipos', 'preventivo', 'correctivo'
  ],
  [DEPARTMENTS.SIN_DEPARTAMENTO]: [
    'calendar', 'profile'
  ]
}

// Hook para verificar permisos
export const usePermissions = (user) => {
  return useMemo(() => {
    console.log('🔍 usePermissions called with user:', {
      user,
      userType: typeof user,
      username: user?.username,
      role: user?.role,
      department: user?.department
    })

    if (!user) {
      console.log('❌ No user provided to usePermissions')
      return { 
        canAccess: () => false, 
        getAvailableMenus: () => [],
        canManageUsers: () => false,
        canViewReports: () => false,
        canManageSystem: () => false,
        rolePermissions: {},
        departmentMenus: []
      }
    }

    const rolePermissions = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS[ROLES.EMPLEADO]
    const departmentMenus = DEPARTMENT_MENUS[user.department] || DEPARTMENT_MENUS[DEPARTMENTS.SIN_DEPARTAMENTO]

    console.log('👤 User permissions calculated:', {
      role: user.role,
      department: user.department,
      rolePermissions,
      departmentMenus,
      departmentExists: !!DEPARTMENT_MENUS[user.department]
    })

    const canAccess = (resource) => {
      console.log(`🔒 Checking access to: ${resource}`)
      
      // Director puede acceder a todo
      if (user.role === ROLES.DIRECTOR) {
        console.log('✅ Director access granted')
        return true
      }
      
      // Administrador puede acceder a la mayoría de cosas
      if (user.role === ROLES.ADMINISTRADOR) {
        const adminRestricted = ['finanzas', 'salarios', 'presupuestos_confidenciales']
        const hasAccess = !adminRestricted.includes(resource)
        console.log(`🔧 Admin access: ${hasAccess}`)
        return hasAccess
      }

      // Empleados solo pueden acceder a su departamento
      const hasAccess = departmentMenus.includes(resource)
      console.log(`👷 Employee access to '${resource}': ${hasAccess} (available: ${departmentMenus.join(', ')})`)
      return hasAccess
    }

    const getAvailableMenus = () => {
      let menus = []
      
      if (user.role === ROLES.DIRECTOR) {
        // Director ve todos los menús
        menus = Object.values(DEPARTMENT_MENUS).flat().filter((item, index, arr) => arr.indexOf(item) === index)
        console.log('🏆 Director menus:', menus)
      } else if (user.role === ROLES.ADMINISTRADOR) {
        // Administrador ve la mayoría de menús
        const allMenus = Object.values(DEPARTMENT_MENUS).flat().filter((item, index, arr) => arr.indexOf(item) === index)
        const restrictedMenus = ['salarios', 'presupuestos_confidenciales']
        menus = allMenus.filter(menu => !restrictedMenus.includes(menu))
        console.log('🔧 Admin menus:', menus)
      } else {
        // Empleados solo ven los menús de su departamento
        menus = departmentMenus
        console.log(`👷 Employee menus for department '${user.department}':`, menus)
      }
      
      return menus
    }

    const canManageUsers = () => rolePermissions.canManageUsers
    const canViewReports = () => rolePermissions.canViewReports
    const canManageSystem = () => rolePermissions.canManageSystem

    const result = {
      canAccess,
      getAvailableMenus,
      canManageUsers,
      canViewReports,
      canManageSystem,
      rolePermissions,
      departmentMenus
    }

    console.log('🎯 usePermissions final result:', {
      availableMenus: getAvailableMenus(),
      canManageUsers: canManageUsers(),
      canViewReports: canViewReports(),
      canManageSystem: canManageSystem()
    })
    
    return result
  }, [user])
}