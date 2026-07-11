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
  ShieldAlert,
  Settings,
  Database,
  Briefcase,
  Coins,
  UserCircle,
  LogOut,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { useLayoutStore } from "@/store/layoutStore";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { usePermissions } from "@/hooks/usePermissions";

export const businessMenuGroups = [
  {
    title: "MAIN",
    items: [
      {
        name: "DASHBOARD",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "SALES & OPERATIONS",
    items: [
      {
        name: "NEW BILL (POS)",
        href: "/pos",
        icon: FileText,
      },
      {
        name: "ALL INVOICES",
        href: "/invoices",
        icon: ClipboardList,
      },
      {
        name: "QUOTATIONS",
        href: "/quotations",
        icon: Activity,
      },
    ],
  },

  {
    title: "RELATIONSHIPS",
    items: [
      {
        name: "CUSTOMERS",
        href: "/customers",
        icon: Users,
      },
      {
        name: "SUPPLIERS",
        href: "/suppliers",
        icon: UserPlus,
      },
    ],
  },

  {
    title: "INVENTORY",
    items: [
      {
        name: "ITEMS",
        href: "/items",
        icon: Package,
      },
      {
        name: "CATEGORIES",
        href: "/categories",
        icon: Building2,
      },
      {
        name: "BRANDS",
        href: "/brands",
        icon: FileStack,
      },
    ],
  },
];

export const superadminMenuGroups = [
  {
    title: "GLOBAL",
    items: [
      {
        name: "SYSTEM OVERVIEW",
        href: "/superadmin/dashboard",
        icon: ShieldAlert,
        permission: "view_dashboard",
      },
      {
        name: "SUBSCRIPTION PLANS",
        href: "/superadmin/plans",
        icon: Package,
        permission: "manage_plans",
      },
      {
        name: "TENANTS / BUSINESSES",
        href: "/superadmin/tenants",
        icon: Building2,
        permission: "manage_tenants",
      },
    ],
  },

  {
    title: "PARTNER PROGRAM",
    items: [
      {
        name: "SALES AGENTS",
        href: "/superadmin/partners",
        icon: Briefcase,
        permission: "manage_partners",
      },
      {
        name: "LEADS",
        href: "/superadmin/leads",
        icon: UserCircle,
        permission: "manage_leads",
      },
      {
        name: "MESSAGE TEMPLATES",
        href: "/superadmin/templates",
        icon: MessageSquare,
        permission: "manage_leads",
      },
      {
        name: "CAMPAIGN LOGS",
        href: "/superadmin/message-logs",
        icon: Database,
        permission: "manage_leads",
      },
      {
        name: "MARKETING ASSETS",
        href: "/superadmin/resources",
        icon: FileStack,
        permission: "manage_settings",
      },
      {
        name: "COMMISSIONS",
        href: "/superadmin/commissions",
        icon: Coins,
        permission: "manage_commissions",
      },
      {
        name: "PAYOUT REQUESTS",
        href: "/superadmin/payouts",
        icon: Wallet,
        permission: "manage_payouts",
      },
    ],
  },

  {
    title: "ADMINISTRATION",
    items: [
      {
        name: "ALL USERS",
        href: "/superadmin/users",
        icon: Users,
        permission: "manage_users",
      },
      {
        name: "ROLES & PERMISSIONS",
        href: "/superadmin/roles",
        icon: ShieldAlert,
        permission: "manage_roles",
      },
      {
        name: "SETTINGS",
        href: "/superadmin/settings",
        icon: Settings,
        permission: "manage_settings",
      },
      {
        name: "SYSTEM LOGS",
        href: "/superadmin/logs",
        icon: Database,
        permission: "manage_system_logs",
      },
    ],
  },
];

const partnerMenuGroups = [
  {
    title: "PARTNER PORTAL",
    items: [
      {
        name: "DASHBOARD",
        href: "/partner/dashboard",
        icon: LayoutDashboard,
        permission: "view_partner_dashboard",
      },
      {
        name: "MY REFERRALS",
        href: "/partner/referrals",
        icon: Building2,
        permission: "view_own_referrals",
      },
      {
        name: "COMMISSIONS",
        href: "/partner/commissions",
        icon: Coins,
        permission: "view_own_commissions",
      },
      {
        name: "PAYOUTS",
        href: "/partner/payouts",
        icon: Wallet,
        permission: "manage_own_payouts",
      },
      {

        name: "MARKETING ASSETS",
        href: "/partner/resources",
        icon: FileStack,
        permission: "view_partner_dashboard",
      },
    ],
  },

  {
    title: "ACCOUNT",
    items: [
      {
        name: "PROFILE & SETTINGS",
        href: "/partner/profile",
        icon: UserCircle,
        permission: "manage_own_profile",
      },
    ],
  },
];

export const isRouteActive = (href: string, pathname: string) => {
  return (
    pathname === href ||
    (href === "/dashboard" && pathname === "/") ||
    (href === "/superadmin/dashboard" && pathname === "/superadmin")
  );
};

function PortalTooltip({
  text,
  children,
  visible,
}: {
  text: string;
  children: React.ReactElement;
  visible: boolean;
}) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
  });

  const ref = useRef<HTMLElement>(null);

  const handleMouseEnter = (e: any) => {
    if (visible && ref.current) {
      const rect = ref.current.getBoundingClientRect();

      setPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });

      setShow(true);
    }

    children.props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: any) => {
    setShow(false);
    children.props.onMouseLeave?.(e);
  };

  const child = React.cloneElement(children, {
    ref,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });

  return (
    <>
      {child}

      {show &&
        visible &&
        createPortal(
          <div
            className="
              fixed
              z-[9999]
              px-3
              py-1
              bg-gradient-to-r
              from-primary-500
              to-primary-600
              text-white
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              rounded-md
              -translate-y-1/2
              shadow-xl
              whitespace-nowrap
              border
              border-white/20
              animate-in
              fade-in
              zoom-in-95
              duration-200
              pointer-events-none
            "
            style={{
              top: pos.top,
              left: pos.left,
            }}
          >
            <div
              className="
                absolute
                -left-1
                top-1/2
                -translate-y-1/2
                w-2.5
                h-2.5
                rotate-45
                bg-primary-500
              "
            />
            {text}
          </div>,
          document.body
        )}
    </>
  );
}

