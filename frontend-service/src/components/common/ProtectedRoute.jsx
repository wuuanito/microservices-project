import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner, Container } from 'react-bootstrap';

const ProtectedRoute = ({ 
  requiredRole = null,
  requiredDepartment = null,
  redirectPath = '/login'
}) => {
  const { user, loading, isInitialized, isAuthenticated, hasRole, hasDepartment } = useAuth();

  // Mostrar spinner mientras se carga la autenticación
  if (loading || !isInitialized) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  // Verificar autenticación
  if (!isAuthenticated()) {
    return <Navigate to={redirectPath} replace />;
  }

  // Verificar roles si es necesario
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar departamento si es necesario
  if (requiredDepartment && !hasDepartment(requiredDepartment)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;