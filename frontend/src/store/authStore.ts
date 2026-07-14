import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTenantStore } from './tenantStore';

interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  roles?: { id: number; name: string }[];
  permissions?: string[];
  businesses?: any[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isProfileLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  setProfileLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isProfileLoading: !!localStorage.getItem('auth_token'),
      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true, isProfileLoading: false });
      },
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      setProfileLoading: (loading) => set({ isProfileLoading: loading }),
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false, isProfileLoading: false });
        // Static import since there is no circular dependency
        useTenantStore.getState().reset();
      },
    }),
    {
      name: 'mobilecrm-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }), // Exclude isProfileLoading from persistence
    }
  )
);
