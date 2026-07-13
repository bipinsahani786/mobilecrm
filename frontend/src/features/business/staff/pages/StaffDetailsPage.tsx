import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaffDetail, useStaffSales } from '../api/useStaff';
import { usePayrolls } from '../../payroll/api/usePayroll';
import { PageHeader } from '@/components/layout/PageHeader';
import { ArrowLeft, User, Mail, Phone, Calendar, IndianRupee, TrendingUp, Percent, Award, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/formatters';

export default function StaffDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useStaffDetail(Number(id));
  const { data: salesData, isLoading: isSalesLoading } = useStaffSales(Number(id));
  const { data: payrollData, isLoading: isPayrollLoading } = usePayrolls({ user_id: Number(id) });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 min-h-screen bg-slate-50 dark:bg-[#09090b]">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <Skeleton className="h-[200px] w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full rounded-2xl" />
          <Skeleton className="h-[300px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data?.staff) {
    return (
      <div className="p-6 min-h-screen bg-slate-50 dark:bg-[#09090b] flex items-center justify-center flex-col gap-4 text-center">
        <ShieldAlert className="w-12 h-12 text-rose-500" />
        <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
          Staff Member Not Found
        </h3>
        <button
          onClick={() => navigate('/staff')}
          className="h-10 px-4 text-xs font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { staff, stats } = data;

  const salesColumns = [
    {
      header: 'Invoice',
      accessorKey: 'invoice_number',
      cell: (row: any) => (
        <span className="font-semibold text-primary-600 dark:text-primary-400">
          {row.invoice_number}
        </span>
      )
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (row: any) => format(new Date(row.date), 'dd MMM yyyy')
    },
    {
      header: 'Customer',
      accessorKey: 'customer.name',
      cell: (row: any) => row.customer?.name || 'Walk-in'
    },
    {
      header: 'Amount',
      accessorKey: 'final_amount',
      cell: (row: any) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {formatCurrency(row.final_amount)}
        </span>
      )
    },
    {
      header: 'Payment',
      accessorKey: 'payment_mode',
      cell: (row: any) => (
        <Badge variant="outline" className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-md">
          {row.payment_mode}
        </Badge>
      )
    }
  ];

  const payrollColumns = [
    {
      header: 'Month',
      accessorKey: 'month',
      cell: (row: any) => <span className="font-semibold text-slate-900 dark:text-white capitalize">{row.month}</span>
    },
    {
      header: 'Attendance',
      cell: (row: any) => (
        <div className="text-xs font-semibold">
          <span className="text-emerald-600">{row.present_days}P</span> /
          <span className="text-rose-500 ml-1">{row.absent_days}A</span>
        </div>
      )
    },
    {
      header: 'Base Salary',
      accessorKey: 'base_salary',
      cell: (row: any) => formatCurrency(row.base_salary)
    },
    {
      header: 'Commission',
      accessorKey: 'total_commission',
      cell: (row: any) => {
        const val = Number(row.total_commission);
        return val > 0 ? <span className="text-emerald-600 font-bold">+{formatCurrency(val)}</span> : '-';
      }
    },
    {
      header: 'Deductions',
      accessorKey: 'deduction',
      cell: (row: any) => {
        const val = Number(row.deduction) + Number(row.advance_deduction);
        return val > 0 ? <span className="text-rose-500 font-bold">-{formatCurrency(val)}</span> : '-';
      }
    },
    {
      header: 'Final Salary',
      accessorKey: 'final_salary',
      cell: (row: any) => <span className="font-black text-slate-900 dark:text-white">{formatCurrency(row.final_salary)}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => (
        <Badge variant={row.status === 'paid' ? 'success' : row.status === 'confirmed' ? 'default' : 'outline'} className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-md">
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader
        icon={User}
        title={staff.name}
        subtitle={`${staff.role} • Joined ${format(new Date(staff.join_date), 'MMM yyyy')}`}
        actions={
          <button
            onClick={() => navigate('/staff')}
            className="group relative flex items-center gap-2 h-10 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 duration-200"
          >
            <ArrowLeft size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span>Back to Staff</span>
          </button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Top Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* Profile Details (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary-500/20">
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    {staff.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      System Role:
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 text-[9px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                      {staff.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attributes Flex List */}
              <div className="space-y-4 border-t border-slate-100 dark:border-white/5 pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Contact</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-0.5">{staff.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-0.5 truncate max-w-[240px]">
                      {staff.email || 'No email registered'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/5 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-400">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Salary</span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                        {formatCurrency(staff.monthly_salary)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-400">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Commission</span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                        {staff.commission_rate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
                Performance Metrics (This Month)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sales Handled Card */}
                <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/10 border border-sky-100/80 dark:border-sky-900/30 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                      Sales Handled
                    </span>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 leading-none font-display">
                      {stats.this_month_sales}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                {/* Total Revenue Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/80 dark:border-emerald-900/30 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      Total Revenue
                    </span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 leading-none font-display">
                      {formatCurrency(stats.this_month_sales_amount)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>

                {/* Estimated Commission Earned Card */}
                <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/80 dark:border-amber-900/30 flex items-center justify-between col-span-1 sm:col-span-2">
                  <div>
                    <span className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                      Estimated Commission Earned
                    </span>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 leading-none font-display">
                      {formatCurrency(stats.this_month_commission)}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-sm">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Tables Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Sales History */}
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col">
            <div className="pb-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Recent Sales
              </h3>
              <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 rounded-md">
                {salesData?.data?.length || 0} Records
              </Badge>
            </div>
            <div className="flex-1 overflow-x-auto rounded-xl border border-slate-100 dark:border-white/5">
              <DataTable
                columns={salesColumns}
                data={salesData?.data?.slice(0, 5) || []}
                isLoading={isSalesLoading}
              />
            </div>
          </div>

          {/* Salary History */}
          <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col">
            <div className="pb-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Salary History
              </h3>
              <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 rounded-md">
                {payrollData?.data?.length || 0} Records
              </Badge>
            </div>
            <div className="flex-1 overflow-x-auto rounded-xl border border-slate-100 dark:border-white/5">
              <DataTable
                columns={payrollColumns}
                data={payrollData?.data?.slice(0, 5) || []}
                isLoading={isPayrollLoading}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
