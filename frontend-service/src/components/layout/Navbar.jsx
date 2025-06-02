import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  let userObject = null;
  if (user) {
    // Prefer user.data if it exists and is an object, otherwise use user directly
    userObject = (user.data && typeof user.data === 'object') ? user.data : user;
  }

  const { getAvailableMenus, canManageUsers, canViewReports, canManageSystem } = usePermissions(userObject);

  const isActive = (path) => location.pathname === path;

  // Define ALL_MENUS (Copied from DynamicSidebar.jsx)
  const ALL_MENUS = {
    calendar: { // Renamed from dashboard to calendar
      label: 'Calendar', 
      icon: 'bi-calendar-event', // Changed icon
      path: '/calendar', // Changed path
      category: 'Principal'
    },
    profile: { 
      label: 'Mi Perfil', 
      icon: 'bi-person', 
      path: '/profile',
      category: 'Principal'
    },
    almacen: { 
      label: 'Almacén', 
      icon: 'bi-box-seam', 
      path: '/logistica/almacen',
      category: 'Logística'
    },
    inventario: { 
      label: 'Inventario', 
      icon: 'bi-list-check', 
      path: '/logistica/inventario', // Assuming this path exists or will be created
      category: 'Logística'
    },
    // Add other menu items from DynamicSidebar's ALL_MENUS as needed
    // Example for IT, Production, Quality, HR if they are defined in usePermissions
    sistemas: {
      label: 'Sistemas TI',
      icon: 'bi-cpu',
      path: '/sistemas',
      category: 'Informática'
    },
    infraestructura: {
      label: 'Infraestructura TI',
      icon: 'bi-diagram-3',
      path: '/infraestructura',
      category: 'Informática'
    },
    ordenes_produccion: {
      label: 'Órdenes de Producción',
      icon: 'bi-tools',
      path: '/produccion/ordenes',
      category: 'Producción'
    },
    control_calidad: {
      label: 'Control de Calidad',
      icon: 'bi-clipboard-check',
      path: '/calidad/control',
      category: 'Calidad'
    },
    rrhh_empleados: {
      label: 'Gestión de Empleados',
      icon: 'bi-people',
      path: '/rrhh/empleados',
      category: 'RRHH'
    }
  };

  let userMenus = [];
  if (userObject && getAvailableMenus) {
    const availableMenuKeys = getAvailableMenus();
    availableMenuKeys.forEach(menuKey => {
      if (ALL_MENUS[menuKey]) {
        userMenus.push({ key: menuKey, ...ALL_MENUS[menuKey] });
      }
    });

    if (canManageUsers && canManageUsers()) {
      userMenus.push({ 
        key: 'usuarios', 
        label: 'Gestión de Usuarios', 
        icon: 'bi-person-gear', 
        path: '/admin/usuarios',
        category: 'Administración'
      });
    }
    if (canViewReports && canViewReports()) {
      userMenus.push({ 
        key: 'reportes', 
        label: 'Reportes', 
        icon: 'bi-bar-chart', 
        path: '/reportes',
        category: 'Administración'
      });
    }
    if (canManageSystem && canManageSystem()) {
      userMenus.push({ 
        key: 'configuracion', 
        label: 'Configuración', 
        icon: 'bi-gear', 
        path: '/admin/config',
        category: 'Administración'
      });
    }
  }

  // Group menus by category for rendering if desired, or render as a flat list
  const menusByCategory = userMenus.reduce((acc, menu) => {
    const category = menu.category || 'Otros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(menu);
    return acc;
  }, {});

  const formatDepartment = (dept) => {
    return dept?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'No asignado';
  };

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
      <div className="container-fluid">
        {/* Brand */}
        <Link className="navbar-brand" to="/">
          <img src="https://www.riojanaturepharma.com/assets/img/logo-big.png" alt="Logo RiojaNature Pharma" style={{ height: '40px', marginRight: '10px' }} />
          {/* {import.meta.env.VITE_APP_NAME || 'Sistema Microservicios'} */}
        </Link>

        {/* Toggle button para mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Dynamic Menu Items - Consolidated */}
          {userObject && userMenus.length > 0 && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {Object.entries(menusByCategory).map(([category, menus]) => (
                <React.Fragment key={category}>
                  {/* Optional: Display category as a non-interactive header or a dropdown toggle */}
                  {/* For simplicity, we'll list all items directly. For more complex scenarios, consider dropdowns per category. */}
                  {/* Example of a category header (visual only): */}
                  {/* {menus.length > 0 && <li className="nav-item"><span className="navbar-text text-uppercase small fw-bold ms-1 me-3">{category}</span></li>} */}
                  {menus.map((menu) => (
                    <li key={menu.key} className="nav-item">
                      <Link
                        to={menu.path}
                        className={`nav-link text-dark ${isActive(menu.path) ? 'active fw-bold' : ''}`}
                      >
                        <i className={`${menu.icon} me-1`}></i>
                        {menu.label}
                      </Link>
                    </li>
                  ))}
                </React.Fragment>
              ))}
            </ul>
          )}
          {userObject && userMenus.length === 0 && (
             <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <span className="nav-link text-secondary">No hay menús disponibles.</span>
              </li>
            </ul>
          )}

          {/* User Info and Logout - aligned to the right */}
          {userObject && (
            <ul className="navbar-nav ms-auto">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle text-dark"
                  href="#"
                  id="navbarUserDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {userObject?.firstName || userObject?.username || 'Usuario'}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarUserDropdown">
                  <li>
                    <h6 className="dropdown-header">
                      {userObject?.firstName} {userObject?.lastName}
                    </h6>
                  </li>
                  <li>
                    <span className="dropdown-item-text small text-muted">
                      {userObject?.email}
                    </span>
                  </li>
                  <li>
                    <span className="dropdown-item-text small text-muted">
                      {userObject?.role ? (userObject.role.charAt(0).toUpperCase() + userObject.role.slice(1)) : 'N/A'} - {formatDepartment(userObject?.department)}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i>
                      Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/config"> {/* Assuming this is the correct path */}
                      <i className="bi bi-gear me-2"></i>
                      Configuración
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item text-danger d-flex align-items-center"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar