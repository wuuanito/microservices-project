import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Spinner } from 'react-bootstrap'; // Añade esta línea para importar Spinner

// Importar estilos de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

// Importar componentes comunes
import LoadingSpinner from './components/common/LoadingSpinner';

// Importar páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import TicketsPage from './pages/IT/TicketsPage';
import AdminPanel from './pages/Admin/AdminPanel';

// Importar componentes
import ProtectedRoute from './components/common/ProtectedRoute';

// Componente para la pantalla de carga
const LoadingScreen = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <h3 className="mt-3">Cargando...</h3>
        <p>Preparando tu dashboard personalizado</p>
      </div>
    </div>
  );
};

// Componente AppRouter que maneja la inicialización de la autenticación
const AppRouter = () => {
  const { isInitialized, loading, isAuthenticated } = useAuth();
  
  // Verificar si acabamos de iniciar sesión
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (justLoggedIn) {
      // Eliminar el indicador para que no se vuelva a ejecutar en futuras recargas
      sessionStorage.removeItem('justLoggedIn');
    }
  }, []);

  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Rutas protegidas - cualquier usuario autenticado */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Dashboard />} /> {/* Reemplazar con componente de Perfil cuando se cree */}
      </Route>
      
      {/* Rutas protegidas - solo administradores y directores */}
      <Route element={<ProtectedRoute requiredRole="administrador" />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
      
      {/* Rutas protegidas por departamento - Informática */}
      <Route element={<ProtectedRoute requiredDepartment="informatica" />}>
        <Route path="/tickets" element={<TicketsPage />} />
      </Route>
      
      {/* Redirección para la ruta raíz */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Ruta para página no encontrada */}
      <Route path="*" element={<Unauthorized />} />
    </Routes>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <AppRouter />
      </Router>
    </AuthProvider>
  </React.StrictMode>
);