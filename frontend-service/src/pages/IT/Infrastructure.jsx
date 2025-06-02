import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const ITInfrastructure = () => {
  const { user } = useAuth()

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="bi bi-diagram-3 me-2"></i>
          Infraestructura TI
        </h1>
      </div>

      <div className="alert alert-success">
        <strong>Departamento de Informática:</strong> Gestión de infraestructura
      </div>

      <div className="card">
        <div className="card-body">
          <p>Gestión de servidores, red y equipos...</p>
          <p><strong>Usuario actual:</strong> {user?.username} ({user?.department})</p>
        </div>
      </div>
    </div>
  )
}

export default ITInfrastructure
