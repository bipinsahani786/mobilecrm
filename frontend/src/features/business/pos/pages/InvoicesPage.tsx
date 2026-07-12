import { useState, useMemo } from 'react';
import { useSales } from '../api/useSales';
import { Button } from '@/components/ui/button';
import { FileText, Plus, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { getInvoiceColumns } from '../constants/invoiceColumns';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-200">
      
      {/* Premium Hero Banner */}
      <div className="relative pt-6 pb-20 px-6 sm:px-8 bg-white dark:bg-[#111118] border-b border-slate-200 dark:border-white/5 overflow-hidden">
        {/* Animated Shapes */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl animate-float2 pointer-events-none" />
        
        <div className="relative max-w-[1600px] mx-auto z-10 flex items-center justify-end">
          <button 
            onClick={() => navigate('/pos')}
            className="flex items-center gap-2 h-11 px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Sale
          </button>
        </div>
      </div>

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 -mt-10 mb-8 space-y-6 z-20">
        
        {/* Premium KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CustomKpiCard
            title="Total Invoices"
            value={totalInvoices}
            icon={<FileText />}
            glowColor="blue"
            subtitle="All time sales"
          />
          <CustomKpiCard
            title="Revenue (This Page)"
            value={formatCurrency(totalRevenue)}
            icon={<TrendingUp />}
            glowColor="emerald"
            subtitle="Total from current view"
          />
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 overflow-hidden">
          {(!isLoading && sales.length === 0) ? (
            <div className="py-24">
              <EmptyState
                icon={<FileText className="w-8 h-8 opacity-50" />}
                title="No invoices found"
                description="You haven't made any sales yet. Go to POS to create your first bill."
                action={
                  <button 
                    onClick={() => navigate('/pos')}
                    className="mt-4 flex items-center justify-center gap-2 h-10 px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/30 transition-all"
                  >
                    Go to POS
                    <ArrowRight className="w-4 h-4" />
                  </button>
                }
              />
            </div>
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
