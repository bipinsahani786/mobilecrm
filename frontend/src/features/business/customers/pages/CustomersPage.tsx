import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../api/useCustomers';
import { getCustomerColumns } from '../constants/customerColumns';
import { AddCustomerModal } from '../components/AddCustomerModal';
import { EditCustomerModal } from '../components/EditCustomerModal';
import type { Customer } from '../schemas/customerSchema';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { Plus, UserPlus, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useCustomers(page);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const navigate = useNavigate();

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
  }), [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        title="Customers"
        subtitle="Manage your customers and their udhar balances."
        icon={Users}
        actions={
          <Button className="h-10 px-4 py-2 text-sm rounded-lg" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Total Customers"
            value={totalCustomers}
            icon={Users}
            trend={{ value: "12% from last month", isPositive: true }}
          />
          <StatCard
            title="Total Pending Udhar"
            value={formatCurrency(totalUdhar)}
            icon={UserPlus}
            trend={{ value: "Needs collection", isPositive: false }}
            className={totalUdhar > 0 ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-900/10" : ""}
          />
        </div>

        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
          {(!isLoading && customers.length === 0) ? (
            <EmptyState
              icon={<Users className="w-6 h-6" />}
              title="No customers yet"
              description="Get started by adding your first customer."
              action={
                <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                  Add Customer
                </Button>
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
    </div>
  );
}
