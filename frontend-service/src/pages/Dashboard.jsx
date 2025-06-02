import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()

  const statsData = [
    {
      title: 'Usuarios Activos',
      value: '1,234',
      icon: 'bi-people',
      color: 'primary',
      trend: '+12%'
    },
    {
      title: 'Sesiones Hoy',
      value: '856',
      icon: 'bi-graph-up',
      color: 'success',
      trend: '+8%'
    },
    {
      title: 'Microservicios',
      value: '12',
      icon: 'bi-hdd-stack',
      color: 'info',
      trend: '+2'
    },
    {
      title: 'Uptime',
      value: '99.9%',
      icon: 'bi-check-circle',
      color: 'warning',
      trend: '24h'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      user: 'Carlos Técnico',
      action: 'Inició sesión',
      time: 'Hace 5 minutos',
      icon: 'bi-box-arrow-in-right',
      color: 'success'
    },
    {
      id: 2,
      user: 'Ana Administradora',
      action: 'Actualizó configuración',
      time: 'Hace 15 minutos',
      icon: 'bi-gear',
      color: 'primary'
    },
    {
      id: 3,
      user: 'Luis Director',
      action: 'Generó reporte',
      time: 'Hace 30 minutos',
      icon: 'bi-file-earmark-text',
      color: 'info'
    },
    {
      id: 4,
      user: 'Sistema',
      action: 'Backup completado',
      time: 'Hace 1 hora',
      icon: 'bi-cloud-check',
      color: 'success'
    }
  ]

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <button type="button" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-download me-1"></i>
              Exportar
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary">
              <i className="bi bi-arrow-clockwise me-1"></i>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="alert alert-info" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        <strong>¡Bienvenido, {user?.firstName || user?.username}!</strong> 
        {user?.role === 'director' && ' Tienes acceso completo al sistema.'}
        {user?.role === 'administrador' && ' Puedes gestionar usuarios y configuraciones.'}
        {user?.role === 'empleado' && ' Puedes ver información y actualizar tu perfil.'}
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        {statsData.map((stat, index) => (
          <div key={index} className="col-xl-3 col-md-6 mb-4">
            <div className={`card dashboard-card border-left-${stat.color}`}>
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className={`text-xs font-weight-bold text-${stat.color} text-uppercase mb-1`}>
                      {stat.title}
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stat.value}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className={`${stat.icon} fa-2x text-${stat.color}`}></i>
                  </div>
                </div>
                <div className="mt-2">
                  <small className={`text-${stat.color}`}>
                    <i className="bi bi-arrow-up"></i> {stat.trend}
                  </small>
                  <small className="text-muted"> desde el mes pasado</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Row */}
      <div className="row">
        {/* Recent Activity */}
        <div className="col-lg-8 mb-4">
          <div className="card dashboard-card">
            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
              <h6 className="m-0 font-weight-bold text-primary">
                <i className="bi bi-clock-history me-2"></i>
                Actividad Reciente
              </h6>
              <a className="btn btn-sm btn-primary" href="#historial">
                Ver todo
              </a>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="list-group-item border-0 px-0">
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <div className={`avatar avatar-sm rounded-circle bg-${activity.color}`}>
                          <i className={`${activity.icon} text-white`}></i>
                        </div>
                      </div>
                      <div className="col ms-n2">
                        <h6 className="mb-0 text-sm">{activity.user}</h6>
                        <p className="card-text text-sm text-muted mb-0">
                          {activity.action}
                        </p>
                      </div>
                      <div className="col-auto">
                        <small className="text-muted">{activity.time}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4 mb-4">
          <div className="card dashboard-card">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                <i className="bi bi-lightning me-2"></i>
                Acciones Rápidas
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary btn-custom">
                  <i className="bi bi-person-plus me-2"></i>
                  Nuevo Usuario
                </button>
                <button className="btn btn-outline-success btn-custom">
                  <i className="bi bi-file-earmark-plus me-2"></i>
                  Generar Reporte
                </button>
                <button className="btn btn-outline-info btn-custom">
                  <i className="bi bi-gear me-2"></i>
                  Configuración
                </button>
                <button className="btn btn-outline-warning btn-custom">
                  <i className="bi bi-shield-check me-2"></i>
                  Logs del Sistema
                </button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="card dashboard-card mt-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">
                <i className="bi bi-server me-2"></i>
                Estado del Sistema
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-sm">API Gateway</span>
                  <span className="badge bg-success">Online</span>
                </div>
                <div className="progress" style={{height: '4px'}}>
                  <div className="progress-bar bg-success" style={{width: '100%'}}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-sm">Auth Service</span>
                  <span className="badge bg-success">Online</span>
                </div>
                <div className="progress" style={{height: '4px'}}>
                  <div className="progress-bar bg-success" style={{width: '98%'}}></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-sm">Base de Datos</span>
                  <span className="badge bg-warning">Lento</span>
                </div>
                <div className="progress" style={{height: '4px'}}>
                  <div className="progress-bar bg-warning" style={{width: '75%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard