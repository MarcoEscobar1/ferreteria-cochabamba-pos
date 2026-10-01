import { create } from 'zustand';
import { DEMO_USERS, employees } from '../data/demoData';

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
        const employee = JSON.parse(saved);
        set({ user: { id: employee.id, email: employee.email }, employee, loading: false, initialized: true });
      } else {
        set({ user: null, employee: null, loading: false, initialized: true });
      }
    } catch {
      set({ user: null, employee: null, loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    const demoUser = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!demoUser) {
      throw new Error('Credenciales inválidas. Usa admin@ferreteria.com / admin123 o empleado@ferreteria.com / emp123');
    }

    // Obtener datos actualizados del empleado
    const employee = employees.find((e) => e.id === demoUser.id) || demoUser;

    if (!employee.is_active) {
      throw new Error('Tu cuenta está deshabilitada. Contacta al administrador.');
    }

    const user = { id: employee.id, email: employee.email };
    sessionStorage.setItem('demo_session', JSON.stringify(employee));
    set({ user, employee, loading: false });
    return { user, employee };
  },

  signOut: async () => {
    sessionStorage.removeItem('demo_session');
    set({ user: null, employee: null });
  },

  isAdmin: () => get().employee?.role === 'admin',
  isEmployee: () => get().employee?.role === 'employee',
}));
