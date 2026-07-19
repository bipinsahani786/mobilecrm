import { Suspense, lazy, useEffect } from 'react';
import { useThemeStore } from './store/themeStore';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { FeatureGuard } from './components/auth/FeatureGuard';
import { useTenantStore } from './store/tenantStore';
import { Toaster } from 'sonner';
import { PageLoadingSkeleton } from './components/ui/PageLoadingSkeleton';
import { AppLayout } from './components/layout/AppLayout';
import { usePublicSettings } from '@/features/superadmin/settings/api/useSettings';
import { SettingsPage } from '@/features/superadmin/settings/pages/SettingsPage';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useAppStore } from '@/store/appStore';

const Login = lazy(() => import('@/features/auth/pages/LoginPage'));
const Dashboard = lazy(() => import('@/features/business/dashboard/pages/DashboardPage'));
const BusinessProfile = lazy(() => import('@/features/business/profile/pages/BusinessProfilePage'));
const BusinessSettings = lazy(() => import('@/features/business/settings/pages/BusinessSettingsPage'));
const CategoriesPage = lazy(() => import('@/features/business/inventory/pages/CategoriesPage'));
const BrandsPage = lazy(() => import('@/features/business/inventory/pages/BrandsPage'));
const InventoryPage = lazy(() => import('@/features/business/inventory/pages/InventoryPage'));
const SuppliersPage = lazy(() => import('@/features/business/suppliers/pages/SuppliersPage'));
const SupplierDetailsPage = lazy(() => import('@/features/business/suppliers/pages/SupplierDetailsPage'));
const AddPurchasePage = lazy(() => import('@/features/business/suppliers/pages/AddPurchasePage'));

const CustomersPage = lazy(() => import('@/features/business/customers/pages/CustomersPage'));
const CustomerDetailsPage = lazy(() => import('@/features/business/customers/pages/CustomerDetailsPage'));

const PosPage = lazy(() => import('@/features/business/pos/pages/PosPage'));
const InvoicesPage = lazy(() => import('@/features/business/pos/pages/InvoicesPage'));
const InvoiceDetailsPage = lazy(() => import('@/features/business/pos/pages/InvoiceDetailsPage'));
const ExpensesPage = lazy(() => import('@/features/business/expenses/pages/ExpensesPage'));
const FinanceLedgerPage = lazy(() => import('@/features/business/finance/pages/FinanceLedgerPage'));

// Staff & HR
const StaffPage = lazy(() => import('@/features/business/staff/pages/StaffPage'));
const StaffDetailsPage = lazy(() => import('@/features/business/staff/pages/StaffDetailsPage'));
const AttendancePage = lazy(() => import('@/features/business/attendance/pages/AttendancePage'));
const PayrollPage = lazy(() => import('@/features/business/payroll/pages/PayrollPage'));
const PayrollComponentsPage = lazy(() => import('@/features/business/payroll/pages/PayrollComponentsPage'));
const PayrollDetailsPage = lazy(() => import('@/features/business/payroll/pages/PayrollDetailsPage'));
const LeaveRequestsPage = lazy(() => import('@/features/business/hr/pages/LeaveRequestsPage'));
const SalaryAdvancesPage = lazy(() => import('@/features/business/hr/pages/SalaryAdvancesPage'));
const AuditLogsPage = lazy(() => import('@/features/business/reports/pages/AuditLogsPage'));
const StaffPerformancePage = lazy(() => import('@/features/business/reports/pages/StaffPerformancePage'));
const DocsPage = lazy(() => import('@/features/docs/pages/DocsPage'));

