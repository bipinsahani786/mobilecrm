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
import { useTenantStore } from "@/store/tenantStore";
import { ShieldAlert, Settings, Database, Briefcase, Coins, UserCircle, LogOut, MessageSquare, Calendar, Calculator } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useFeature } from "@/hooks/useFeature";
import { FeatureLockModal } from "@/features/business/components/FeatureLockModal";
import { Crown } from "lucide-react";

export const businessMenuGroups = [
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
      { name: "FINANCE LEDGER", href: "/finance", icon: Wallet, feature: 'has_finance' },
      { name: "EXPENSES", href: "/expenses", icon: Receipt },
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
      { name: "BRANDS", href: "/brands", icon: FileStack },
    ]
  },
  {
    title: "STAFF & HR",
    items: [
      { name: "STAFF", href: "/staff", icon: Users },
      { name: "ATTENDANCE", href: "/attendance", icon: ClipboardList, feature: 'has_payroll' },
      { name: "PAYROLL", href: "/payroll", icon: Wallet, feature: 'has_payroll' },
      { name: "LEAVE REQUESTS", href: "/hr/leave-requests", icon: Calendar, feature: 'has_payroll' },
      { name: "SALARY ADVANCES", href: "/hr/advances", icon: Coins, feature: 'has_payroll' },
    ]
  },
  {
    title: "REPORTS & AUDIT",
    items: [
      { name: "STAFF PERFORMANCE", href: "/reports/staff-performance", icon: Activity },
      { name: "SYSTEM LOGS", href: "/reports/audit-logs", icon: Database, feature: 'has_activity_logs' },
    ]
  },
  {
    title: "ADMINISTRATION",
    items: [
      { name: "SETTINGS", href: "/setup/settings", icon: Settings },
    ]
  }
];


