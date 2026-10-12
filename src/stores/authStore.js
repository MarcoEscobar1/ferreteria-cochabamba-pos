import { create } from 'zustand';
import { DEMO_USERS, employees } from '../data/demoData';
import { useCartStore } from './cartStore';

export const useAuthStore = create((set, get) => ({
  user: null,
  employee: null,
  loading: false,
  initialized: true,

  initialize: async () => {
    // En modo demo, verificar si hay sesión guardada en sessionStorage
    try {
      const saved = sessionStorage.getItem('demo_session');
      if (saved) {
        const employee = employees.find((entry) => entry.id === JSON.parse(saved).id && entry.is_active);
        if (!employee) throw new Error('Sesión no disponible');
        set({ user: { id: employee.id, email: employee.email }, employee, loading: false, initialized: true });
      } else {
        set({ user: null, employee: null, loading: false, initialized: true });
      }
    } catch {
      set({ user: null, employee: null, loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    const demoUser = employees.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() &&
        (u.password ?? DEMO_USERS.find((entry) => entry.id === u.id)?.password) === password
    );

    if (!demoUser) {
      throw new Error('Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.');
    }

    // Obtener datos actualizados del empleado
    const { password: _password, ...employee } = demoUser;

    if (!employee.is_active) {
      throw new Error('Tu cuenta está deshabilitada. Contacta al administrador.');
    }

    const user = { id: employee.id, email: employee.email };
    sessionStorage.setItem('demo_session', JSON.stringify(employee));
    useCartStore.getState().clear();
    set({ user, employee, loading: false });
    return { user, employee };
  },

  signOut: async () => {
    sessionStorage.removeItem('demo_session');
    useCartStore.getState().clear();
    set({ user: null, employee: null });
  },

  isAdmin: () => get().employee?.role === 'admin',
  isEmployee: () => get().employee?.role === 'employee',
}));
