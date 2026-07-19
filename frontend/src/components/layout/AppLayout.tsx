import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useThemeStore } from "@/store/themeStore";
import { useTenantStore } from "@/store/tenantStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { PageLoadingSkeleton } from "@/components/ui/PageLoadingSkeleton";

export function AppLayout() {
  const { theme } = useThemeStore();
  const isSemiDark = theme === 'semi-dark';
  const { fetchBusinesses, activeBusiness, hasFetched } = useTenantStore();
  const updateUser = useAuthStore(state => state.updateUser);
  const setProfileLoading = useAuthStore(state => state.setProfileLoading);
  const isProfileLoading = useAuthStore(state => state.isProfileLoading);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // When active business changes or businesses are fetched, re-fetch profile to get tenant-specific roles
  useEffect(() => {
    if (hasFetched) {
      if (activeBusiness) {
        setProfileLoading(true);
        import('@/lib/api').then(({ default: api }) => {
          api.get('/profile').then(res => {
            updateUser(res.data.data);
            setProfileLoading(false);
            setIsReady(true);
          }).catch(err => {
            console.error("Failed to fetch profile", err);
            setProfileLoading(false);
            setIsReady(true);
          });
        });
      } else {
        setIsReady(true);
      }
    }
  }, [hasFetched, activeBusiness?.id, updateUser, setProfileLoading]);

  if (!isReady || isProfileLoading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-white font-sans selection:bg-primary-500 selection:text-white transition-colors duration-300 print:block print:h-auto print:overflow-visible print:bg-white">
      <div className="print:hidden">
        <Sidebar className={isSemiDark ? "dark" : ""} />
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0 print:block print:h-auto print:overflow-visible">
        <div className="print:hidden">
          <Header className={isSemiDark ? "dark" : ""} />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full transition-all duration-300 bg-slate-50 dark:bg-[#0a0a0f] print:block print:overflow-visible print:bg-white">
          <PageWrapper>
            <Outlet />
          </PageWrapper>
        </main>
      </div>
    </div>
  );
}
