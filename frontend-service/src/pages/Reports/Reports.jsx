import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const Reports = () => {
  const { user } = useAuth()

  return (
    <div>
      <h1><i className="bi bi-bar-chart me-2"></i>Reportes del Sistema</h1>
      <div className="alert alert-info">
        <strong>Área de Reportes:</strong> Solo para administradores y directores
      </div>
      <p>Reportes y análisis del sistema...</p>
      <p><strong>Usuario actual:</strong> {user?.username} ({user?.role})</p>
    </div>
  )
}

export default Reports
