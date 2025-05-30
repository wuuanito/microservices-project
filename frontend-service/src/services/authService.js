import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Crear una instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Función para decodificar tokens JWT sin depender de jwt-decode
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Verificar si un token es válido
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = decodeToken(token);
    return decoded && decoded.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  async (config) => {
    let accessToken = localStorage.getItem('accessToken');
    
    // Si hay un token, verificar si es válido
    if (accessToken) {
      try {
        if (!isTokenValid(accessToken)) {
          // Si el token no es válido, intentar refrescarlo
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken && isTokenValid(refreshToken)) {
            try {
              // Importante: usar axios directamente para evitar el interceptor y un bucle infinito
              const response = await axios.post(`${API_URL}/auth/refresh-token`, { 
                refreshToken 
              });
              
              if (response.data && response.data.data) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                accessToken = response.data.data.accessToken;
              }
            } catch (error) {
              // Si falla el refresh, limpiar tokens
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              accessToken = null;
            }
          } else {
            // Si no hay refresh token o no es válido, limpiar todo
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            accessToken = null;
          }
        }
      } catch (error) {
        // Si hay error al decodificar, el token no es válido
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        accessToken = null;
      }
    }
    
    // Añadir el token (renovado o el original) a la petición
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (Unauthorized) y no hemos intentado refrescar el token ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken && isTokenValid(refreshToken)) {
          // Intentar refrescar el token
          const response = await axios.post(`${API_URL}/auth/refresh-token`, { 
            refreshToken 
          });
          
          if (response.data && response.data.data) {
            // Guardar los nuevos tokens
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            
            // Actualizar el header y reintentar la petición
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar todo
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirigir al login si es necesario
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Funciones del servicio de autenticación
const authService = {
  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data && response.data.data) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log("Datos guardados en localStorage:", response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error en el registro' };
    }
  },

  // Inicio de sesión
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data && response.data.data) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log("Datos guardados en localStorage:", response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error en el inicio de sesión' };
    }
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Si es error de autenticación, la lógica del interceptor ya maneja esto
        console.log("Error 401 al obtener perfil, el interceptor manejará la redirección");
      }
      throw error.response?.data || { error: 'Error al obtener el perfil' };
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Refrescar token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No hay refresh token');
    }

    try {
      // Usar axios directamente para evitar el interceptor
      const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
      if (response.data && response.data.data) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        return response.data;
      }
      throw new Error('Respuesta inválida al refrescar token');
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw error.response?.data || { error: 'Error al refrescar el token' };
    }
  },

  // Comprobar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    return isTokenValid(token);
  },

  // Verificar si un token es válido
  isTokenValid,
  
  // Obtener el usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;