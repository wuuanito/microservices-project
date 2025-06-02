// src/hooks/usePermissions.js - CREAR ESTE ARCHIVO NUEVO
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
  LOGISTICA: 'logistica',
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
  [ROLES.EMPLEADO]: {
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
    'dashboard',
    'profile',
    'sistemas',
    'infraestructura',
    'soporte_tecnico',
    'seguridad_ti'
  ],
  [DEPARTMENTS.ADMINISTRACION]: [
    'dashboard',
    'profile',
    'contabilidad',
    'facturacion',
    'proveedores',
    'documentos'
  ],
  [DEPARTMENTS.INTERNACIONAL]: [
    'dashboard',
    'profile',
    'exportaciones',
    'importaciones',
    'aduanas',
    'logistica_internacional'
  ],
  [DEPARTMENTS.COMPRAS]: [
    'dashboard',
    'profile',
    'ordenes_compra',
    'proveedores',
    'inventario',
    'cotizaciones'
  ],
  [DEPARTMENTS.GERENCIA]: [
    'dashboard',
    'profile',
    'reportes_gerenciales',
    'kpis',
    'presupuestos',
    'estrategia'
  ],
  [DEPARTMENTS.OFICINA_TECNICA]: [
    'dashboard',
    'profile',
    'proyectos',
    'diseno',
    'especificaciones',
    'documentacion_tecnica'
  ],
  [DEPARTMENTS.CALIDAD]: [
    'dashboard',
    'profile',
    'control_calidad',
    'auditorias',
    'certificaciones',
    'no_conformidades'
  ],
  [DEPARTMENTS.LABORATORIO]: [
    'dashboard',
    'profile',
    'analisis',
    'muestras',
    'equipos_lab',
    'protocolos'
  ],
  [DEPARTMENTS.RRHH]: [
    'dashboard',
    'profile',
    'empleados',
    'nominas',
    'capacitacion',
    'evaluaciones'
  ],
  [DEPARTMENTS.LOGISTICA]: [
    'dashboard',
    'profile',
    'almacen',
    'inventario',
    'distribucion',
    'transporte'
  ],
  [DEPARTMENTS.MANTENIMIENTO]: [
    'dashboard',
    'profile',
    'ordenes_trabajo',
    'equipos',
    'preventivo',
    'correctivo'
  ],
  [DEPARTMENTS.SOFTGEL]: [
    'dashboard',
    'profile',
    'produccion_softgel',
    'encapsulacion',
    'control_proceso',
    'lotes'
  ],
  [DEPARTMENTS.PRODUCCION]: [
    'dashboard',
    'profile',
    'ordenes_produccion',
    'planificacion',
    'control_proceso',
    'rendimientos'
  ],
  [DEPARTMENTS.SIN_DEPARTAMENTO]: [
    'dashboard',
    'profile'
  ]
}

// Hook para verificar permisos
export const usePermissions = (user) => {
  return useMemo(() => {
    if (!user) {
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

    const canAccess = (resource) => {
      // Director puede acceder a todo
      if (user.role === ROLES.DIRECTOR) return true
      
      // Administrador puede acceder a la mayoría de cosas
      if (user.role === ROLES.ADMINISTRADOR) {
        const adminRestricted = ['finanzas', 'salarios', 'presupuestos_confidenciales']
        return !adminRestricted.includes(resource)
      }

      // Empleados solo pueden acceder a su departamento
      return departmentMenus.includes(resource)
    }

    const getAvailableMenus = () => {
      if (user.role === ROLES.DIRECTOR) {
        // Director ve todos los menús
        return Object.values(DEPARTMENT_MENUS).flat().filter((item, index, arr) => arr.indexOf(item) === index)
      }
      
      if (user.role === ROLES.ADMINISTRADOR) {
        // Administrador ve la mayoría de menús
        const allMenus = Object.values(DEPARTMENT_MENUS).flat().filter((item, index, arr) => arr.indexOf(item) === index)
        const restrictedMenus = ['salarios', 'presupuestos_confidenciales']
        return allMenus.filter(menu => !restrictedMenus.includes(menu))
      }

      // Empleados solo ven los menús de su departamento
      return departmentMenus
    }

    const canManageUsers = () => rolePermissions.canManageUsers
    const canViewReports = () => rolePermissions.canViewReports
    const canManageSystem = () => rolePermissions.canManageSystem

    return {
      canAccess,
      getAvailableMenus,
      canManageUsers,
      canViewReports,
      canManageSystem,
      rolePermissions,
      departmentMenus
    }
  }, [user])
}