import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStaffDetail, useStaffSales } from '../api/useStaff';
import { usePayrolls } from '../../payroll/api/usePayroll';
import { PageHeader } from '@/components/layout/PageHeader';
import { ArrowLeft, User, Mail, Phone, Calendar, IndianRupee, TrendingUp, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function StaffDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useStaffDetail(Number(id));
  const { data: salesData, isLoading: isSalesLoading } = useStaffSales(Number(id));
  const { data: payrollData, isLoading: isPayrollLoading } = usePayrolls({ user_id: Number(id) });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-[100px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  if (!data?.staff) {
    return <div className="p-6">Staff member not found.</div>;
  }

  const { staff, stats } = data;

  const salesColumns = [
    {
      header: 'Invoice',
      accessorKey: 'invoice_number',
      cell: (row: any) => (
        <span className="font-medium text-primary-600 dark:text-primary-400">
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
      cell: (row: any) => `₹${Number(row.final_amount).toLocaleString()}`
    },
    {
      header: 'Payment',
      accessorKey: 'payment_mode',
      cell: (row: any) => (
        <Badge variant="outline" className="capitalize">
          {row.payment_mode}
        </Badge>
      )
    }
  ];

  const payrollColumns = [
    {
      header: 'Month',
      accessorKey: 'month',
      cell: (row: any) => <span className="font-medium text-slate-900 dark:text-white capitalize">{row.month}</span>
    },
    {
      header: 'Attendance',
      cell: (row: any) => (
        <div className="text-sm">
          <span className="text-emerald-600 font-medium">{row.present_days}P</span> / 
          <span className="text-red-500 font-medium ml-1">{row.absent_days}A</span>
        </div>
      )
    },
    {
      header: 'Base Salary',
      accessorKey: 'base_salary',
      cell: (row: any) => `₹${Number(row.base_salary).toLocaleString()}`
    },
    {
      header: 'Commission',
      accessorKey: 'total_commission',
      cell: (row: any) => {
        const val = Number(row.total_commission);
        return val > 0 ? <span className="text-emerald-600">+₹{val.toLocaleString()}</span> : '-';
      }
    },
    {
      header: 'Deductions',
      accessorKey: 'deduction',
      cell: (row: any) => {
        const val = Number(row.deduction) + Number(row.advance_deduction);
        return val > 0 ? <span className="text-red-500">-₹{val.toLocaleString()}</span> : '-';
      }
    },
    {
      header: 'Final Salary',
      accessorKey: 'final_salary',
      cell: (row: any) => <span className="font-bold text-slate-900 dark:text-white">₹{Number(row.final_salary).toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => (
        <Badge variant={row.status === 'paid' ? 'success' : row.status === 'confirmed' ? 'default' : 'outline'} className="capitalize">
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
          <Button variant="outline" size="sm" onClick={() => navigate('/staff')}>
            <ArrowLeft size={14} className="mr-2" /> Back to Staff
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Details */}
          <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Phone size={18} />
                <span>{staff.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Mail size={18} />
                <span>{staff.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <IndianRupee size={18} />
                <span>Base Salary: ₹{Number(staff.monthly_salary).toLocaleString()}/month</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Percent size={18} />
                <span>Commission: {staff.commission_rate}% per sale</span>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Performance (This Month)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Sales Handled</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.this_month_sales}</p>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{stats.this_month_sales_amount.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-lg col-span-2">
                <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Estimated Commission Earned</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{stats.this_month_commission.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* History Tables Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Sales History */}
          <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Sales</h3>
              <Badge variant="secondary">{salesData?.data?.length || 0} Records</Badge>
            </div>
            <div className="flex-1">
              <DataTable 
                columns={salesColumns} 
                data={salesData?.data?.slice(0, 5) || []} 
                isLoading={isSalesLoading}
              />
            </div>
          </div>

          {/* Salary History */}
          <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Salary History</h3>
              <Badge variant="secondary">{payrollData?.data?.length || 0} Records</Badge>
            </div>
            <div className="flex-1">
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
