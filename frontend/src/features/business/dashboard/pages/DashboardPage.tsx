import { Building2, ArrowRight, TrendingUp, IndianRupee, Users, Clock, Receipt } from "lucide-react";
import { DashboardSkeleton } from "./../components/DashboardSkeleton";
import { useTenantStore } from "@/store/tenantStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "../api/useDashboard";
import { format } from "date-fns";
import { CustomKpiCard } from "@/components/ui/CustomKpiCard";

export default function DashboardPage() {
  const { activeBusiness, isLoading: isTenantLoading } = useTenantStore();
  const navigate = useNavigate();

  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6 space-y-6 md:space-y-8">

        {/* Complete Profile Widget */}
        {percentage < 100 && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 md:p-8 border border-primary-100 dark:border-primary-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

            <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full">
              <div className="w-10 h-10 md:w-16 md:h-16 shrink-0 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-primary-100 dark:border-primary-800">
                <Building2 className="w-5 h-5 md:w-8 md:h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-0.5 sm:mb-1 truncate">Complete Your Business Profile</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm">You need to complete your profile to unlock all features and generate a Business Card.</p>

                {/* Progress Bar */}
                <div className="mt-3 md:mt-4 flex items-center gap-4">
                  <div className="flex-1 h-2 bg-primary-200/60 dark:bg-primary-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-1000" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-xs md:text-sm font-bold text-primary-700 dark:text-primary-400">{percentage}%</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate('/setup/profile')}
              className="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 shrink-0 relative z-10 w-full md:w-auto shadow-sm hover:shadow font-semibold tracking-wide rounded-lg px-5 py-2 text-sm transition-all"
            >
              {activeBusiness ? 'Complete Profile' : 'Setup Business'}
              <ArrowRight className="w-4 h-4 ml-2 opacity-80" />
            </Button>
          </div>
        )}

        {/* Main Stats Grid — Superadmin-style glowing KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <CustomKpiCard
            title="Today's Sales"
            value={`₹${stats?.today_sales?.toLocaleString() || 0}`}
            icon={<IndianRupee />}
            glowColor="indigo"
          />
          <CustomKpiCard
            title="Monthly Revenue"
            value={`₹${stats?.monthly_revenue?.toLocaleString() || 0}`}
            icon={<TrendingUp />}
            glowColor="emerald"
          />
          <CustomKpiCard
            title="Pending Payments"
            value={`₹${stats?.pending_payments?.toLocaleString() || 0}`}
            icon={<Clock />}
            glowColor="rose"
          />
          <CustomKpiCard
            title="Staff Present"
            value={stats?.staff?.present_today || 0}
            subtitle={`${stats?.staff?.active || 0} active total`}
            icon={<Users />}
            glowColor="blue"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary-500" />
              Recent Sales
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')} className="text-xs h-8">
              View All
            </Button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {stats?.recent_sales?.length ? (
              stats.recent_sales.map((sale: any) => (
                <div
                  key={sale.id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => navigate(`/invoices/${sale.id}`)}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">{sale.customer?.name || 'Walk-in Customer'}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{sale.invoice_number} • {format(new Date(sale.date), 'dd MMM yyyy')}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-slate-900 dark:text-white">₹{Number(sale.final_amount).toLocaleString()}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${
                      sale.status === 'paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' :
                      sale.status === 'pending' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' :
                      'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No recent sales found.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
