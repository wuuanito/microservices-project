// auth-service/src/middleware/permission.middleware.js
const hasPermission = (roles = [], departments = []) => {
  return (req, res, next) => {
    // Si no hay restricciones, permitir el acceso
    if (roles.length === 0 && departments.length === 0) {
      return next();
    }

    // Verificar si el usuario está autenticado
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }

    // El director siempre tiene acceso completo
    if (req.user.role === 'director') {
      return next();
    }

    // Verificar rol
    const hasRole = roles.length === 0 || roles.includes(req.user.role);
    
    // Verificar departamento
    const hasDepartment = departments.length === 0 || departments.includes(req.user.department);

    // Si cumple con las restricciones, permitir el acceso
    if (hasRole && hasDepartment) {
      return next();
    }

    // Si no cumple, denegar el acceso
    return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
  };
};

module.exports = { hasPermission };