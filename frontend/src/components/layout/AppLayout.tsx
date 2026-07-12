import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useThemeStore } from "@/store/themeStore";
import { useTenantStore } from "@/store/tenantStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { PageWrapper } from "@/components/PageWrapper";

export function AppLayout() {
  const { theme } = useThemeStore();
  const isSemiDark = theme === 'semi-dark';
  const { fetchBusinesses, activeBusiness } = useTenantStore();
  const updateUser = useAuthStore(state => state.updateUser);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // When active business changes, re-fetch profile to get tenant-specific roles
  useEffect(() => {
    if (activeBusiness) {
      import('@/lib/api').then(({ default: api }) => {
        api.get('/profile').then(res => {
          updateUser(res.data.data);
        }).catch(err => console.error("Failed to fetch profile", err));
      });
    }
  }, [activeBusiness?.id, updateUser]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-white font-sans selection:bg-primary-500 selection:text-white transition-colors duration-300">
      <Sidebar className={isSemiDark ? "dark" : ""} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        <Header className={isSemiDark ? "dark" : ""} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full transition-all duration-300">
          <PageWrapper>
            <Outlet />
          </PageWrapper>
        </main>
      </div>
    </div>
  );
}
