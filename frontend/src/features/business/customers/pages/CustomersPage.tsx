import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../api/useCustomers';
import { getCustomerColumns } from '../constants/customerColumns';
import { AddCustomerModal } from '../components/AddCustomerModal';
import { EditCustomerModal } from '../components/EditCustomerModal';
import { CollectPaymentModal } from '../components/CollectPaymentModal';
import type { Customer } from '../schemas/customerSchema';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { Plus, UserPlus, Users, Search, X } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { CustomSelect } from '@/components/ui/CustomSelect';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [collectPaymentCustomer, setCollectPaymentCustomer] = useState<any | null>(null);
  const navigate = useNavigate();

  // Filters state
  const [search, setSearch] = useState('');
  const [hasUdhar, setHasUdhar] = useState('');

  // Debounced search to prevent duplicate requests
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset pagination on filter selections
  useEffect(() => {
    setPage(1);
  }, [hasUdhar]);

  const filters = useMemo(() => ({
    search: debouncedSearch || undefined,
    has_udhar: hasUdhar || undefined,
  }), [debouncedSearch, hasUdhar]);

  const { data: response, isLoading } = useCustomers(page, 15, filters);

  const customers = response?.data || [];
  const meta = response?.meta;

  const totalCustomers = meta?.total || 0;
  const totalUdhar = customers?.reduce((sum: number, c: any) => {
    const billed = c.sales_sum_final_amount || 0;
    const paid = c.sales_sum_paid_amount || 0;
    return sum + (billed - paid);
  }, 0) || 0;

  const columns = useMemo(() => getCustomerColumns({
    onEdit: (customer) => setEditingCustomer(customer),
    onView: (customer) => navigate(`/customers/${customer.id}`),
    onCollectPayment: (customer) => setCollectPaymentCustomer(customer),
  }), [navigate]);

  const handleClearFilters = () => {
    setSearch('');
    setHasUdhar('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      {/* Massive Fintech Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary-500/10 dark:bg-primary-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-500/10 dark:bg-primary-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 pb-6 space-y-6 z-10">
        
        {/* Premium Control Panel */}
        <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-[2rem] p-4 shadow-2xl shadow-slate-200/30 dark:shadow-black/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="grid grid-cols-2 gap-4 flex-1 max-w-2xl">
              <div className="transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Total Customers"
                  value={totalCustomers}
                  icon={<Users />}
                  glowColor="primary"
                  subtitle="Total registered users"
                />
              </div>
              <div className="transition-transform hover:-translate-y-1 duration-300">
                <CustomKpiCard
                  title="Total Outstanding"
                  value={formatCurrency(totalUdhar)}
                  icon={<UserPlus />}
                  glowColor="primary"
                  subtitle="Outstanding customer balances"
                />
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-end px-2 sm:px-4">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="group relative flex items-center justify-center gap-2 px-5 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm hover:shadow active:scale-95 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span className="font-semibold text-sm">Add Customer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm relative z-30">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name or phone..."
                className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Outstanding Balance Filter */}
            <div className="w-full sm:w-48">
              <CustomSelect
                value={hasUdhar}
                onChange={(val) => setHasUdhar(val)}
                placeholder="All Balances"
                options={[
                  { value: '', label: 'All Balances' },
                  { value: 'yes', label: 'Has Outstanding Dues' },
                  { value: 'no', label: 'No Outstanding Balance' },
                ]}
              />
            </div>
          </div>

          {(search || hasUdhar) && (
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <button
                onClick={handleClearFilters}
                className="h-10 px-4 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all border border-rose-100 dark:border-rose-900/30 flex items-center justify-center gap-2"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Customers List Table */}
        <div className="bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 overflow-hidden">
          {(!isLoading && customers.length === 0) ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No customers found"
              description={
                (search || hasUdhar)
                  ? "No customers match your active filters. Try refining your criteria."
                  : "Get started by adding your first customer."
              }
              action={
                !(search || hasUdhar) && (
                  <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                    Add Customer
                  </Button>
                )
              }
            />
          ) : (
            <DataTable 
              columns={columns} 
              data={customers} 
              isLoading={isLoading}
              loadingSkeleton={<TableSkeleton cols={4} rows={5} />}
              pagination={{
                currentPage: meta?.current_page || 1,
                totalPages: meta?.last_page || 1,
                onPageChange: setPage
              }}
            />
          )}
        </div>
      </div>

      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <EditCustomerModal 
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        customer={editingCustomer}
      />

      <CollectPaymentModal
        isOpen={!!collectPaymentCustomer}
        onClose={() => setCollectPaymentCustomer(null)}
        customer={collectPaymentCustomer}
      />
    </div>
  );
}
