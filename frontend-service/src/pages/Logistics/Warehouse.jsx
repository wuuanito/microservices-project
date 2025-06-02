import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const LogisticsWarehouse = () => {
  const { user } = useAuth()

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="bi bi-box-seam me-2"></i>
          Gestión de Almacén
        </h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <button type="button" className="btn btn-primary me-2">
            <i className="bi bi-plus me-1"></i>
            Entrada
          </button>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-truck me-2"></i>
        <strong>Logística:</strong> Control de inventario y movimientos
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <i className="bi bi-boxes display-4 text-primary"></i>
              <h5 className="card-title mt-2">Productos en Stock</h5>
              <h2 className="text-primary">1,247</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <p>Control de inventario y movimientos...</p>
          <p><strong>Usuario actual:</strong> {user?.username} ({user?.department})</p>
        </div>
      </div>
    </div>
  )
}

export default LogisticsWarehouse
