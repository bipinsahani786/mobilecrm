import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useThemeStore } from "@/store/themeStore";
import { useTenantStore } from "@/store/tenantStore";
import { useEffect } from "react";
import { PageWrapper } from "@/components/PageWrapper";

export function AppLayout() {
  const { theme } = useThemeStore();
  const isSemiDark = theme === 'semi-dark';
  const { fetchBusinesses } = useTenantStore();

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

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
