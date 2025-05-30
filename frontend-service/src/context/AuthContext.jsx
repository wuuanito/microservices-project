import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const loadUser = async () => {
      try {
        setLoading(true);
        
        // Si no estamos autenticados, salir
        if (!authService.isAuthenticated()) {
          setUser(null);
          setLoading(false);
          setIsInitialized(true);
          return;
        }
        
        // En este punto, tenemos un token válido
        try {
          // Obtener el perfil actualizado desde el servidor
          const profileResponse = await authService.getProfile();
          if (profileResponse.data) {
            setUser(profileResponse.data);
            console.log("Usuario cargado desde API:", profileResponse.data);
          } else {
            // Si no hay datos de perfil, usar los datos almacenados
            const storedUser = authService.getCurrentUser();
            setUser(storedUser);
            console.log("Usuario cargado desde localStorage:", storedUser);
          }
        } catch (profileError) {
          console.error('Error al obtener el perfil actualizado:', profileError);
          // Si hay error al obtener el perfil, usar los datos almacenados
          // si todavía estamos autenticados
          if (authService.isAuthenticated()) {
            const storedUser = authService.getCurrentUser();
            setUser(storedUser);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error al cargar el usuario:', err);
        setError(err.message || 'Error al cargar el usuario');
        setUser(null);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadUser();
  }, []);

  // Función de inicio de sesión
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.data.user);
      console.log("Usuario establecido después de login:", response.data.user);
      setError(null);
      return response;
    } catch (err) {
      setError(err.error || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función de registro
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      setUser(response.data.user);
      console.log("Usuario establecido después de registro:", response.data.user);
      setError(null);
      return response;
    } catch (err) {
      setError(err.error || 'Error al registrar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función de cierre de sesión
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.error || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user && (user.role === role || user.role === 'director');
  };

  // Verificar si el usuario pertenece a un departamento específico
  const hasDepartment = (department) => {
    return user && (user.department === department || user.role === 'director');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isInitialized,
        login,
        register,
        logout,
        hasRole,
        hasDepartment,
        isAuthenticated: authService.isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};