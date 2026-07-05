import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useThemeStore } from "@/store/themeStore";

export function AppLayout() {
  const { theme } = useThemeStore();
  const isSemiDark = theme === 'semi-dark';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-white font-sans selection:bg-primary-500 selection:text-white transition-colors duration-300">
      <Sidebar className={isSemiDark ? "dark" : ""} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        <Header className={isSemiDark ? "dark" : ""} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