export const superadminMenuGroups = [
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

export const partnerMenuGroups = [
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

export const isRouteActive = (href: string, pathname: string) => {
  return pathname === href || (href === '/superadmin/dashboard' && pathname === '/superadmin') || (href === '/dashboard' && pathname === '/');
};

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
  const { activeBusiness } = useTenantStore();
  const { hasPermission } = usePermissions();
  const { hasFeature } = useFeature();
  const [lockedFeatureName, setLockedFeatureName] = useState<string | undefined>();
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  const handleLockedClick = (e: React.MouseEvent, featureName: string) => {
    e.preventDefault();
    setLockedFeatureName(featureName);
    setIsLockModalOpen(true);
  };

  const isSuperadmin = user?.roles?.some((r) => r.name === 'Superadmin');
  const isPartner = user?.roles?.some((r) => r.name === 'Partner');

  const filteredBusinessGroups = businessMenuGroups;

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

  if (hasPermission('view_dashboard')) {
    filteredStaffGroups.push({
      title: "MAIN",
      items: [
        { name: "BUSINESS DASHBOARD", href: "/dashboard", icon: LayoutDashboard }
      ]
    });
  }

  if (hasPermission('manage_sales') || hasPermission('manage_inventory') || hasPermission('manage_expenses')) {
    const operationsItems = [];
    if (hasPermission('manage_sales')) {
      operationsItems.push({ name: "POS & BILLING", href: "/pos", icon: Calculator });
      operationsItems.push({ name: "INVOICES", href: "/invoices", icon: FileText });
    }
    if (hasPermission('manage_inventory')) {
      operationsItems.push({ name: "ITEMS", href: "/items", icon: Package });
      operationsItems.push({ name: "CATEGORIES", href: "/categories", icon: Building2 });
      operationsItems.push({ name: "BRANDS", href: "/brands", icon: FileStack });
    }
    if (hasPermission('manage_expenses')) {
      if (hasFeature('has_finance')) {
        operationsItems.push({ name: "FINANCE LEDGER", href: "/finance", icon: Wallet });
      }
      operationsItems.push({ name: "EXPENSES", href: "/expenses", icon: Receipt });
    }
    if (operationsItems.length > 0) {
      filteredStaffGroups.push({
        title: "OPERATIONS",
        items: operationsItems
      });
    }
  }

  if (hasPermission('manage_customers') || hasPermission('manage_suppliers')) {
    const relationshipItems = [];
    if (hasPermission('manage_customers')) {
      relationshipItems.push({ name: "CUSTOMERS", href: "/customers", icon: Users });
    }
    if (hasPermission('manage_suppliers')) {
      relationshipItems.push({ name: "SUPPLIERS", href: "/suppliers", icon: UserPlus });
    }
    filteredStaffGroups.push({
      title: "RELATIONSHIPS",
      items: relationshipItems
    });
  }

  if (hasPermission('manage_staff') || hasPermission('manage_payroll') || hasPermission('view_attendance')) {
    const hrItems = [];
    if (hasPermission('manage_staff')) {
      hrItems.push({ name: "STAFF", href: "/staff", icon: Users });
    }
    if (hasPermission('view_attendance') && hasFeature('has_payroll')) {
      hrItems.push({ name: "ATTENDANCE", href: "/attendance", icon: ClipboardList });
    }
    if (hasPermission('manage_payroll') && hasFeature('has_payroll')) {
      hrItems.push({ name: "PAYROLL", href: "/payroll", icon: Wallet });
    }
    if (hrItems.length > 0) {
      filteredStaffGroups.push({
        title: "STAFF & HR (MANAGEMENT)",
        items: hrItems
      });
    }
  }

  filteredStaffGroups.push({
    title: "SELF SERVICE",
    items: [
      { name: "DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
      hasFeature('has_payroll') ? { name: "MY ATTENDANCE", href: "/attendance", icon: ClipboardList } : null,
      hasFeature('has_payroll') ? { name: "MY SALARY SLIPS", href: "/payroll", icon: Wallet } : null,
      hasFeature('has_payroll') ? { name: "REQUEST LEAVE", href: "/hr/leave-requests", icon: Calendar } : null,
      hasFeature('has_payroll') ? { name: "SALARY ADVANCE", href: "/hr/advances", icon: Wallet } : null,
    ].filter(Boolean) as any[]
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
        isSidebarCollapsed ? "w-[210px] lg:w-[80px] -translate-x-full lg:translate-x-0" : "w-[210px] translate-x-0",
        className
      )}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-white/5 shrink-0 overflow-hidden">
          <div className="flex items-center">
            {activeBusiness?.settings?.whitelabel_logo || appLogo ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mx-auto flex items-center justify-center bg-transparent">
                <img src={activeBusiness?.settings?.whitelabel_logo || appLogo || undefined} alt={activeBusiness?.settings?.whitelabel_name || appName || undefined} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="bg-primary-500 p-1.5 rounded-lg w-8 h-8 flex items-center justify-center font-bold text-white shrink-0 mx-auto">
                {(activeBusiness?.settings?.whitelabel_name || appName) ? (activeBusiness?.settings?.whitelabel_name || appName).charAt(0).toUpperCase() : 'B'}
              </div>
            )}
            {!isSidebarCollapsed && (
              <span className="font-bold text-lg tracking-tight text-slate-800 dark:text-white uppercase font-display whitespace-nowrap ml-3">
                {activeBusiness?.settings?.whitelabel_name || appName}
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4 space-y-6">
            {activeMenuGroups.map((group, idx) => (
              <div key={idx} className="px-3">
                {/* Group Header */}
                {!isSidebarCollapsed ? (
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 tracking-[0.2em] uppercase whitespace-nowrap">
                      {group.title}
                    </span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
                  </div>
                ) : (
                  idx > 0 && <div className="w-6 h-px bg-slate-200 dark:bg-white/10 mx-auto mb-3" />
                )}

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href
                      || (item.href === '/superadmin/dashboard' && location.pathname === '/superadmin')
                      || (item.href === '/dashboard' && location.pathname === '/');
                    const isLocked = item.feature && !hasFeature(item.feature);

                    if (isLocked) {
                      return (
                        <PortalTooltip key={item.name} text={`${item.name} (Premium)`} visible={isSidebarCollapsed}>
                          <button
                            onClick={(e) => handleLockedClick(e, item.name)}
                            className={cn(
                              "relative flex w-full items-center text-[10px] font-semibold tracking-[0.05em] transition-all duration-200 group overflow-hidden opacity-60 hover:opacity-100",
                              isSidebarCollapsed
                                ? "justify-center h-10 mx-auto rounded-xl"
                                : "py-2.5 px-3 rounded-xl",
                              "text-slate-700 dark:text-slate-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-700 dark:hover:text-yellow-400"
                            )}
                          >
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-xl" />
                            <item.icon
                              strokeWidth={1.75}
                              className={cn(
                                "flex-shrink-0 h-[15px] w-[15px] transition-all duration-200 relative z-10",
                                isSidebarCollapsed ? "mx-auto" : "mr-2.5",
                                "text-slate-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-500"
                              )}
                            />
                            {!isSidebarCollapsed && (
                              <span className="whitespace-nowrap relative z-10 flex-1 text-left transition-all duration-200">
                                {item.name}
                              </span>
                            )}
                            {!isSidebarCollapsed && (
                              <Crown className="w-3.5 h-3.5 text-yellow-500 ml-auto shrink-0 relative z-10" />
                            )}
                            {isSidebarCollapsed && (
                              <div className="absolute -top-1 -right-1 bg-yellow-100 dark:bg-yellow-900/50 rounded-full p-0.5">
                                <Crown className="w-2.5 h-2.5 text-yellow-600 dark:text-yellow-400" />
                              </div>
                            )}
                          </button>
                        </PortalTooltip>
                      );
                    }

                    return (
                      <PortalTooltip key={item.name} text={item.name} visible={isSidebarCollapsed}>
                        <Link
                          to={item.href}
                          className={cn(
                            "relative flex items-center text-[10px] font-semibold tracking-[0.05em] transition-all duration-200 group overflow-hidden",
                            isSidebarCollapsed
                              ? "justify-center w-10 h-10 mx-auto rounded-xl"
                              : "py-2.5 px-3 rounded-xl",
                            isActive
                              ? isSidebarCollapsed
                                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                                : "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                              : "text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/8"
                          )}
                        >
                          {/* Active left bar — only in expanded mode */}
                          {isActive && !isSidebarCollapsed && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white/60" />
                          )}

                          {/* Hover shimmer */}
                          {!isActive && (
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-primary-500/5 to-transparent rounded-xl" />
                          )}

                          <item.icon
                            strokeWidth={isActive ? 2.5 : 1.75}
                            className={cn(
                              "flex-shrink-0 h-[15px] w-[15px] transition-all duration-200 relative z-10",
                              isSidebarCollapsed ? "mx-auto" : "mr-2.5",
                              isActive
                                ? "text-white drop-shadow-sm"
                                : "text-slate-600 dark:text-slate-300 group-hover:text-primary-500 group-hover:scale-110"
                            )}
                          />
                          {!isSidebarCollapsed && (
                            <span className={cn(
                              "whitespace-nowrap relative z-10 transition-all duration-200",
                              isActive ? "text-white font-bold" : "group-hover:translate-x-0.5"
                            )}>
                              {item.name}
                            </span>
                          )}

                          {/* Active dot badge in collapsed mode */}
                          {isActive && isSidebarCollapsed && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white border-2 border-primary-500" />
                          )}
                        </Link>
                      </PortalTooltip>
                    );
                  })}
                </div>
              </div>
            ))}
        </nav>

        {/* Logout Button */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-100 dark:border-white/5 shrink-0">
          <PortalTooltip text="LOG OUT" visible={isSidebarCollapsed}>
            <button
              onClick={() => useAuthStore.getState().logout()}
              className={cn(
                "relative flex items-center w-full text-[10px] font-semibold tracking-[0.05em] transition-all duration-200 group overflow-hidden",
                "text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300",
                "hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl",
                isSidebarCollapsed ? "justify-center w-10 h-10 mx-auto" : "py-2.5 px-3"
              )}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-rose-500/5 to-transparent rounded-xl" />
              <LogOut
                strokeWidth={1.75}
                className={cn(
                  "flex-shrink-0 h-[15px] w-[15px] transition-all duration-200 group-hover:scale-110 group-hover:-translate-x-0.5 relative z-10",
                  isSidebarCollapsed ? "mx-auto" : "mr-2.5"
                )}
              />
              {!isSidebarCollapsed && (
                <span className="whitespace-nowrap relative z-10 group-hover:translate-x-0.5 transition-transform duration-200">
                  LOG OUT
                </span>
              )}
            </button>
          </PortalTooltip>
        </div>
      </div>
      
      <FeatureLockModal 
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        featureName={lockedFeatureName}
      />
    </>
  );
}
