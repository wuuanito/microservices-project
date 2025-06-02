import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const AdminUsers = () => {
  const { user } = useAuth()

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="bi bi-people me-2"></i>
          Gestión de Usuarios
        </h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <button type="button" className="btn btn-primary">
            <i className="bi bi-person-plus me-1"></i>
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Área Administrativa:</strong> Solo accesible para administradores y directores.
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Lista de Usuarios</h5>
        </div>
        <div className="card-body">
          <p>Aquí irían las funcionalidades de gestión de usuarios...</p>
          <p><strong>Usuario actual:</strong> {user?.username} ({user?.role})</p>
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
