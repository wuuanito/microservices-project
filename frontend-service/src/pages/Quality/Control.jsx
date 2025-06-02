import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

const QualityControl = () => {
  const { user } = useAuth()

  return (
    <div>
      <h1><i className="bi bi-check-circle me-2"></i>Control de Calidad</h1>
      <div className="alert alert-info">
        <strong>Departamento de Calidad:</strong> Procesos de control
      </div>
      <p>Gestión de procesos de calidad...</p>
      <p><strong>Usuario actual:</strong> {user?.username} ({user?.department})</p>
    </div>
  )
}

export default QualityControl
