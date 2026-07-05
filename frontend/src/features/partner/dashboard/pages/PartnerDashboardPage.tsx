import { usePartnerDashboard } from '../api/usePartnerDashboard';
import { StatCard } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/layout/PageHeader';
import { LayoutDashboard, Building2, IndianRupee, Clock, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { EarningsChart } from '../components/EarningsChart';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatCardSkeleton } from '@/components/ui/skeleton-loaders';

export default function PartnerDashboardPage() {
  const { data: dashboard, isLoading } = usePartnerDashboard();

  const stats = dashboard?.stats;

  const referralColumns: ColumnDef<any>[] = [
    { accessorKey: 'name', header: 'Business', cell: (row: any) => (
      <span className="font-semibold text-slate-800 dark:text-white">{row.name}</span>
    )},
    { accessorKey: 'plan', header: 'Plan', cell: (row: any) => (
      <span className="text-sm text-slate-500">{row.plan?.name || '—'}</span>
    )},
    { accessorKey: 'status', header: 'Status', cell: (row: any) => (
      <StatusBadge status={row.status} />
    )},
    { accessorKey: 'created_at', header: 'Joined', cell: (row: any) => (
      <span className="text-sm text-slate-500">{new Date(row.created_at).toLocaleDateString('en-IN')}</span>
    )},
  ];

  const commissionColumns: ColumnDef<any>[] = [
    { accessorKey: 'business', header: 'Business', cell: (row: any) => (
      <span className="font-semibold text-slate-800 dark:text-white">{row.business?.name || '—'}</span>
    )},
    { accessorKey: 'commission_amount', header: 'Commission', cell: (row: any) => (
      <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{row.commission_amount?.toLocaleString('en-IN')}</span>
    )},
    { accessorKey: 'status', header: 'Status', cell: (row: any) => (
      <StatusBadge status={row.status} />
    )},
    { accessorKey: 'created_at', header: 'Date', cell: (row: any) => (
      <span className="text-sm text-slate-500">{new Date(row.created_at).toLocaleDateString('en-IN')}</span>
    )},
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
        <PageHeader
          icon={LayoutDashboard}
          title="Partner Dashboard"
          subtitle="Track your referrals, commissions, and earnings"
        />
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCardSkeleton count={6} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 dark:bg-white/5 animate-pulse rounded-xl w-full"></div>
            <div className="h-64 bg-slate-200 dark:bg-white/5 animate-pulse rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={LayoutDashboard}
        title="Partner Dashboard"
        subtitle="Track your referrals, commissions, and earnings"
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Referrals"
            value={stats?.total_referrals ?? 0}
            icon={Users}
            subtitle={`${stats?.active_businesses ?? 0} active`}
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats?.conversion_rate ?? 0}%`}
            icon={TrendingUp}
            subtitle={`${stats?.converted_leads ?? 0} of ${stats?.total_leads ?? 0} leads`}
          />
          <StatCard
            title="Active Businesses"
            value={stats?.active_businesses ?? 0}
            icon={Building2}
          />
          <StatCard
            title="Total Earned"
            value={`₹${(stats?.total_earned ?? 0).toLocaleString('en-IN')}`}
            icon={IndianRupee}
            subtitle="Lifetime earnings"
          />
          <StatCard
            title="Paid Out"
            value={`₹${(stats?.paid_amount ?? 0).toLocaleString('en-IN')}`}
            icon={IndianRupee}
            subtitle="Amount received"
          />
          <StatCard
            title="Pending Payout"
            value={`₹${(stats?.pending_amount ?? 0).toLocaleString('en-IN')}`}
            icon={Clock}
            subtitle={`₹${(stats?.available_payout ?? 0).toLocaleString('en-IN')} available`}
          />
          {(stats?.platform_dues ?? 0) > 0 && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">Platform Dues</h3>
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ₹{(stats?.platform_dues ?? 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-red-500 dark:text-red-400/80 mt-1">
                Amount you owe for offline collections
              </p>
            </div>
          )}
          {(stats?.total_dues_paid ?? 0) > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300">Settled Dues</h3>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{(stats?.total_dues_paid ?? 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-emerald-500 dark:text-emerald-400/80 mt-1">
                Offline cash you have successfully settled
              </p>
            </div>
          )}
        </div>

        {/* Earnings Chart */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-4">Monthly Earnings</h3>
          <EarningsChart data={dashboard?.monthly_earnings ?? []} />
        </div>

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Referrals */}
          <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Recent Referrals</h3>
            </div>
            <div className="p-4">
              <DataTable
                data={dashboard?.recent_referrals ?? []}
                columns={referralColumns}
                isLoading={false}
                searchable={false}
                emptyIcon={<Building2 className="w-10 h-10 text-slate-300" />}
                emptyMessage="No referrals yet"
              />
            </div>
          </div>

          {/* Recent Commissions */}
          <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Recent Commissions</h3>
            </div>
            <div className="p-4">
              <DataTable
                data={dashboard?.recent_commissions ?? []}
                columns={commissionColumns}
                isLoading={false}
                searchable={false}
                emptyIcon={<IndianRupee className="w-10 h-10 text-slate-300" />}
                emptyMessage="No commissions yet"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
