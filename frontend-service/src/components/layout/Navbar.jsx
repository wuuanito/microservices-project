import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AppNavbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Recalcular los menús cuando cambia el usuario o la ruta
  useEffect(() => {
    // Asegurarnos de que el usuario existe antes de construir el menú
    if (user) {
      console.log("Usuario cargado en NavBar:", user);
      setMenuItems(buildMenuItems());
    } else {
      setMenuItems([]);
    }
  }, [user, location.pathname]);

  // Función para construir los elementos del menú
  const buildMenuItems = () => {
    if (!user) return [];

    const menus = [];

    // Menús comunes para todos los departamentos
    menus.push(
      <Nav.Link as={Link} to="/dashboard" key="dashboard" active={location.pathname === '/dashboard'}>
        Dashboard
      </Nav.Link>
    );

    // Menús específicos por departamento
    switch (user.department) {
      case 'informatica':
        menus.push(
          <Nav.Link as={Link} to="/tickets" key="tickets" active={location.pathname === '/tickets'}>
            Tickets IT
          </Nav.Link>
        );
        break;
      case 'rrhh':
        menus.push(
          <Nav.Link as={Link} to="/empleados" key="empleados" active={location.pathname === '/empleados'}>
            Empleados
          </Nav.Link>
        );
        break;
      case 'logistica':
        menus.push(
          <Nav.Link as={Link} to="/envios" key="envios" active={location.pathname === '/envios'}>
            Envíos
          </Nav.Link>
        );
        break;
      default:
        break;
    }

    // Menús específicos por rol
    if (user.role === 'director' || user.role === 'administrador') {
      menus.push(
        <Nav.Link as={Link} to="/admin" key="admin" active={location.pathname === '/admin'}>
          Administración
        </Nav.Link>
      );
    }

    return menus;
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Sistema de Microservicios
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {loading ? (
              <Spinner animation="border" size="sm" variant="light" className="ms-2" />
            ) : (
              menuItems
            )}
          </Nav>
          <Nav>
            {user ? (
              <NavDropdown title={user.firstName || user.username} id="user-dropdown">
                <NavDropdown.Item as={Link} to="/profile">
                  Mi Perfil
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Cerrar Sesión</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" active={location.pathname === '/login'}>
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register" active={location.pathname === '/register'}>
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;