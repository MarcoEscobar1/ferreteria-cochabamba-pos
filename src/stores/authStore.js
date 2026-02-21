import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

export const useAuthStore = create((set, get) => ({
  user: null,
  employee: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: employee } = await supabase
          .from('employees')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          user: session.user,
          employee,
          loading: false,
          initialized: true,
        });
      } else {
        set({ user: null, employee: null, loading: false, initialized: true });
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: employee } = await supabase
            .from('employees')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({ user: session.user, employee, loading: false });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, employee: null, loading: false });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, employee: null });
  },

  isAdmin: () => get().employee?.role === 'admin',
  isEmployee: () => get().employee?.role === 'employee',
}));
