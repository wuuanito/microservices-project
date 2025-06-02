// src/App.jsx - ACTUALIZADO con rutas protegidas por permisos
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
// import Dashboard from './pages/Dashboard'; // Replaced by CalendarPage
import CalendarPage from './pages/CalendarPage';
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

// Páginas por departamento (crear estas según necesites)
import AdminUsers from './pages/Admin/Users'
import Reports from './pages/Reports/Reports'
import SystemConfig from './pages/Admin/SystemConfig'

// Páginas de departamentos específicos
import ITSystems from './pages/IT/Systems'
import ITInfrastructure from './pages/IT/Infrastructure'
import ProductionOrders from './pages/Production/Orders'
import QualityControl from './pages/Quality/Control'
import HREmployees from './pages/HR/Employees'
import LogisticsWarehouse from './pages/Logistics/Warehouse'

import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta pública - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas básicas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Redirigir / a /calendar */}
              <Route index element={<Navigate to="/calendar" replace />} />
              
              {/* Rutas básicas - todos los usuarios */}
              {/* <Route path="dashboard" element={<Dashboard />} /> */}
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Rutas administrativas - solo admin/director */}
              <Route path="admin/usuarios" element={
                <ProtectedRoute requiredPermission="manage_users">
                  <AdminUsers />
                </ProtectedRoute>
              } />
              
              <Route path="admin/config" element={
                <ProtectedRoute requiredPermission="manage_system">
                  <SystemConfig />
                </ProtectedRoute>
              } />
              
              <Route path="reportes" element={
                <ProtectedRoute requiredPermission="view_reports">
                  <Reports />
                </ProtectedRoute>
              } />

              {/* Rutas por departamento */}
              
              {/* Informática */}
              <Route path="sistemas" element={
                <ProtectedRoute requiredDepartment="informatica">
                  <ITSystems />
                </ProtectedRoute>
              } />
              
              <Route path="infraestructura" element={
                <ProtectedRoute requiredDepartment="informatica">
                  <ITInfrastructure />
                </ProtectedRoute>
              } />

              {/* Producción */}
              <Route path="produccion/ordenes" element={
                <ProtectedRoute requiredDepartment="produccion">
                  <ProductionOrders />
                </ProtectedRoute>
              } />

              {/* Calidad */}
              <Route path="calidad/control" element={
                <ProtectedRoute requiredDepartment="calidad">
                  <QualityControl />
                </ProtectedRoute>
              } />

              {/* RRHH */}
              <Route path="rrhh/empleados" element={
                <ProtectedRoute requiredDepartment="rrhh">
                  <HREmployees />
                </ProtectedRoute>
              } />

              {/* Logística */}
              <Route path="logistica/almacen" element={
                <ProtectedRoute requiredDepartment="logistica">
                  <LogisticsWarehouse />
                </ProtectedRoute>
              } />

              {/* Rutas flexibles - múltiples departamentos */}
              <Route path="inventario" element={
                <ProtectedRoute requiredPermission="inventario">
                  <div className="container-fluid">
                    <h1>Inventario</h1>
                    <p>Disponible para Logística, Producción y Compras</p>
                  </div>
                </ProtectedRoute>
              } />

              {/* Ejemplo de ruta solo para directores */}
              <Route path="finanzas" element={
                <ProtectedRoute requiredRole="director">
                  <div className="container-fluid">
                    <h1>Finanzas</h1>
                    <p>Solo accesible para directores</p>
                  </div>
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App