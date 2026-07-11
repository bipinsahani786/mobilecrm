import React, { useState } from "react";
import {
  TrendingUp, Users, Award,
  AlertTriangle, Calendar,
  Activity, DollarSign, Target, Shield
} from "lucide-react";
import { DashboardSkeleton } from "@/features/business/dashboard/components/DashboardSkeleton";
import { useSuperadminDashboardStats } from "../api/useSuperadminDashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  FilterContainer,
  FilterDate,
  FilterReset
} from "@/components/ui/filter-controls";

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getDaysRemaining = (expiryStr: string | null) => {
  if (!expiryStr) return 0;
  const diff = new Date(expiryStr).getTime() - new Date().getTime();
  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
};

function CustomKpiCard({ title, value, subtitle, icon, glowColor }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  glowColor: 'blue' | 'emerald' | 'indigo' | 'purple' | 'amber' | 'rose';
}) {
  const colorMap = {
    blue: {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    },
    indigo: {
      bg: "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    },
    rose: {
      bg: "bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    }
  };

  const colors = colorMap[glowColor];

  return (
    <div className={`transition-all duration-300 relative overflow-hidden group rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 p-4 sm:p-5 flex flex-col justify-between min-h-[110px] w-full ${colors.bg}`}>
      
      {/* Decorative Shapes */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${colors.shape1} blur-[2px] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}></div>
      <div className={`absolute -left-6 -bottom-6 w-24 h-24 rounded-3xl rotate-12 ${colors.shape2} blur-[1px] group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-700`}></div>

      <div className="relative z-10 flex flex-col justify-between h-full flex-1 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/90 select-none truncate block drop-shadow-sm">
              {title}
            </span>
            <div className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center shrink-0 ${colors.iconBg} group-hover:scale-110 group-hover:rotate-[15deg] backdrop-blur-sm shadow-sm`}>
              {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' }) : icon}
            </div>
          </div>

          <div className="flex items-baseline min-w-0">
            <span className="text-xl sm:text-2xl lg:text-xl xl:text-3xl font-extrabold text-white tracking-tight font-display truncate block w-full drop-shadow-md" title={value.toString()}>
              {value}
            </span>
          </div>
        </div>

        {subtitle && (
          <div className="mt-4 pt-3 border-t border-white/20 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 block truncate" title={subtitle}>
              {subtitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuperadminDashboardPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading } = useSuperadminDashboardStats({
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
  });

  const [hoveredPoint, setHoveredPoint] = useState<{
    month: string;
    revenue: number;
    profit: number;
    x: number;
  } | null>(null);

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
  };

  const hasFilters = !!(fromDate || toDate);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const summary = data?.summary || {
    total_revenue: 0,
    commissions_paid: 0,
    commissions_pending: 0,
    net_profit: 0,
    active_businesses: 0,
    sales_partners: 0,
    total_users: 0,
  };

  const trend = data?.trend || [];
  const profit_distribution = data?.profit_distribution || { revenue: 0, commissions: 0, profit: 0 };
  const best_partners = data?.best_partners || [];
  const best_plans = data?.best_plans || [];
  const leadFunnel = data?.lead_funnel || { total: 0, contacted: 0, converted: 0, contacted_rate: 0, conversion_rate: 0 };
  const expiring_subscriptions = data?.expiring_subscriptions || [];

  // SVG Chart Dimensions
  const svgHeight = 240;
  const svgWidth = 600;
  const paddingX = 55;
  const paddingY = 30;

  const maxVal = Math.max(...trend.map(t => Math.max(t.revenue, t.profit)), 1000);

  const getX = (index: number) => paddingX + (index * (svgWidth - paddingX - 20) / Math.max(trend.length - 1, 1));
  const getY = (value: number) => svgHeight - paddingY - (value * (svgHeight - paddingY - 20) / maxVal);

  const hasMultiplePoints = trend.length > 1;

  // Donut Chart Segment Calculations
  const profitVal = profit_distribution.profit || 0;
  const commVal = profit_distribution.commissions || 0;
  const donutTotal = profitVal + commVal;
  const profitPct = donutTotal > 0 ? (profitVal / donutTotal) * 100 : 0;
  const commPct = donutTotal > 0 ? (commVal / donutTotal) * 100 : 0;

  const donutRadius = 40;
  const donutStrokeWidth = 12;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~251.3
  const profitOffset = donutCircumference - (profitPct / 100) * donutCircumference;
  const commOffset = donutCircumference - (commPct / 100) * donutCircumference;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">

      {/* Header Section */}
      <PageHeader
        icon={Shield}
        title="Superadmin Dashboard"
        subtitle="Global analytics, revenues, and partner commission tracking"
      />

      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 py-2 space-y-4">

        {/* Filters Panel */}
        <FilterContainer>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mr-2">
            <Activity className="w-4 h-4 text-primary-500" />
            FILTERS:
          </div>

          <FilterDate
            label="FROM"
            value={fromDate}
            onChange={(val) => setFromDate(val)}
            wrapperClassName="w-full sm:w-48 shrink-0"
          />

          <FilterDate
            label="TO"
            value={toDate}
            onChange={(val) => setToDate(val)}
            wrapperClassName="w-full sm:w-44 shrink-0"
          />

          {hasFilters && (
            <FilterReset onClick={clearFilters} />
          )}
        </FilterContainer>

        {/* ── Summary KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <CustomKpiCard
            title="Total Revenue"
            value={formatCurrency(summary.total_revenue)}
            icon={<DollarSign className="w-5 h-5" />}
            subtitle="Gross Platform Volume"
            glowColor="indigo"
          />
          <CustomKpiCard
            title="Net Profit"
            value={formatCurrency(summary.net_profit)}
            icon={<TrendingUp className="w-5 h-5" />}
            subtitle="Platform Earnings"
            glowColor="emerald"
          />
          <CustomKpiCard
            title="Platform Users"
            value={summary.total_users}
            icon={<Users className="w-5 h-5" />}
            subtitle="Total Registered Users"
            glowColor="blue"
          />
          <CustomKpiCard
            title="Sales Partners"
            value={summary.sales_partners}
            icon={<Award className="w-5 h-5" />}
            subtitle="Active Affiliates"
            glowColor="purple"
          />
          <CustomKpiCard
            title="Active Tenants"
            value={summary.active_businesses}
            icon={<Activity className="w-5 h-5" />}
            subtitle="Paying Businesses"
            glowColor="amber"
          />
          <CustomKpiCard
            title="Pending Payouts"
            value={formatCurrency(summary.commissions_pending)}
            icon={<AlertTriangle className="w-5 h-5" />}
            subtitle="Commissions Due"
            glowColor="rose"
          />
        </div>

        {/* ── Analytics Visualizations ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue & Profit Area Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl p-5 shadow-sm relative flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-300">
                  Revenue & Profit Trend
                </h2>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
                    <span className="text-slate-500 dark:text-zinc-400">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-500 dark:text-zinc-400">Profit</span>
                  </div>
                </div>
              </div>

              {trend.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No trend data available for this range
                </div>
              ) : (
                <div className="relative w-full h-60 mt-4 select-none">
                  {/* Interactive guides */}
                  {hoveredPoint && (
                    <div
                      className="absolute z-20 bg-slate-950 dark:bg-zinc-950 text-white border border-white/10 p-3 rounded-lg shadow-xl text-[10px] font-extrabold uppercase tracking-widest flex flex-col gap-1.5 pointer-events-none"
                      style={{
                        left: `${((hoveredPoint.x - paddingX) / (svgWidth - paddingX - 20)) * 90 + 5}%`,
                        top: '10px',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="text-slate-400 border-b border-white/10 pb-1 mb-1 font-mono">
                        {hoveredPoint.month}
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-primary-400">Revenue:</span>
                        <span>{formatCurrency(hoveredPoint.revenue)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-emerald-400">Net Profit:</span>
                        <span>{formatCurrency(hoveredPoint.profit)}</span>
                      </div>
                    </div>
                  )}

                  {/* Native SVG Chart */}
                  <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="profit-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Dotted Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                      const val = ratio * maxVal;
                      const y = getY(val);
                      return (
                        <g key={ratio} className="opacity-30 dark:opacity-10">
                          <line
                            x1={paddingX}
                            y1={y}
                            x2={svgWidth - 20}
                            y2={y}
                            stroke="#94a3b8"
                            strokeDasharray="4 4"
                            strokeWidth="1"
                          />
                          <text
                            x={paddingX - 10}
                            y={y + 4}
                            textAnchor="end"
                            className="text-[9px] font-extrabold fill-slate-400 dark:fill-zinc-500 font-mono"
                          >
                            {val >= 100000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val.toFixed(0)}`}
                          </text>
                        </g>
                      );
                    })}

                    {/* Chart lines/areas */}
                    {hasMultiplePoints && (
                      <>
                        {/* Area backgrounds */}
                        <path
                          d={`M ${getX(0)} ${svgHeight - paddingY} ` + trend.map((t, i) => `L ${getX(i)} ${getY(t.revenue)}`).join(' ') + ` L ${getX(trend.length - 1)} ${svgHeight - paddingY} Z`}
                          fill="url(#revenue-grad)"
                        />
                        <path
                          d={`M ${getX(0)} ${svgHeight - paddingY} ` + trend.map((t, i) => `L ${getX(i)} ${getY(t.profit)}`).join(' ') + ` L ${getX(trend.length - 1)} ${svgHeight - paddingY} Z`}
                          fill="url(#profit-grad)"
                        />

                        {/* Top Line paths */}
                        <path
                          d={trend.map((t, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(t.revenue)}`).join(' ')}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2.5"
                          className="stroke-primary-500"
                        />
                        <path
                          d={trend.map((t, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(t.profit)}`).join(' ')}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          className="stroke-emerald-500 dark:stroke-emerald-400"
                        />
                      </>
                    )}

                    {/* Guides & markers on hover */}
                    {hoveredPoint && (
                      <line
                        x1={hoveredPoint.x}
                        y1={paddingY - 10}
                        x2={hoveredPoint.x}
                        y2={svgHeight - paddingY}
                        stroke="#64748b"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        className="opacity-50"
                      />
                    )}

                    {/* Markers for data points */}
                    {trend.map((t, i) => {
                      const revX = getX(i);
                      const revY = getY(t.revenue);
                      const profY = getY(t.profit);
                      return (
                        <g key={i}>
                          <circle
                            cx={revX}
                            cy={revY}
                            r={hoveredPoint?.month === t.month ? "5" : "3.5"}
                            className="fill-primary-500 stroke-white dark:stroke-zinc-950 transition-all"
                            strokeWidth="1.5"
                          />
                          <circle
                            cx={revX}
                            cy={profY}
                            r={hoveredPoint?.month === t.month ? "5" : "3.5"}
                            className="fill-emerald-500 stroke-white dark:stroke-zinc-950 transition-all"
                            strokeWidth="1.5"
                          />
                        </g>
                      );
                    })}

                    {/* X Axis labels */}
                    {trend.map((t, i) => (
                      <text
                        key={i}
                        x={getX(i)}
                        y={svgHeight - 8}
                        textAnchor="middle"
                        className="text-[9px] font-extrabold fill-slate-400 dark:fill-zinc-500 font-mono uppercase"
                      >
                        {t.month}
                      </text>
                    ))}

                    {/* Invisible hover regions */}
                    {trend.map((t, i) => {
                      const x = getX(i);
                      const zoneWidth = (svgWidth - paddingX - 20) / Math.max(trend.length, 1);
                      return (
                        <rect
                          key={i}
                          x={x - zoneWidth / 2}
                          y={0}
                          width={zoneWidth}
                          height={svgHeight - paddingY}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint({ ...t, x })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Profit Distribution Donut Chart */}
          <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-300 mb-4">
              Profit Distribution
            </h2>

            <div className="flex-1 flex flex-col justify-center items-center gap-6 py-2">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#e2e8f0"
                    className="dark:stroke-zinc-800"
                    strokeWidth={donutStrokeWidth}
                  />
                  {profitPct > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={donutRadius}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth={donutStrokeWidth}
                      strokeDasharray={donutCircumference}
                      strokeDashoffset={profitOffset}
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-1000 ease-out stroke-emerald-500 dark:stroke-emerald-400"
                    />
                  )}
                  {commPct > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r={donutRadius}
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth={donutStrokeWidth}
                      strokeDasharray={donutCircumference}
                      strokeDashoffset={commOffset}
                      transform={`rotate(${-90 + (profitPct / 100) * 360} 50 50)`}
                      className="transition-all duration-1000 ease-out stroke-primary-500 dark:stroke-primary-400"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
                    {donutTotal > 0 ? Math.round(profitPct) : 0}%
                  </span>
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                    Net Margin
                  </span>
                </div>
              </div>

              {/* Legends & Details */}
              <div className="w-full space-y-3.5 mt-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    Net Platform Profit
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(profitVal)}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {profitPct.toFixed(1)}% Share
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0"></span>
                    Partner Commissions
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(commVal)}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {commPct.toFixed(1)}% Share
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Lead Conversion Funnel Panel ── */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-300">
                Lead Conversion Pipeline
              </h2>
              <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 mt-1 tracking-widest">
                Realtime lead nurturing and conversion metrics
              </p>
            </div>
            <div className="px-3 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-500 rounded-sm text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Pipeline Funnel
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Step 1: Input Leads */}
            <div className="relative group p-4 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/5 rounded-lg shadow-sm transition-all duration-300 hover:translate-x-0.5">
              <div className="flex items-center justify-between gap-4">
                {/* Left side: Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center font-extrabold text-xs text-slate-600 dark:text-slate-300 shrink-0">
                    1
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
                      Total Pipeline Inflow
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5 truncate">
                      New affiliate/leads registered on portal
                    </p>
                  </div>
                </div>

                {/* Center side: Progress Bar */}
                <div className="hidden sm:block flex-1 max-w-md mx-6">
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200/20 dark:border-white/5">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Right side: Stats */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {leadFunnel.total} Leads
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    100% Volume
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Contacted */}
            <div className="relative group p-4 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/5 rounded-lg shadow-sm transition-all duration-300 hover:translate-x-0.5">
              <div className="flex items-center justify-between gap-4">
                {/* Left side: Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center font-extrabold text-xs text-blue-500 shrink-0">
                    2
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
                      Engagement & Nurture
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5 truncate">
                      Leads contacted / pitch generated
                    </p>
                  </div>
                </div>

                {/* Center side: Progress Bar */}
                <div className="hidden sm:block flex-1 max-w-md mx-6">
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200/20 dark:border-white/5">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${leadFunnel.contacted_rate}%` }}
                    />
                  </div>
                </div>

                {/* Right side: Stats */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {leadFunnel.contacted} Contacted
                  </div>
                  <div className="text-[9px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mt-0.5">
                    {leadFunnel.contacted_rate}% Engagement
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Converted */}
            <div className="relative group p-4 bg-slate-50/50 dark:bg-white/[0.01] border border-slate-200/40 dark:border-white/5 rounded-lg shadow-sm transition-all duration-300 hover:translate-x-0.5">
              <div className="flex items-center justify-between gap-4">
                {/* Left side: Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-xs md:max-w-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center font-extrabold text-xs text-emerald-500 shrink-0">
                    3
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
                      Paying Subscribers
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5 truncate">
                      Leads converted into active paying tenants
                    </p>
                  </div>
                </div>

                {/* Center side: Progress Bar */}
                <div className="hidden sm:block flex-1 max-w-md mx-6">
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-slate-200/20 dark:border-white/5">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${leadFunnel.conversion_rate}%` }}
                    />
                  </div>
                </div>

                {/* Right side: Stats */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {leadFunnel.converted} Converted
                  </div>
                  <div className="text-[9px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mt-0.5">
                    {leadFunnel.conversion_rate}% Conversion
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Best Performers and Upcoming Alert Expirations grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Best Sales Affiliates / Partners */}
          <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-300 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                Best Sales Partners
              </h2>
              {best_partners.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No partner records found
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200/50 dark:border-white/5 rounded-lg mt-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 dark:bg-white/[0.02] border-b border-slate-200/60 dark:border-white/5">
                        <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                          Partner
                        </th>
                        <th className="py-3 px-4 text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                          Leads / Biz
                        </th>
                        <th className="py-3 px-4 text-right text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                          Commission
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.02]">
                      {best_partners.map((partner) => (
                        <tr key={partner.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 px-4 text-xs">
                            <span className="font-extrabold text-slate-800 dark:text-white uppercase tracking-tight block">
                              {partner.name}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                              {partner.company_name || 'Individual'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {partner.leads_count} / {partner.referrals_count}
                          </td>
                          <td className="py-3 px-4 text-right text-xs font-extrabold text-emerald-500 dark:text-emerald-400">
                            {formatCurrency(partner.earnings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Top Subscription Plans */}
          <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-300 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary-500" />
                Best Subscription Plans
              </h2>
              {best_plans.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No active plans listed
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200/50 dark:border-white/5 rounded-lg mt-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 dark:bg-white/[0.02] border-b border-slate-200/60 dark:border-white/5">
                        <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                          Plan Detail
                        </th>
                        <th className="py-3 px-4 text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                          Subscribers
                        </th>
                        <th className="py-3 px-4 text-right text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                          Est. MRR
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.02]">
                      {best_plans.map((plan) => (
                        <tr key={plan.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                          <td className="py-3 px-4 text-xs">
                            <span className="font-extrabold text-slate-800 dark:text-white uppercase tracking-tight block">
                              {plan.name}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                              {formatCurrency(plan.price_monthly)} / MO
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {plan.subscribers_count} Active
                          </td>
                          <td className="py-3 px-4 text-right text-xs font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(plan.mrr)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* upcoming expirations list */}
          <div className="bg-white dark:bg-[#111115] border border-slate-200/60 dark:border-white/5 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-300 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                Subscription Renewals (30 Days)
              </h2>
              {expiring_subscriptions.length === 0 ? (
                <div className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No upcoming plan expirations
                </div>
              ) : (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {expiring_subscriptions.map((biz) => {
                    const daysRemaining = getDaysRemaining(biz.expires_at);
                    let badgeClass = "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500";
                    if (daysRemaining < 7) {
                      badgeClass = "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 animate-pulse";
                    } else if (daysRemaining < 15) {
                      badgeClass = "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500";
                    }

                    return (
                      <div
                        key={biz.id}
                        className="p-3 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-tight block">
                            {biz.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>{biz.plan_name}</span>
                            <span>•</span>
                            <span>Ref: {biz.partner_name}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`px-2.5 py-1 rounded-sm text-[9px] font-extrabold uppercase tracking-widest block ${badgeClass}`}>
                            {daysRemaining} Days Left
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1 block">
                            Exp: {formatDate(biz.expires_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
