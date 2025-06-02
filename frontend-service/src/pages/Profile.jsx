import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Alert from '../components/Common/Alert'

const Profile = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    jobTitle: user?.jobTitle || '',
    department: user?.department || ''
  })

  const departments = [
    'informatica', 'administracion', 'internacional', 'compras', 'gerencia',
    'oficina_tecnica', 'calidad', 'laboratorio', 'rrhh', 'logistica',
    'mantenimiento', 'softgel', 'produccion', 'sin_departamento'
  ]

  const roles = {
    'director': 'Director',
    'administrador': 'Administrador',
    'empleado': 'Empleado'
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEdit = () => {
    setIsEditing(true)
    setMessage('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      jobTitle: user?.jobTitle || '',
      department: user?.department || ''
    })
    setMessage('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      // Aquí harías la llamada a la API para actualizar el perfil
      // await userService.updateProfile(formData)
      
      setMessage('Perfil actualizado correctamente')
      setMessageType('success')
      setIsEditing(false)
      
      // Simular delay
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Error al actualizar el perfil')
      setMessageType('danger')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleString('es-ES')
  }

  const formatDepartment = (dept) => {
    return dept?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'No asignado'
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="bi bi-person me-2"></i>
          Mi Perfil
        </h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          {!isEditing ? (
            <button type="button" className="btn btn-primary" onClick={handleEdit}>
              <i className="bi bi-pencil me-1"></i>
              Editar Perfil
            </button>
          ) : (
            <div className="btn-group">
              <button type="button" className="btn btn-success" onClick={handleSave}>
                <i className="bi bi-check me-1"></i>
                Guardar
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                <i className="bi bi-x me-1"></i>
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <Alert 
          type={messageType} 
          message={message} 
          onClose={() => setMessage('')}
        />
      )}

      <div className="row">
        {/* Profile Card */}
        <div className="col-lg-4 mb-4">
          <div className="card dashboard-card">
            <div className="card-body text-center">
              {/* Avatar */}
              <div className="mb-3">
                <div className="avatar avatar-xl mx-auto bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '100px', height: '100px', fontSize: '2rem'}}>
                  <i className="bi bi-person"></i>
                </div>
              </div>

              {/* User Info */}
              <h5 className="card-title mb-1">
                {user?.firstName} {user?.lastName}
              </h5>
              <p className="text-muted mb-2">@{user?.username}</p>
              <span className={`badge bg-${user?.role === 'director' ? 'danger' : user?.role === 'administrador' ? 'warning' : 'primary'} mb-3`}>
                {roles[user?.role] || user?.role}
              </span>

              {/* Stats */}
              <div className="row text-center mt-3">
                <div className="col-4">
                  <div className="border-end">
                    <h6 className="text-muted mb-0">Departamento</h6>
                    <small>{formatDepartment(user?.department)}</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border-end">
                    <h6 className="text-muted mb-0">Estado</h6>
                    <small className={`text-${user?.isActive ? 'success' : 'danger'}`}>
                      {user?.isActive ? 'Activo' : 'Inactivo'}
                    </small>
                  </div>
                </div>
                <div className="col-4">
                  <h6 className="text-muted mb-0">Último Login</h6>
                  <small>{formatDate(user?.lastLogin)}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="card dashboard-card mt-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Información de Cuenta
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <small className="text-muted">ID de Usuario:</small>
                <div className="fw-bold">{user?.id}</div>
              </div>
              <div className="mb-2">
                <small className="text-muted">Fecha de Registro:</small>
                <div>{formatDate(user?.createdAt)}</div>
              </div>
              <div className="mb-2">
                <small className="text-muted">Última Actualización:</small>
                <div>{formatDate(user?.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="col-lg-8">
          <div className="card dashboard-card">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-person-gear me-2"></i>
                Información Personal
              </h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSave}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">Apellido</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      value={user?.username || ''}
                      disabled
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="jobTitle" className="form-label">Puesto de Trabajo</label>
                    <input
                      type="text"
                      className="form-control"
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="department" className="form-label">Departamento</label>
                    <select
                      className="form-select"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>
                          {formatDepartment(dept)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="role" className="form-label">Rol</label>
                    <input
                      type="text"
                      className="form-control"
                      id="role"
                      value={roles[user?.role] || user?.role}
                      disabled
                    />
                    <div className="form-text">El rol solo puede ser cambiado por un administrador.</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="isActive" className="form-label">Estado de Cuenta</label>
                    <input
                      type="text"
                      className="form-control"
                      id="isActive"
                      value={user?.isActive ? 'Activa' : 'Inactiva'}
                      disabled
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile