import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            {/* Error Icon */}
            <div className="mb-4">
              <i className="bi bi-exclamation-triangle text-warning" style={{fontSize: '5rem'}}></i>
            </div>

            {/* Error Message */}
            <h1 className="display-1 fw-bold text-muted">404</h1>
            <h2 className="mb-3">Página no encontrada</h2>
            <p className="lead text-muted mb-4">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>

            {/* Actions */}
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <Link to="/calendar" className="btn btn-primary btn-custom">
                <i className="bi bi-house me-2"></i>
                Ir al Dashboard
              </Link>
              <Link to="/login" className="btn btn-outline-secondary btn-custom">
                <i className="bi bi-arrow-left me-2"></i>
                Volver al Login
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-5">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="bi bi-lightbulb me-2"></i>
                    ¿Necesitas ayuda?
                  </h6>
                  <p className="card-text text-muted">
                    Si crees que esto es un error, contacta al administrador del sistema.
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-sm btn-outline-info">
                      <i className="bi bi-envelope me-1"></i>
                      Soporte
                    </button>
                    <button className="btn btn-sm btn-outline-info" onClick={() => window.history.back()}>
                      <i className="bi bi-arrow-counterclockwise me-1"></i>
                      Página Anterior
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound