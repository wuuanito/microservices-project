import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const ProductionOrders = () => {
  const { user } = useAuth()

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="bi bi-clipboard-check me-2"></i>
          Órdenes de Producción
        </h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <button type="button" className="btn btn-primary">
            <i className="bi bi-plus me-1"></i>
            Nueva Orden
          </button>
        </div>
      </div>

      <div className="alert alert-primary">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Departamento de Producción:</strong> Gestión de órdenes de trabajo
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5>Pendientes</h5>
              <h2>24</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h5>En Proceso</h5>
              <h2>8</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <p>Lista de órdenes de producción...</p>
          <p><strong>Usuario actual:</strong> {user?.username} ({user?.department})</p>
        </div>
      </div>
    </div>
  )
}

export default ProductionOrders
