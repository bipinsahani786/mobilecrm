import { cn } from "@/lib/utils";
import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
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
  FileStack,
  Receipt
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { ShieldAlert, Settings, Database, Briefcase, Coins, UserCircle, LogOut, MessageSquare, Calendar, Calculator } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useFeature } from "@/hooks/useFeature";

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
      { name: "FINANCE LEDGER", href: "/finance", icon: Wallet },
      { name: "EXPENSES", href: "/expenses", icon: Receipt },
    ]
  },
  {
    title: "RELATIONSHIPS",
    items: [
      { name: "CUSTOMERS", href: "/customers", icon: Users },
      { name: "SUPPLIERS", href: "/suppliers", icon: UserPlus, feature: "suppliers" },
    ]
  },
  {
    title: "INVENTORY",
    items: [
      { name: "ITEMS", href: "/items", icon: Package },
      { name: "CATEGORIES", href: "/categories", icon: Building2 },
      { name: "BRANDS", href: "/brands", icon: FileStack },
    ]
  },
  {
    title: "STAFF & HR",
    items: [
      { name: "STAFF", href: "/staff", icon: Users },
      { name: "ATTENDANCE", href: "/attendance", icon: ClipboardList },
      { name: "PAYROLL", href: "/payroll", icon: Wallet },
      { name: "SALARY COMPONENTS", href: "/payroll/components", icon: Settings },
      { name: "LEAVE REQUESTS", href: "/hr/leave-requests", icon: Calendar },
      { name: "SALARY ADVANCES", href: "/hr/advances", icon: Coins },
    ]
  },
  {
    title: "REPORTS & AUDIT",
    items: [
      { name: "STAFF PERFORMANCE", href: "/reports/staff-performance", icon: Activity },
      { name: "SYSTEM LOGS", href: "/reports/audit-logs", icon: Database },
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

export function PortalTooltip({ text, children, visible = true }: { text: string, children: React.ReactElement, visible?: boolean }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLElement>(null);

  const handleMouseEnter = (e: any) => {
    if (visible && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
      setShow(true);
    }
    if ((children.props as any).onMouseEnter) (children.props as any).onMouseEnter(e);
  };

  const handleMouseLeave = (e: any) => {
    setShow(false);
    if ((children.props as any).onMouseLeave) (children.props as any).onMouseLeave(e);
  };

  const child = React.cloneElement(children as React.ReactElement<any>, {
    ref,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  return (
    <>
      {child}
      {show && visible && createPortal(
        <div 
          className="fixed z-[9999] px-3.5 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-sm -translate-y-1/2 shadow-xl shadow-primary-500/30 flex items-center whitespace-nowrap border border-white/20 animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rotate-45 rounded-sm border-l border-b border-white/20"></div>
          {text}
        </div>,
        document.body
      )}
    </>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { isSidebarCollapsed, setSidebarCollapsed } = useLayoutStore();
  const user = useAuthStore((state) => state.user);
  const { appName, appLogo } = useAppStore();
  const { hasPermission } = usePermissions();
  const { hasFeature } = useFeature();

  const isSuperadmin = user?.roles?.some((r) => r.name === 'Superadmin');
  const isPartner = user?.roles?.some((r) => r.name === 'Partner');
  
  const filteredBusinessGroups = businessMenuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => !item.feature || hasFeature(item.feature))
  })).filter(group => group.items.length > 0);

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
  const isBusinessManager = user?.roles?.some((r) => r.name === 'admin' || r.name === 'manager' || r.name === 'Business Admin');
  
  const filteredStaffGroups = [];
  
  if (hasPermission('manage_sales') || hasPermission('manage_inventory')) {
    const operationsItems = [];
    if (hasPermission('manage_sales')) {
      operationsItems.push({ name: "POS & BILLING", href: "/pos", icon: Calculator });
      operationsItems.push({ name: "INVOICES", href: "/invoices", icon: FileText });
    }
    if (hasPermission('manage_inventory')) {
      operationsItems.push({ name: "INVENTORY", href: "/items", icon: Package });
    }
    filteredStaffGroups.push({
      title: "OPERATIONS",
      items: operationsItems
    });
  }

  filteredStaffGroups.push({
    title: "SELF SERVICE",
    items: [
      { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
      { name: "MY ATTENDANCE", href: "/attendance", icon: ClipboardList },
      { name: "MY SALARY SLIPS", href: "/payroll", icon: Wallet },
      { name: "REQUEST LEAVE", href: "/hr/leave-requests", icon: Calendar },
      { name: "SALARY ADVANCE", href: "/hr/advances", icon: Wallet },
    ]
  });

  const activeMenuGroups = isSuperadmin 
    ? filteredSuperadminGroups 
    : (isPartnerRoute || (!user?.businesses?.length && isPartner)) 
      ? filteredPartnerGroups 
      : isBusinessManager ? filteredBusinessGroups : filteredStaffGroups;

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
                  <PortalTooltip key={item.name} text={item.name} visible={isSidebarCollapsed}>
                    <Link
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
                    </Link>
                  </PortalTooltip>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-100 dark:border-white/5 shrink-0">
        <PortalTooltip text="LOG OUT" visible={isSidebarCollapsed}>
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
          </button>
        </PortalTooltip>
      </div>
    </div>
    </>
  );
}
