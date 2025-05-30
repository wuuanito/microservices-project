// src/store/authStore.js
import create from 'zustand';
import authService from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,
  
  // Inicializar estado
  initialize: async () => {
    set({ loading: true });
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // Si hay un usuario en localStorage, intentar refrescar su perfil
        try {
          const response = await authService.getProfile();
          if (response.data) {
            set({ user: response.data, error: null });
          } else {
            set({ user: currentUser, error: null });
          }
        } catch (error) {
          set({ user: currentUser, error: null });
        }
      } else {
        set({ user: null });
      }
    } catch (error) {
      set({ user: null, error: error.message });
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  
  // Login
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(credentials);
      set({ user: response.data.user, error: null });
      return response;
    } catch (error) {
      set({ error: error.error || 'Error al iniciar sesión' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  // Register
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(userData);
      set({ user: response.data.user, error: null });
      return response;
    } catch (error) {
      set({ error: error.error || 'Error al registrar' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  // Logout
  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
      set({ user: null, error: null });
    } catch (error) {
      set({ error: error.error || 'Error al cerrar sesión' });
    } finally {
      set({ loading: false });
    }
  },
  
  // Funciones de utilidad
  isAuthenticated: () => !!get().user,
  hasRole: (role) => get().user && (get().user.role === role || get().user.role === 'director'),
  hasDepartment: (department) => get().user && (get().user.department === department || get().user.role === 'director')
}));

export default useAuthStore;