const SuperadminDashboard = lazy(() => import('@/features/superadmin/dashboard/pages/SuperadminDashboardPage'));
const TenantsPage = lazy(() => import('@/features/superadmin/tenants/pages/TenantsPage'));
const PlansPage = lazy(() => import('@/features/superadmin/plans/pages/PlansPage'));
const PartnersPage = lazy(() => import('@/features/superadmin/partners/pages/PartnersPage'));
const CommissionsPage = lazy(() => import('@/features/superadmin/commissions/pages/CommissionsPage'));
const LeadsPage = lazy(() => import('@/features/superadmin/leads/pages/LeadsPage'));
const UsersPage = lazy(() => import('@/features/superadmin/users/pages/UsersPage'));
const SystemLogsPage = lazy(() => import('@/features/superadmin/system/pages/SystemLogsPage'));
const RolesPage = lazy(() => import('@/features/superadmin/roles/pages/RolesPage'));
const TemplatesPage = lazy(() => import('@/features/superadmin/templates/pages/TemplatesPage'));
const MessageLogsPage = lazy(() => import('@/features/superadmin/templates/pages/MessageLogsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));

// Partner Portal Pages
const PartnerRegister = lazy(() => import('@/features/auth/pages/PartnerRegisterPage'));
const PartnerDashboard = lazy(() => import('@/features/partner/dashboard/pages/PartnerDashboardPage'));
const PartnerReferrals = lazy(() => import('@/features/partner/referrals/pages/PartnerReferralsPage'));
const PartnerCommissions = lazy(() => import('@/features/partner/commissions/pages/PartnerCommissionsPage'));
const PartnerPayouts = lazy(() => import('@/features/partner/payouts/pages/PartnerPayoutsPage'));
const PartnerProfile = lazy(() => import('@/features/partner/profile/pages/PartnerProfilePage'));
const ResourcesPage = lazy(() => import('@/features/superadmin/resources/pages/ResourcesPage'));
const PartnerResourcesPage = lazy(() => import('@/features/partner/resources/pages/PartnerResourcesPage'));

// Superadmin Payouts
const SuperadminPayouts = lazy(() => import('@/features/superadmin/payouts/pages/PayoutsPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SuperadminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isSuperadmin = user?.roles?.some(r => r.name === 'Superadmin');
  if (!isSuperadmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function BusinessRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const { activeBusiness, isLoading, hasFetched } = useTenantStore();
  const isSuperadmin = user?.roles?.some(r => r.name === 'Superadmin');
  const isPartner = user?.roles?.some(r => r.name === 'Partner');

  if (isSuperadmin) return <Navigate to="/superadmin/dashboard" replace />;
  if (isPartner && !user?.businesses?.length) return <Navigate to="/partner/dashboard" replace />;
  if (hasFetched && !activeBusiness) return <Navigate to="/setup/profile" replace />;

  return <>{children}</>;
}

function PartnerRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isPartner = user?.roles?.some(r => r.name === 'Partner');

  if (!isPartner) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Color palettes
const colorPalettes = {
  orange: {
    '--primary-50': '#fff7ed', '--primary-100': '#ffedd5', '--primary-200': '#fed7aa', '--primary-300': '#fdba74', '--primary-400': '#fb923c', '--primary-500': '#f97316', '--primary-600': '#ea580c', '--primary-700': '#c2410c', '--primary-800': '#9a3412', '--primary-900': '#7c2d12', '--primary-950': '#431407',
  },
  blue: {
    '--primary-50': '#eff6ff', '--primary-100': '#dbeafe', '--primary-200': '#bfdbfe', '--primary-300': '#93c5fd', '--primary-400': '#60a5fa', '--primary-500': '#3b82f6', '--primary-600': '#2563eb', '--primary-700': '#1d4ed8', '--primary-800': '#1e40af', '--primary-900': '#1e3a8a', '--primary-950': '#172554',
  },
  green: {
    '--primary-50': '#ecfdf5', '--primary-100': '#d1fae5', '--primary-200': '#a7f3d0', '--primary-300': '#6ee7b7', '--primary-400': '#34d399', '--primary-500': '#10b981', '--primary-600': '#059669', '--primary-700': '#047857', '--primary-800': '#065f46', '--primary-900': '#064e3b', '--primary-950': '#022c22',
  },
  purple: {
    '--primary-50': '#f5f3ff', '--primary-100': '#ede9fe', '--primary-200': '#ddd6fe', '--primary-300': '#c4b5fd', '--primary-400': '#a78bfa', '--primary-500': '#8b5cf6', '--primary-600': '#7c3aed', '--primary-700': '#6d28d9', '--primary-800': '#5b21b6', '--primary-900': '#4c1d95', '--primary-950': '#2e1065',
  },
  rose: {
    '--primary-50': '#fff1f2', '--primary-100': '#ffe4e6', '--primary-200': '#fecdd3', '--primary-300': '#fda4af', '--primary-400': '#fb7185', '--primary-500': '#f43f5e', '--primary-600': '#e11d48', '--primary-700': '#be123c', '--primary-800': '#9f1239', '--primary-900': '#881337', '--primary-950': '#4c0519',
  },
  slate: {
    '--primary-50': '#f8fafc', '--primary-100': '#f1f5f9', '--primary-200': '#e2e8f0', '--primary-300': '#cbd5e1', '--primary-400': '#94a3b8', '--primary-500': '#64748b', '--primary-600': '#475569', '--primary-700': '#334155', '--primary-800': '#1e293b', '--primary-900': '#0f172a', '--primary-950': '#020617',
  },
  teal: {
    '--primary-50': '#f0fdfa', '--primary-100': '#ccfbf1', '--primary-200': '#99f6e4', '--primary-300': '#5eead4', '--primary-400': '#2dd4bf', '--primary-500': '#14b8a6', '--primary-600': '#0d9488', '--primary-700': '#0f766e', '--primary-800': '#115e59', '--primary-900': '#134e4a', '--primary-950': '#042f2e',
  },
  red: {
    '--primary-50': '#fef2f2', '--primary-100': '#fee2e2', '--primary-200': '#fecaca', '--primary-300': '#fca5a5', '--primary-400': '#f87171', '--primary-500': '#ef4444', '--primary-600': '#dc2626', '--primary-700': '#b91c1c', '--primary-800': '#991b1b', '--primary-900': '#7f1d1d', '--primary-950': '#450a0a',
  }
};

const fontFamilies = {
  inter: { '--font-primary': '"Inter", sans-serif', '--font-heading': '"Outfit", sans-serif' },
  roboto: { '--font-primary': '"Roboto", sans-serif', '--font-heading': '"Roboto Condensed", sans-serif' },
  poppins: { '--font-primary': '"Lato", sans-serif', '--font-heading': '"Poppins", sans-serif' },
  jakarta: { '--font-primary': '"Plus Jakarta Sans", sans-serif', '--font-heading': '"Plus Jakarta Sans", sans-serif' },
  dmsans: { '--font-primary': '"DM Sans", sans-serif', '--font-heading': '"Outfit", sans-serif' },
  nunito: { '--font-primary': '"Nunito", sans-serif', '--font-heading': '"Nunito", sans-serif' },
  lato: { '--font-primary': '"Lato", sans-serif', '--font-heading': '"Lato", sans-serif' },
  rubik: { '--font-primary': '"Rubik", sans-serif', '--font-heading': '"Rubik", sans-serif' },
  cinzel: { '--font-primary': '"Inter", sans-serif', '--font-heading': '"Cinzel", serif' },
  montserrat: { '--font-primary': '"Montserrat", sans-serif', '--font-heading': '"Montserrat", sans-serif' },
};

function App() {
  usePublicSettings();
  const { theme, primaryColor, fontFamily } = useThemeStore();
  const location = useLocation();
  const { activeBusiness } = useTenantStore();
  const { appName, appLogo } = useAppStore();

  useEffect(() => {
    const title = activeBusiness?.settings?.whitelabel_name || appName || 'MobilePhoneCRM';
    document.title = title;

    const faviconUrl = activeBusiness?.settings?.whitelabel_favicon || activeBusiness?.settings?.whitelabel_logo || appLogo;
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [activeBusiness?.settings?.whitelabel_name, activeBusiness?.settings?.whitelabel_favicon, activeBusiness?.settings?.whitelabel_logo, appName, appLogo]);

  useEffect(() => {
    const root = window.document.documentElement;
    // Handle theme class
    root.classList.remove('light', 'dark', 'semi-dark');

    // Check if it's an auth page
    const isAuthPage = location.pathname === '/login' || location.pathname === '/partner/register';

    if (theme === 'dark' && !isAuthPage) {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }

    // Inject color palette
    const colors = colorPalettes[primaryColor];
    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(key, value);
    }

    // Inject fonts
    const fonts = fontFamilies[fontFamily];
    for (const [key, value] of Object.entries(fonts)) {
      root.style.setProperty(key, value);
    }
  }, [theme, primaryColor, fontFamily, location.pathname]);

  return (
    <>
      <Toaster theme={theme === 'light' ? 'light' : 'dark'} position="top-right" richColors />
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/partner/register" element={<PartnerRegister />} />

          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            {/* Business Routes */}
            <Route path="/dashboard" element={<BusinessRoute><Dashboard /></BusinessRoute>} />
            <Route path="/profile" element={<BusinessRoute><ProfilePage /></BusinessRoute>} />
            <Route path="/setup/profile" element={<BusinessProfile />} />
            <Route path="/setup/settings" element={<BusinessRoute><BusinessSettings /></BusinessRoute>} />
            <Route path="/categories" element={<BusinessRoute><CategoriesPage /></BusinessRoute>} />
            <Route path="/brands" element={<BusinessRoute><BrandsPage /></BusinessRoute>} />
            <Route path="/items" element={<BusinessRoute><InventoryPage /></BusinessRoute>} />
            <Route path="/suppliers" element={<BusinessRoute><SuppliersPage /></BusinessRoute>} />
            <Route path="/suppliers/:id" element={<BusinessRoute><SupplierDetailsPage /></BusinessRoute>} />
            <Route path="/suppliers/:id/purchases/new" element={<BusinessRoute><AddPurchasePage /></BusinessRoute>} />
            <Route path="/customers" element={<BusinessRoute><CustomersPage /></BusinessRoute>} />
            <Route path="/customers/:id" element={<BusinessRoute><CustomerDetailsPage /></BusinessRoute>} />
            <Route path="/pos" element={<BusinessRoute><PosPage /></BusinessRoute>} />
            <Route path="/invoices" element={<BusinessRoute><InvoicesPage /></BusinessRoute>} />
            <Route path="/invoices/:id" element={<BusinessRoute><InvoiceDetailsPage /></BusinessRoute>} />
            <Route path="/expenses" element={<BusinessRoute><ExpensesPage /></BusinessRoute>} />
            <Route path="/finance" element={<BusinessRoute><FinanceLedgerPage /></BusinessRoute>} />
            <Route path="/docs" element={<BusinessRoute><DocsPage /></BusinessRoute>} />

            {/* Staff & HR Routes */}
            <Route path="/staff" element={<BusinessRoute><StaffPage /></BusinessRoute>} />
            <Route path="/staff/:id" element={<BusinessRoute><StaffDetailsPage /></BusinessRoute>} />
            <Route path="/attendance" element={<BusinessRoute><AttendancePage /></BusinessRoute>} />
            <Route path="/payroll" element={<BusinessRoute><PayrollPage /></BusinessRoute>} />
            <Route path="/payroll/components" element={<BusinessRoute><PayrollComponentsPage /></BusinessRoute>} />
            <Route path="/payroll/:id" element={<BusinessRoute><PayrollDetailsPage /></BusinessRoute>} />
            <Route path="/hr/leave-requests" element={<BusinessRoute><LeaveRequestsPage /></BusinessRoute>} />
            <Route path="/hr/advances" element={<BusinessRoute><SalaryAdvancesPage /></BusinessRoute>} />

            <Route path="/reports/audit-logs" element={<BusinessRoute><AuditLogsPage /></BusinessRoute>} />
            <Route path="/reports/staff-performance" element={<BusinessRoute><StaffPerformancePage /></BusinessRoute>} />

            {/* Superadmin Routes */}
            <Route path="/superadmin/dashboard" element={<SuperadminRoute><PermissionGuard permission="view_dashboard"><SuperadminDashboard /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/profile" element={<SuperadminRoute><ProfilePage /></SuperadminRoute>} />
            <Route path="/superadmin/plans" element={<SuperadminRoute><PermissionGuard permission="manage_plans"><PlansPage /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/tenants" element={<SuperadminRoute><PermissionGuard permission="manage_tenants"><TenantsPage /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/partners" element={<SuperadminRoute><PermissionGuard permission="manage_partners"><PartnersPage /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/commissions" element={<SuperadminRoute><PermissionGuard permission="manage_commissions"><CommissionsPage /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/leads" element={<SuperadminRoute><PermissionGuard permission="manage_leads"><LeadsPage /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/users" element={<SuperadminRoute><PermissionGuard permission="manage_users"><UsersPage /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/roles" element={<SuperadminRoute><PermissionGuard permission="manage_roles"><RolesPage /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/templates" element={<SuperadminRoute><PermissionGuard permission="manage_leads"><TemplatesPage /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/message-logs" element={<SuperadminRoute><PermissionGuard permission="manage_leads"><MessageLogsPage /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/settings" element={<SuperadminRoute><PermissionGuard permission="manage_settings"><SettingsPage /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/logs" element={<SuperadminRoute><PermissionGuard permission="manage_system_logs"><SystemLogsPage /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/payouts" element={<SuperadminRoute><PermissionGuard permission="manage_payouts"><SuperadminPayouts /></PermissionGuard></SuperadminRoute>} />
            <Route path="/superadmin/resources" element={<SuperadminRoute><PermissionGuard permission="manage_settings"><ResourcesPage /></PermissionGuard></SuperadminRoute>} />

            {/* Partner Routes */}
            <Route path="/partner/dashboard" element={<PartnerRoute><PermissionGuard permission="view_partner_dashboard"><PartnerDashboard /></PermissionGuard></PartnerRoute>} />
            <Route path="/partner/referrals" element={<PartnerRoute><PermissionGuard permission="view_own_referrals"><PartnerReferrals /></PermissionGuard></PartnerRoute>} />
            <Route path="/partner/commissions" element={<PartnerRoute><PermissionGuard permission="view_own_commissions"><PartnerCommissions /></PermissionGuard></PartnerRoute>} />
            <Route path="/partner/payouts" element={<PartnerRoute><PermissionGuard permission="manage_own_payouts"><PartnerPayouts /></PermissionGuard></PartnerRoute>} />
            <Route path="/partner/profile" element={<PartnerRoute><PermissionGuard permission="manage_own_profile"><PartnerProfile /></PermissionGuard></PartnerRoute>} />
            <Route path="/partner/resources" element={<PartnerRoute><PermissionGuard permission="view_partner_dashboard"><PartnerResourcesPage /></PermissionGuard></PartnerRoute>} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
