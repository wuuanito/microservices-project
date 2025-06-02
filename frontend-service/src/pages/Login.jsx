import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Asegúrate que la ruta es correcta
import LoginForm from '../components/Auth/LoginForm'; // Asegúrate que este componente existe

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/calendar', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    navigate('/calendar', { replace: true });
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center py-3 py-md-5"> {/* Ajuste de padding responsivo */}
      <div className="container">
        <div className="row justify-content-center">
          {/* Columnas ajustadas para un ancho ligeramente mayor y más moderno */}
          <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card login-card">
              {/* Header */}
              <div className="card-header login-header text-center py-4">
                <h3 className="mb-0 login-title">
                  <i className="bi bi-building me-2 login-header-icon"></i>
                  Rioja Nature Pharma
                </h3>
                <p className="mb-0 mt-2 login-subtitle">Inicia sesión en tu cuenta</p>
              </div>

              {/* Body */}
              <div className="card-body p-4 p-lg-5"> {/* Mayor padding en pantallas grandes */}
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              </div>

              {/* Footer */}
              <div className="card-footer text-center py-3 login-footer">
                <small>
                  © 2025 Todos los derechos reservados.
                  <br />
                  <span className="text-brand-accent fw-bold">
                    v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
                  </span>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;