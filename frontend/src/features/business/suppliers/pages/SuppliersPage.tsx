import React, { useState } from 'react';
import { useSuppliers } from '../api/useSuppliers';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Phone, MapPin, Package, FileText, ChevronRight, UserPlus, Edit2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { AddSupplierModal } from '../components/AddSupplierModal';
import { EditSupplierModal } from '../components/EditSupplierModal';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';

export default function SuppliersPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading } = useSuppliers(page);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const navigate = useNavigate();

  const suppliers = response?.data || [];
  const meta = response?.meta;

  // Stats calculation
  const totalSuppliers = meta?.total || 0;
  const totalUdhar = suppliers?.reduce((sum: number, s: any) => {
    const billed = s.purchases_sum_bill_amount || 0;
    const paid = s.purchases_sum_paid_amount || 0;
    return sum + (billed - paid);
  }, 0) || 0;

  const columns: ColumnDef<any>[] = [
    {
      header: 'Supplier',
      accessorKey: 'name',
      cell: (supplier) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold font-display uppercase shrink-0">
            {supplier.name.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="font-semibold text-slate-900 dark:text-white">{supplier.name}</p>
            <p className="text-xs text-slate-500">{supplier.custom_id || `ID: ${supplier.id}`}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      cell: (supplier) => (
        <div className="space-y-1">
          {supplier.phone && (
            <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs">
              <Phone className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              {supplier.phone}
            </div>
          )}
          {supplier.address && (
            <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs">
              <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span className="truncate max-w-[150px]">{supplier.address}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Items Supplied',
      cell: (supplier) => (
        <div className="flex items-center text-slate-600 dark:text-slate-400">
          <Package className="w-3.5 h-3.5 mr-1.5 shrink-0" />
          <span className="truncate max-w-[150px]">{supplier.items_supplied || '-'}</span>
        </div>
      )
    },
    {
      header: 'Outstanding (Udhar)',
      className: 'text-right',
      cell: (supplier) => {
        const billed = supplier.purchases_sum_bill_amount || 0;
        const paid = (supplier.purchases_sum_paid_amount || 0) + (supplier.general_payments_sum || 0);
        const udhar = billed - paid;
        return (
          <span className={cn(
            "font-semibold font-display",
            udhar > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
          )}>
            {formatCurrency(udhar)}
          </span>
        );
      }
    },
    {
      header: '',
      className: 'text-right',
      cell: (supplier) => (
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              setEditingSupplier(supplier);
            }}
          >
            <Edit2 className="w-4 h-4 text-slate-500 hover:text-slate-700" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/suppliers/${supplier.id}`);
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        title="Suppliers"
        subtitle="Manage your suppliers, purchases, and udhar balances."
        icon={UserPlus}
        actions={
          <Button className="h-10 px-4 py-2 text-sm rounded-lg" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            title="Total Suppliers"
            value={totalSuppliers}
            icon={Building2}
          />
          <StatCard
            title="Total Udhar (Outstanding)"
            value={formatCurrency(totalUdhar)}
            icon={FileText}
            color="rose"
          />
        </div>

        <DataTable 
          columns={columns} 
          data={suppliers || []} 
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton cols={5} rows={5} />}
          emptyIcon={<Building2 className="w-12 h-12" />}
          emptyMessage="No Suppliers Found. Add your first supplier to start creating purchase bills and tracking inventory."
          onRowClick={(supplier) => navigate(`/suppliers/${supplier.id}`)}
          serverSide={true}
          totalItems={meta?.total || 0}
          page={meta?.current_page || page}
          onPageChange={(newPage) => setPage(newPage)}
          itemsPerPage={meta?.per_page || 15}
        />

        <AddSupplierModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        {editingSupplier && (
          <EditSupplierModal 
            isOpen={!!editingSupplier} 
            onClose={() => setEditingSupplier(null)} 
            supplier={editingSupplier} 
          />
        )}
      </div>
    </div>
  );
}
