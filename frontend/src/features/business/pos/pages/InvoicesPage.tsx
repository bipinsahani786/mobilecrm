import { useState, useMemo } from 'react';
import { useSales } from '../api/useSales';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { FileText, Plus, TrendingUp, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { getInvoiceColumns } from '../constants/invoiceColumns';
import { StatCard } from '@/components/ui/stat-card';
import { formatCurrency } from '@/lib/formatters';

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useSales(page);
  const navigate = useNavigate();

  const sales = response?.data || [];
  const meta = response?.meta;

  const totalInvoices = meta?.total || 0;
  const totalRevenue = sales?.reduce((sum: number, sale: any) => sum + Number(sale.final_amount || 0), 0) || 0;

  const columns = useMemo(() => getInvoiceColumns({
    onView: (sale) => navigate(`/invoices/${sale.id}`),
    onCustomerView: (customerId) => navigate(`/customers/${customerId}`)
  }), [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        title="Sales Invoices"
        subtitle="View and manage all your sales transactions."
        icon={FileText}
        actions={
          <Button className="h-10 px-4 py-2 text-sm rounded-lg" onClick={() => navigate('/pos')}>
            <Plus className="w-4 h-4 mr-2" />
            New Sale
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Total Invoices"
            value={totalInvoices}
            icon={FileText}
            trend={{ value: "All time", isPositive: true }}
          />
          <StatCard
            title="Total Revenue (This Page)"
            value={formatCurrency(totalRevenue)}
            icon={TrendingUp}
            trend={{ value: "Current page total", isPositive: true }}
            className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10"
          />
        </div>

        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
          {(!isLoading && sales.length === 0) ? (
            <EmptyState
              icon={<FileText className="w-6 h-6" />}
              title="No invoices found"
              description="You haven't made any sales yet. Go to POS to create your first bill."
              action={
                <Button size="sm" onClick={() => navigate('/pos')}>
                  Go to POS
                </Button>
              }
            />
          ) : (
            <DataTable 
              columns={columns} 
              data={sales} 
              isLoading={isLoading}
              loadingSkeleton={<TableSkeleton cols={7} rows={8} />}
              pagination={{
                currentPage: meta?.current_page || 1,
                totalPages: meta?.last_page || 1,
                onPageChange: setPage
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
