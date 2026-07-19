import { Building2, ArrowRight, TrendingUp, IndianRupee, Users, Clock, Receipt, CheckCircle2, AlertCircle, BarChart3, Sparkles, Calendar, Coins, Wallet } from "lucide-react";
import { DashboardSkeleton } from "./../components/DashboardSkeleton";
import { useTenantStore } from "@/store/tenantStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useStaffEarnings } from "../api/useDashboard";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { CustomKpiCard } from "@/components/ui/CustomKpiCard";
import { useAuthStore } from "@/store/authStore";
import { usePermissions } from "@/hooks/usePermissions";
import { useStaffPerformance } from "../../reports/api/useStaffPerformance";
import { useTodayAttendance } from "../../attendance/api/useAttendance";
import { useFeature } from "@/hooks/useFeature";

export default function DashboardPage() {
  const { activeBusiness, isLoading: isTenantLoading } = useTenantStore();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { hasPermission } = usePermissions();

  const isBusinessManager = user?.roles?.some((r) => r.name === 'admin' || r.name === 'manager' || r.name === 'Business Admin' || r.name === 'Superadmin');
  const canViewBusinessDashboard = isBusinessManager || hasPermission('view_dashboard');
  const showStaffDashboard = !isBusinessManager;

  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: staffEarnings } = useStaffEarnings();

  const today = new Date();
  const from_date = format(startOfMonth(today), 'yyyy-MM-dd');
  const to_date = format(endOfMonth(today), 'yyyy-MM-dd');

  const { hasFeature } = useFeature();
  const hasHr = hasFeature('has_hr');

  const { data: performanceData } = useStaffPerformance({ from_date, to_date }, { enabled: hasHr });
  const { data: todayAttendance } = useTodayAttendance({ enabled: hasHr });

  const myPerformance = performanceData?.find((p: any) => p.user_id === user?.id);

  if (isTenantLoading || isStatsLoading) {
    return <DashboardSkeleton />;
  }

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (!activeBusiness) return 0;
    const requiredFields = ['name', 'phone', 'email', 'address', 'gst_number', 'logo_path', 'signature_path'];
    const completed = requiredFields.filter(f => !!(activeBusiness as any)[f]).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  const percentage = getCompletionPercentage();

  const statusConfig: Record<string, { label: string; cls: string }> = {
    paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
    pending: { label: 'Pending', cls: 'bg-amber-50  text-amber-600  dark:bg-amber-500/15  dark:text-amber-400' },
    overdue: { label: 'Overdue', cls: 'bg-rose-50   text-rose-600   dark:bg-rose-500/15   dark:text-rose-400' },
    partial: { label: 'Partial', cls: 'bg-blue-50   text-blue-600   dark:bg-blue-500/15   dark:text-blue-400' },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f]">
      {/* ── Hero Header Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 dark:from-primary-800 dark:via-primary-700 dark:to-indigo-800 px-5 md:px-10 pt-7 pb-16">

        {/* ── Animated Decorative Shapes ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">

          {/* Large pulsing glow circle — top right */}
          <div className="animate-pulse-slow absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/10 blur-2xl" />

          {/* Floating solid circle — top left area */}
          <div className="animate-float absolute top-8 left-[8%] w-16 h-16 rounded-full bg-white/15 border border-white/20 shadow-lg shadow-white/10" />

          {/* Floating smaller circle — mid right */}
          <div className="animate-float2 absolute top-6 right-[18%] w-10 h-10 rounded-full bg-indigo-300/30 border border-white/20 shadow-md" />

          {/* Spinning ring — center */}
          <div className="animate-spin-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-dashed border-white/10" />

          {/* Floating square (rotated diamond) — bottom left */}
          <div className="animate-float3 absolute bottom-6 left-[22%] w-12 h-12 rounded-lg bg-white/10 border border-white/20 shadow-md" />

          {/* Drifting pill — bottom right */}
          <div className="animate-drift absolute bottom-8 right-[12%] w-24 h-8 rounded-full bg-white/10 border border-white/15" />

          {/* Small dot cluster */}
          <div className="absolute top-1/3 left-[40%] flex gap-2 opacity-40">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse-slow" style={{ animationDelay: '0s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>

          {/* Bottom blur wash */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-indigo-700/40 to-transparent" />
        </div>

        {/* ── Hero Content ── */}
        <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                {format(today, 'EEEE, dd MMMM yyyy')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display leading-tight drop-shadow-lg">
              Welcome back, {user?.name || 'Staff'} 👋
            </h1>
            <p className="text-sm text-white/65 mt-1.5 font-medium">
              {activeBusiness?.name || 'Your Business'} &nbsp;·&nbsp; {isBusinessManager ? 'Live overview' : 'Staff overview'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(!user?.roles || isBusinessManager || hasPermission('manage_sales')) && (
              <button
                onClick={() => navigate('/pos')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary-600 font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                New Bill
              </button>
            )}
            {(!user?.roles || isBusinessManager || hasPermission('manage_sales')) && (
              <button
                onClick={() => navigate('/invoices')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-white/25 hover:bg-white/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md"
              >
                <Receipt className="w-3.5 h-3.5" />
                Invoices
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content (overlaps hero) ─────────── */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-8 -mt-10 pb-8 space-y-4">

        {/* ── KPI Cards — floating over banner ─────────────────────── */}
        {canViewBusinessDashboard && (
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-3 ml-1 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-xl p-2 rounded-xl inline-block shadow-sm">Business Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <CustomKpiCard
              title="Today's Sales"
              value={`₹${(stats?.today_sales ?? 0).toLocaleString('en-IN')}`}
              icon={<IndianRupee />}
              glowColor="indigo"
              onClick={() => navigate('/invoices')}
            />
            <CustomKpiCard
              title="Monthly Revenue"
              value={`₹${(stats?.monthly_revenue ?? 0).toLocaleString('en-IN')}`}
              icon={<TrendingUp />}
              glowColor="emerald"
            />
            <CustomKpiCard
              title="Monthly Expenses"
              value={`₹${(stats?.monthly_expenses ?? 0).toLocaleString('en-IN')}`}
              icon={<Wallet />}
              glowColor="rose"
              onClick={() => navigate('/expenses')}
            />
            <CustomKpiCard
              title="Pending Payments"
              value={`₹${(stats?.pending_payments ?? 0).toLocaleString('en-IN')}`}
              icon={<Clock />}
              glowColor="amber"
            />
            <CustomKpiCard
              title="Staff Present"
              value={stats?.staff?.present_today ?? 0}
              subtitle={`${stats?.staff?.active ?? 0} total active`}
              icon={<Users />}
              glowColor="blue"
              onClick={() => navigate('/staff')}
            />
            <CustomKpiCard
              title="Total Invoices"
              value={stats?.total_invoices ?? 0}
              subtitle="this month"
              icon={<Receipt />}
              glowColor="purple"
              onClick={() => navigate('/invoices')}
            />
          </div>
          </div>
        )}
        
        {showStaffDashboard && (
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-3 ml-1 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-xl p-2 rounded-xl inline-block shadow-sm">My Staff Dashboard</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <CustomKpiCard
              title="Today's Earnings"
              value={`₹${(staffEarnings?.today_earnings ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              subtitle="Earned today (Attendance + Commission)"
              icon={<IndianRupee />}
              glowColor="emerald"
            />
            <CustomKpiCard
              title="This Month's Earnings"
              value={`₹${(staffEarnings?.monthly_earnings ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              subtitle="Calculated till date"
              icon={<TrendingUp />}
              glowColor="indigo"
            />
            <CustomKpiCard
              title="Advance Taken"
              value={`₹${(staffEarnings?.advance_taken ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              subtitle="Approved advances this month"
              icon={<IndianRupee />}
              glowColor="rose"
            />
            <CustomKpiCard
              title="Total Dues (Unpaid)"
              value={`₹${(staffEarnings?.total_dues ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              subtitle="Total pending payment from owner"
              icon={<Wallet />}
              glowColor="amber"
            />
            <CustomKpiCard
              title="Attendance Status"
              value={todayAttendance ? (todayAttendance.status === 'present' ? 'Checked In' : 'Half Day') : 'Not Checked In'}
              subtitle={todayAttendance?.check_in_time ? `Checked in at ${todayAttendance.check_in_time.substring(0, 5)}` : 'Tap Quick Action to check in'}
              icon={<Clock />}
              glowColor={todayAttendance ? 'emerald' : 'rose'}
              onClick={() => navigate('/attendance')}
            />
          </div>
          </div>
        )}


        {/* ── Main Grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column — 2/3 width */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Staff snapshot (Moved here) */}
            {isBusinessManager && (
              <div className="bg-white dark:bg-[#111118] rounded-2xl border border-slate-200/70 dark:border-white/[0.06] shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Staff Today</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stats?.staff?.present_today ?? 0}</span>
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500">/ {stats?.staff?.active ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full sm:max-w-xs md:max-w-sm">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Present</span>
                    <button
                      onClick={() => navigate('/attendance')}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  {(stats?.staff?.active ?? 0) > 0 && (
                    <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.round(((stats?.staff?.present_today ?? 0) / (stats?.staff?.active ?? 1)) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Sales */}
            <div className="bg-white dark:bg-[#111118] rounded-2xl border border-slate-200/70 dark:border-white/[0.06] shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    {isBusinessManager ? "Recent Sales" : "My Recent Sales"}
                  </h2>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Latest transactions</p>
                </div>
              </div>
              {(!user?.roles || isBusinessManager || hasPermission('manage_sales')) && (
                <button
                  onClick={() => navigate('/invoices')}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-600 transition-colors"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50 dark:divide-white/[0.03]">
              {(() => {
                const salesToDisplay = isBusinessManager
                  ? stats?.recent_sales
                  : stats?.recent_sales?.filter((sale: any) => sale.user_id === user?.id);

                return salesToDisplay?.length ? (
                  salesToDisplay.map((sale: any, i: number) => {
                    const sc = statusConfig[sale.status] ?? { label: sale.status, cls: 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400' };
                    return (
                      <div
                        key={sale.id}
                        onClick={() => (isBusinessManager || hasPermission('manage_sales')) ? navigate(`/invoices/${sale.id}`) : undefined}
                        className="group flex items-center px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.025] transition-colors cursor-pointer"
                      >
                        {/* Index */}
                        <span className="w-6 text-[10px] font-black text-slate-300 dark:text-slate-700 shrink-0 group-hover:text-primary-400 transition-colors">
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-black shrink-0 mx-3 shadow-sm">
                          {(sale.customer?.name || 'W')[0].toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate leading-tight">
                            {sale.customer?.name || 'Walk-in Customer'}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                            {sale.invoice_number} &nbsp;·&nbsp; {format(new Date(sale.date), 'dd MMM yyyy')}
                          </p>
                        </div>

                        {/* Amount & Status */}
                        <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            ₹{Number(sale.final_amount).toLocaleString('en-IN')}
                          </span>
                          <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full ${sc.cls}`}>
                            {sc.label}
                          </span>
                        </div>

                        {(isBusinessManager || hasPermission('manage_sales')) && (
                          <ArrowRight className="w-3.5 h-3.5 ml-3 text-slate-300 dark:text-slate-700 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                      <Receipt className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                      {isBusinessManager ? "No recent sales" : "No recent sales from you"}
                    </p>
                    {(!user?.roles || isBusinessManager || hasPermission('manage_sales')) ? (
                      <>
                        <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Start billing to see transactions here</p>
                        <button
                          onClick={() => navigate('/pos')}
                          className="mt-4 px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-xl hover:bg-primary-600 transition-colors"
                        >
                          Open POS
                        </button>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">You haven't billed any sales yet.</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right sidebar panel */}
        <div className="flex flex-col gap-6">

            {/* Complete Business Profile */}
            {isBusinessManager && (
              percentage < 100 ? (
                <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 shadow-lg shadow-amber-500/20">
                  {/* Decorative circles */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
                  <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/5" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-2xl font-black text-white">{percentage}%</span>
                    </div>

                    <h3 className="text-sm font-black text-white mb-1">Complete Your Profile</h3>
                    <p className="text-[11px] text-white/75 font-medium leading-relaxed mb-4">
                      Unlock all features by completing your business profile setup.
                    </p>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <Button
                      onClick={() => navigate('/setup/profile')}
                      className="w-full bg-white text-amber-600 hover:bg-amber-50 font-black text-xs uppercase tracking-widest rounded-xl h-9 shadow-sm"
                    >
                      {activeBusiness ? 'Complete Profile' : 'Setup Business'}
                      <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-lg shadow-emerald-500/20">
                  <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                  <div className="relative z-10 flex flex-col items-center text-center py-2">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 shadow-sm">
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-sm font-black text-white mb-1">Profile Complete!</h3>
                    <p className="text-[11px] text-white/75 font-medium">All business details are set up and verified.</p>
                  </div>
                </div>
              )
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#111118] rounded-2xl border border-slate-200/70 dark:border-white/[0.06] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Quick Actions</h3>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {(isBusinessManager ? [
                  { label: 'New Sale', icon: IndianRupee, href: '/pos', color: 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400' },
                  { label: 'Add Staff', icon: Users, href: '/staff', color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' },
                  { label: 'Customers', icon: Users, href: '/customers', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                  { label: 'Inventory', icon: Receipt, href: '/items', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                  { label: 'Expenses', icon: Receipt, href: '/expenses', color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' },
                  { label: 'Reports', icon: BarChart3, href: '/reports/staff-performance', color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' },
                ] : [
                  ...(hasPermission('manage_sales') ? [{ label: 'New Sale', icon: IndianRupee, href: '/pos', color: 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400' }] : []),
                  { label: 'My Attendance', icon: Clock, href: '/attendance', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                  { label: 'Salary Slips', icon: Wallet, href: '/payroll', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                  { label: 'Request Leave', icon: Calendar, href: '/hr/leave-requests', color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' },
                  { label: 'Salary Advance', icon: Coins, href: '/hr/advances', color: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400' },
                ]).map(({ label, icon: Icon, href, color }) => (
                  <button
                    key={label}
                    onClick={() => navigate(href)}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors uppercase tracking-wider">{label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
