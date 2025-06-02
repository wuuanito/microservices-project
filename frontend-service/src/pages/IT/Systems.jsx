import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const ITSystems = () => {
  const { user } = useAuth()

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="bi bi-cpu me-2"></i>
          Sistemas Informáticos
        </h1>
      </div>

      <div className="alert alert-success">
        <i className="bi bi-check-circle me-2"></i>
        <strong>Departamento de Informática:</strong> Bienvenido {user?.firstName || user?.username}
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-server me-2"></i>
                Servidores
              </h5>
            </div>
            <div className="card-body">
              <p>Estado de los servidores del sistema</p>
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between">
                  <span>Servidor Web</span>
                  <span className="badge bg-success">Online</span>
                </div>
                <div className="list-group-item d-flex justify-content-between">
                  <span>Base de Datos</span>
                  <span className="badge bg-success">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ITSystems
