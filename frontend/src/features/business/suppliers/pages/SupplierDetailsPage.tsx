import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupplier } from '../api/useSuppliers';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { Button } from '../../../../components/ui/button';
import { Plus, Phone, MapPin, Package, Download, Edit2, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../../../lib/formatters';
import { AddPaymentModal } from '../components/AddPaymentModal';
import { EditSupplierModal } from '../components/EditSupplierModal';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';

function SupplierDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={Package}
        title="Loading Supplier..." 
        subtitle="Please wait"
        breadcrumbs={[{ label: 'Suppliers', onClick: () => {} }, { label: 'Loading', active: true }]} 
      />
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <CardSkeleton count={1} />
          </div>
          <div className="md:col-span-1 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <CardSkeleton count={1} />
          </div>
        </div>
        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl p-4 mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody>
                <TableSkeleton cols={6} rows={5} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupplierDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: supplier, isLoading } = useSupplier(Number(id));
  const [activeTab, setActiveTab] = useState<'purchases' | 'payments'>('purchases');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | undefined>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) return <SupplierDetailsSkeleton />;
  if (!supplier) return <div className="p-8 text-center text-rose-500 min-h-screen bg-slate-50 dark:bg-[#09090b]">Supplier not found</div>;

  const totalBilled = supplier.purchases?.reduce((sum: number, p: any) => sum + Number(p.bill_amount), 0) || 0;
  const purchasesPaid = supplier.purchases?.reduce((sum: number, p: any) => sum + Number(p.paid_amount), 0) || 0;
  const unlinkedPayments = supplier.payments?.filter((p: any) => !p.supplier_purchase_id).reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  const totalPaid = purchasesPaid + unlinkedPayments;
  const outstanding = totalBilled - totalPaid;

  const purchasesColumns: ColumnDef<any>[] = [
    {
      header: 'Date',
      cell: (purchase) => (
        <div className="whitespace-nowrap">
          <p className="font-medium">{new Date(purchase.purchase_date).toLocaleDateString()}</p>
          {purchase.due_date && <p className="text-xs text-rose-500">Due: {new Date(purchase.due_date).toLocaleDateString()}</p>}
        </div>
      )
    },
    {
      header: 'Items',
      cell: (purchase) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-300">
          {purchase.items?.length || 0} Products
        </span>
      )
    },
    {
      header: 'Bill Amount',
      className: 'text-right font-medium',
      cell: (purchase) => formatCurrency(purchase.bill_amount)
    },
    {
      header: 'Paid',
      className: 'text-right font-medium text-emerald-600',
      cell: (purchase) => formatCurrency(purchase.paid_amount)
    },
    {
      header: 'Balance',
      className: 'text-right font-bold text-rose-600',
      cell: (purchase) => formatCurrency(purchase.bill_amount - purchase.paid_amount)
    },
    {
      header: '',
      className: 'text-right',
      cell: (purchase) => (
        <div className="flex justify-end gap-2">
          {purchase.bill_amount - purchase.paid_amount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              onClick={() => {
                setSelectedPurchaseId(purchase.id);
                setIsPaymentModalOpen(true);
              }}
            >
              <IndianRupee className="w-4 h-4 mr-1" /> Pay
            </Button>
          )}
          {purchase.invoice_file && (
            <Button variant="ghost" size="sm" onClick={() => window.open(purchase.invoice_file, '_blank')}>
              <Download className="w-4 h-4 mr-2" /> Invoice
            </Button>
          )}
        </div>
      )
    }
  ];

  const paymentsColumns: ColumnDef<any>[] = [
    {
      header: 'Date',
      cell: (payment) => <span className="font-medium">{new Date(payment.date).toLocaleDateString()}</span>
    },
    {
      header: 'Mode',
      cell: (payment) => <span className="uppercase text-xs font-semibold">{payment.payment_mode}</span>
    },
    {
      header: 'Amount',
      className: 'text-right font-bold text-emerald-600',
      cell: (payment) => formatCurrency(payment.amount)
    },
    {
      header: 'Notes',
      cell: (payment) => <span className="text-slate-500">{payment.notes || '-'}</span>
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={Package}
        title={supplier.name}
        subtitle={supplier.custom_id || `ID: ${supplier.id}`}
        breadcrumbs={[
          { label: 'Suppliers', onClick: () => navigate('/suppliers') },
          { label: supplier.name, active: true }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 px-4 py-2 text-sm rounded-lg" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Supplier
            </Button>
            <Button onClick={() => navigate(`/suppliers/${id}/purchases/new`)} className="h-10 px-4 py-2 text-sm rounded-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Purchase Bill
            </Button>
          </div>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start text-sm">
                <Phone className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-slate-500">Phone</p>
                  <p className="font-medium text-slate-900 dark:text-white">{supplier.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-slate-500">Address</p>
                  <p className="font-medium text-slate-900 dark:text-white">{supplier.address || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start text-sm">
                <Package className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-slate-500">Items Supplied</p>
                  <p className="font-medium text-slate-900 dark:text-white">{supplier.items_supplied || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Total Outstanding</h3>
              <p className="text-sm text-slate-500">Total Udhar</p>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-display font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(outstanding)}
              </p>
              <div className="flex justify-between mt-4 text-sm">
                <span className="text-slate-500">Total Billed: <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(totalBilled)}</span></span>
                <span className="text-slate-500">Total Paid: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid)}</span></span>
              </div>
            </div>
            <Button 
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all hover:shadow" 
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <IndianRupee className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
          <div className="flex border-b border-slate-200 dark:border-white/5">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-4 text-sm font-semibold tracking-wide uppercase transition-colors ${activeTab === 'purchases' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Purchases ({supplier.purchases?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-4 text-sm font-semibold tracking-wide uppercase transition-colors ${activeTab === 'payments' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Payments ({supplier.payments?.length || 0})
            </button>
          </div>

          <div className="p-0">
            {activeTab === 'purchases' && (
              <DataTable 
                columns={purchasesColumns} 
                data={supplier.purchases || []} 
                emptyMessage="No purchases found."
              />
            )}

            {activeTab === 'payments' && (
              <DataTable 
                columns={paymentsColumns} 
                data={supplier.payments || []} 
                emptyMessage="No payments found."
              />
            )}
          </div>
        </div>
      </div>

      <AddPaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPurchaseId(undefined);
        }} 
        supplierId={supplier.id} 
        supplierPurchaseId={selectedPurchaseId}
      />
      <EditSupplierModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} supplier={supplier} />
    </div>
  );
}