export function Sidebar({
  className,
}: {
  className?: string;
}) {
  const location = useLocation();

  const {
    isSidebarCollapsed,
    setSidebarCollapsed,
  } = useLayoutStore();

  const user = useAuthStore((state) => state.user);

  const {
    appName,
    appLogo,
  } = useAppStore();

  const {
    hasPermission,
  } = usePermissions();

  const isSuperadmin =
    user?.roles?.some(
      (r) => r.name === "Superadmin"
    );
  const isPartner =
    user?.roles?.some(
      (r) => r.name === "Partner"
    );

  const filteredSuperadminGroups = superadminMenuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        hasPermission(item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);

  const filteredPartnerGroups = partnerMenuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        hasPermission(item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);

  const isPartnerRoute =
    location.pathname.startsWith("/partner");

  const activeMenuGroups = isSuperadmin
    ? filteredSuperadminGroups
    : isPartnerRoute ||
      (!user?.businesses?.length && isPartner)
      ? filteredPartnerGroups
      : businessMenuGroups;

  return (
    <>
      {!isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() =>
            setSidebarCollapsed(true)
          }
        />
      )}

      <aside
        className={cn(
          "fixed lg:static left-0 top-0 h-screen bg-white dark:bg-[#09090b] border-r border-slate-200 dark:border-white/5 flex flex-col transition-all duration-300 ease-out z-50",

          isSidebarCollapsed
            ? "w-[78px] -translate-x-full lg:translate-x-0"
            : "w-[220px] translate-x-0",

          className
        )}
      >
        {/* Logo */}

        <div className="h-16 flex items-center px-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center w-full">
            {appLogo ? (
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={appLogo}
                  alt={appName}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary-500 text-white flex items-center justify-center font-bold">
                {appName?.charAt(0).toUpperCase() ?? "B"}
              </div>
            )}

            {!isSidebarCollapsed && (
              <span className="ml-3 text-[15px] font-bold tracking-tight text-slate-800 dark:text-white truncate">
                {appName}
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto py-5 custom-scrollbar">

          {activeMenuGroups.map((group, idx) => (

            <div key={idx} className="mb-6">

              {!isSidebarCollapsed && (

                <h4 className="px-5 mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">

                  {group.title}

                </h4>

              )}

              <div className="space-y-1">

                {group.items.map((item) => {

                  const isActive =
                    location.pathname === item.href ||
                    (item.href === "/dashboard" &&
                      location.pathname === "/") ||
                    (item.href ===
                      "/superadmin/dashboard" &&
                      location.pathname ===
                      "/superadmin");

                  return (

                    <PortalTooltip
                      key={item.name}
                      text={item.name}
                      visible={isSidebarCollapsed}
                    >

                      <Link
                        to={item.href}
                        className={cn(
                          "group relative flex items-center transition-all duration-300 overflow-hidden",

                          isSidebarCollapsed
                            ? "w-11 h-11 mx-auto justify-center rounded-xl"
                            : "mx-2 h-10 px-3 rounded-xl",

                          isActive
                            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary-600 hover:-translate-y-[2px]"
                        )}
                      >
                        {/* Active Left Bar */}
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white shadow-[0_0_10px_rgba(255,255,255,.8)]" />
                        )}

                        {/* Hover Glow */}
                        <span
                          className={cn(
                            "absolute inset-0 opacity-0 transition-opacity duration-300 rounded-xl",
                            !isActive &&
                            "group-hover:opacity-100 bg-gradient-to-r from-primary-500/10 via-primary-400/5 to-transparent"
                          )}
                        />

                        {/* Icon */}
                        <item.icon
                          strokeWidth={isActive ? 2.2 : 1.8}
                          className={cn(
                            "relative z-10 h-4 w-4 transition-all duration-300",
                            isSidebarCollapsed
                              ? ""
                              : "mr-3",
                            isActive
                              ? "text-white scale-110"
                              : "text-slate-500 group-hover:text-primary-600 group-hover:scale-110"
                          )}
                        />

                        {!isSidebarCollapsed && (
                          <span
                            className={cn(
                              "relative z-10 flex-1 text-[11px] font-medium tracking-[0.02em] whitespace-nowrap transition-all duration-300",
                              isActive
                                ? "text-white"
                                : "group-hover:translate-x-1"
                            )}
                          >
                            {item.name}
                          </span>
                        )}

                        {!isSidebarCollapsed && (
                          <ChevronRight
                            className={cn(
                              "relative z-10 h-3.5 w-3.5 transition-all duration-300",
                              isActive
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                            )}
                          />
                        )}
                      </Link>
                    </PortalTooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}

        <div className="border-t border-slate-100 dark:border-white/5 p-3">

          <PortalTooltip
            text="LOG OUT"
            visible={isSidebarCollapsed}
          >

            <button
              onClick={() =>
                useAuthStore.getState().logout()
              }
              className={cn(
                "group flex items-center w-full rounded-xl transition-all duration-300 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10",

                isSidebarCollapsed
                  ? "justify-center h-11"
                  : "px-3 h-10"
              )}
            >

              <LogOut
                className={cn(
                  "h-4 w-4 transition-transform duration-300 group-hover:scale-110",

                  isSidebarCollapsed
                    ? ""
                    : "mr-3"
                )}
              />

              {!isSidebarCollapsed && (

                <span className="text-[11px] font-medium tracking-[0.02em]">

                  LOG OUT

                </span>

              )}

            </button>

          </PortalTooltip>

        </div>

      </aside>

    </>

  );

}