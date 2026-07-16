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
  originalUser: User | null;
  originalToken: string | null;
  isAuthenticated: boolean;
  isProfileLoading: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  setProfileLoading: (loading: boolean) => void;
  impersonate: (user: User, token: string) => void;
  leaveImpersonation: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      originalUser: null,
      originalToken: null,
      isAuthenticated: false,
      isProfileLoading: !!localStorage.getItem('auth_token'),
      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true, isProfileLoading: false });
      },
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      setProfileLoading: (loading) => set({ isProfileLoading: loading }),
      impersonate: (user, token) => {
        const state = get();
        // Save current auth as original
        set({
          originalUser: state.user,
          originalToken: state.token,
          user,
          token,
          isAuthenticated: true,
          isProfileLoading: false,
        });
        localStorage.setItem('auth_token', token);
      },
      leaveImpersonation: () => {
        const state = get();
        if (state.originalToken && state.originalUser) {
          localStorage.setItem('auth_token', state.originalToken);
          set({
            user: state.originalUser,
            token: state.originalToken,
            originalUser: null,
            originalToken: null,
          });
        }
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, originalUser: null, originalToken: null, isAuthenticated: false, isProfileLoading: false });
        // Static import since there is no circular dependency
        useTenantStore.getState().reset();
      },
    }),
    {
      name: 'mobilecrm-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        originalUser: state.originalUser,
        originalToken: state.originalToken,
        isAuthenticated: state.isAuthenticated,
      }), // Exclude isProfileLoading from persistence
    }
  )
);
