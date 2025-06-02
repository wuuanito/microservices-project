import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const HREmployees = () => {
  const { user } = useAuth()

  return (
    <div>
      <h1><i className="bi bi-people me-2"></i>Gestión de Empleados</h1>
      <div className="alert alert-primary">
        <strong>Recursos Humanos:</strong> Administración de personal
      </div>
      <p>Gestión de empleados y nóminas...</p>
      <p><strong>Usuario actual:</strong> {user?.username} ({user?.department})</p>
    </div>
  )
}

export default HREmployees
