import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  appName: string;
  appLogo: string | null;
  setSettings: (settings: { appName?: string; appLogo?: string }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      appName: 'MobileCRM',
      appLogo: null,
      setSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: 'app-storage',
    }
  )
);
