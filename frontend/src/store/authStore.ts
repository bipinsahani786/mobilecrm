import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      },
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
        
        // Dynamic import to prevent circular dependency at module load time
        import('./tenantStore')
          .then((module) => {
            module.useTenantStore.getState().reset();
          })
          .catch((err) => {
            console.error('Failed to reset tenantStore on logout:', err);
          });
      },
    }),
    {
      name: 'mobilecrm-auth', // localStorage key
    }
  )
);
