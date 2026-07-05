import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Activity, 
  Users, 
  UserPlus, 
  Building2, 
  ClipboardList,
  Package,
  Wallet,
  FileStack
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { ShieldAlert, Settings, Database, Briefcase, Coins, UserCircle, LogOut, MessageSquare } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

const businessMenuGroups = [
  {
    title: "MAIN",
    items: [
      { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "SALES & OPERATIONS",
    items: [
      { name: "NEW BILL (POS)", href: "/pos", icon: FileText },
      { name: "ALL INVOICES", href: "/invoices", icon: ClipboardList },
      { name: "QUOTATIONS", href: "/quotations", icon: Activity },
    ]
  },
  {
    title: "RELATIONSHIPS",
    items: [
      { name: "CUSTOMERS", href: "/customers", icon: Users },
      { name: "SUPPLIERS", href: "/suppliers", icon: UserPlus },
    ]
  },
  {
    title: "INVENTORY",
    items: [
      { name: "ITEMS", href: "/items", icon: Package },
      { name: "CATEGORIES", href: "/categories", icon: Building2 },
    ]
  }
];

const superadminMenuGroups = [
  {
    title: "GLOBAL",
    items: [
      { name: "SYSTEM OVERVIEW", href: "/superadmin/dashboard", icon: ShieldAlert, permission: "view_dashboard" },
      { name: "SUBSCRIPTION PLANS", href: "/superadmin/plans", icon: Package, permission: "manage_plans" },
      { name: "TENANTS / BUSINESSES", href: "/superadmin/tenants", icon: Building2, permission: "manage_tenants" },
    ]
  },
  {
    title: "PARTNER PROGRAM",
    items: [
      { name: "SALES AGENTS", href: "/superadmin/partners", icon: Briefcase, permission: "manage_partners" },
      { name: "LEADS", href: "/superadmin/leads", icon: UserCircle, permission: "manage_leads" },
      { name: "MESSAGE TEMPLATES", href: "/superadmin/templates", icon: MessageSquare, permission: "manage_leads" },
      { name: "CAMPAIGN LOGS", href: "/superadmin/message-logs", icon: Database, permission: "manage_leads" },
      { name: "MARKETING ASSETS", href: "/superadmin/resources", icon: FileStack, permission: "manage_settings" },
      { name: "COMMISSIONS", href: "/superadmin/commissions", icon: Coins, permission: "manage_commissions" },
      { name: "PAYOUT REQUESTS", href: "/superadmin/payouts", icon: Wallet, permission: "manage_payouts" },
    ]
  },
  {
    title: "ADMINISTRATION",
    items: [
      { name: "ALL USERS", href: "/superadmin/users", icon: Users, permission: "manage_users" },
      { name: "ROLES & PERMISSIONS", href: "/superadmin/roles", icon: ShieldAlert, permission: "manage_roles" },
      { name: "SETTINGS", href: "/superadmin/settings", icon: Settings, permission: "manage_settings" },
      { name: "SYSTEM LOGS", href: "/superadmin/logs", icon: Database, permission: "manage_system_logs" },
    ]
  }
];

const partnerMenuGroups = [
  {
    title: "PARTNER PORTAL",
    items: [
      { name: "DASHBOARD", href: "/partner/dashboard", icon: LayoutDashboard, permission: "view_partner_dashboard" },
      { name: "MY REFERRALS", href: "/partner/referrals", icon: Building2, permission: "view_own_referrals" },
      { name: "COMMISSIONS", href: "/partner/commissions", icon: Coins, permission: "view_own_commissions" },
      { name: "PAYOUTS", href: "/partner/payouts", icon: Wallet, permission: "manage_own_payouts" },
      { name: "MARKETING ASSETS", href: "/partner/resources", icon: FileStack, permission: "view_partner_dashboard" },
    ]
  },
  {
    title: "ACCOUNT",
    items: [
      { name: "PROFILE & SETTINGS", href: "/partner/profile", icon: UserCircle, permission: "manage_own_profile" },
    ]
  }
];

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { isSidebarCollapsed, setSidebarCollapsed } = useLayoutStore();
  const user = useAuthStore((state) => state.user);
  const { appName, appLogo } = useAppStore();
  const { hasPermission } = usePermissions();

  const isSuperadmin = user?.roles?.some((r) => r.name === 'Superadmin');
  const isPartner = user?.roles?.some((r) => r.name === 'Partner');
  
  const filteredSuperadminGroups = superadminMenuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasPermission(item.permission))
  })).filter(group => group.items.length > 0);

  const filteredPartnerGroups = partnerMenuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasPermission(item.permission))
  })).filter(group => group.items.length > 0);

  // If superadmin, show superadmin menu. If partner AND NOT inside a business, show partner menu.
  // We check location.pathname to determine if we should show Partner menu (when Partner accesses /partner/*)
  const isPartnerRoute = location.pathname.startsWith('/partner');
  
  const activeMenuGroups = isSuperadmin 
    ? filteredSuperadminGroups 
    : (isPartnerRoute || (!user?.businesses?.length && isPartner)) ? filteredPartnerGroups : businessMenuGroups;

  return (
    <>
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/50 dark:bg-black/50 z-40 lg:hidden animate-in fade-in"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <div className={cn(
        "fixed lg:static inset-y-0 left-0 h-screen bg-white dark:bg-[#09090b] border-r border-slate-200 dark:border-white/5 flex-col shadow-2xl lg:shadow-sm z-50 shrink-0 transition-all duration-300 ease-in-out flex",
        isSidebarCollapsed ? "w-[260px] lg:w-[80px] -translate-x-full lg:translate-x-0" : "w-[260px] translate-x-0",
        className
      )}>
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-white/5 shrink-0 overflow-hidden">
        <div className="flex items-center">
          {appLogo ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mx-auto flex items-center justify-center bg-transparent">
              <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="bg-primary-500 p-1.5 rounded-lg w-8 h-8 flex items-center justify-center font-bold text-white shrink-0 mx-auto">
              {appName ? appName.charAt(0).toUpperCase() : 'B'}
            </div>
          )}
          {!isSidebarCollapsed && (
            <span className="font-bold text-lg tracking-tight text-slate-800 dark:text-white uppercase font-display whitespace-nowrap ml-3">
              {appName}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-6 space-y-8">
        {activeMenuGroups.map((group, idx) => (
          <div key={idx} className="px-2">
            {!isSidebarCollapsed && (
              <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.15em] mb-2.5 px-4 whitespace-nowrap transition-opacity duration-300">
                {group.title}
              </h4>
            )}
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href || (item.href === '/superadmin/dashboard' && location.pathname === '/superadmin') || (item.href === '/dashboard' && location.pathname === '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center text-[12px] font-medium tracking-[0.05em] transition-all duration-300 group relative",
                      isSidebarCollapsed ? "px-0 justify-center w-11 h-11 mx-auto rounded-sm" : "py-2.5 px-4 rounded-sm mx-2",
                      isActive
                        ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                  >
                    <item.icon
                      strokeWidth={isActive ? 2 : 1.5}
                      className={cn(
                        "flex-shrink-0 h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110",
                        isSidebarCollapsed ? "mx-auto" : "mr-3.5",
                        isActive ? "text-primary-600 dark:text-primary-500" : "text-slate-600 dark:text-slate-400 group-hover:text-primary-500"
                      )}
                    />
                    {!isSidebarCollapsed && <span className="whitespace-nowrap">{item.name}</span>}

                    {/* Animated Tooltip for Collapsed State */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-5 px-3.5 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-sm opacity-0 -translate-x-4 -rotate-12 scale-50 origin-left pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:rotate-0 group-hover:scale-100 transition-all duration-300 ease-out z-50 shadow-xl shadow-primary-500/30 flex items-center whitespace-nowrap border border-white/20">
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rotate-45 rounded-sm border-l border-b border-white/20"></div>
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-100 dark:border-white/5 shrink-0">
        <button
          onClick={() => {
            useAuthStore.getState().logout();
          }}
          className={cn(
            "flex items-center w-full text-[12px] font-medium tracking-[0.05em] transition-all duration-300 group relative text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10",
            isSidebarCollapsed ? "px-0 justify-center h-11 rounded-sm" : "py-2.5 px-4 rounded-sm"
          )}
        >
          <LogOut
            strokeWidth={1.5}
            className={cn(
              "flex-shrink-0 h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110",
              isSidebarCollapsed ? "mx-auto" : "mr-3.5"
            )}
          />
          {!isSidebarCollapsed && <span className="whitespace-nowrap">LOG OUT</span>}

          {/* Animated Tooltip for Collapsed State */}
          {isSidebarCollapsed && (
            <div className="absolute left-full ml-5 px-3.5 py-1.5 bg-rose-500 text-white text-[11px] font-black uppercase tracking-widest rounded-sm opacity-0 -translate-x-4 -rotate-12 scale-50 origin-left pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:rotate-0 group-hover:scale-100 transition-all duration-300 ease-out z-50 shadow-xl shadow-rose-500/30 flex items-center whitespace-nowrap border border-white/20">
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-rose-500 rotate-45 rounded-sm border-l border-b border-white/20"></div>
              LOG OUT
            </div>
          )}
        </button>
      </div>
    </div>
    </>
  );
}
