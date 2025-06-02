import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const SystemConfig = () => {
  const { user } = useAuth()

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="bi bi-gear me-2"></i>
          Configuración del Sistema
        </h1>
      </div>

      <div className="alert alert-warning">
        <strong>Solo Administradores:</strong> Configuración avanzada del sistema
      </div>

      <div className="card">
        <div className="card-body">
          <p>Configuraciones del sistema...</p>
          <p><strong>Usuario actual:</strong> {user?.username} ({user?.role})</p>
        </div>
      </div>
    </div>
  )
}

export default SystemConfig
