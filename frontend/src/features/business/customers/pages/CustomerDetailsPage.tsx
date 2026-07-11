import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../api/useCustomers';
import { useCustomerEmis, usePayInstallment } from '../../finance/api/useEmi';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Edit2, Users, IndianRupee, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { EditCustomerModal } from '../components/EditCustomerModal';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { toast } from 'sonner';

function CustomerDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={Users}
        title="Loading Customer..." 
        subtitle="Please wait"
        breadcrumbs={[{ label: 'Customers', onClick: () => {} }, { label: 'Loading', active: true }]} 
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
          <table className="w-full">
            <tbody>
              <TableSkeleton cols={6} rows={5} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(Number(id));
  const { data: emis } = useCustomerEmis(Number(id));
  const payInstallment = usePayInstallment();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sales' | 'emi'>('sales');

  if (isLoading) return <CustomerDetailsSkeleton />;
  if (!customer) return <div className="p-8 text-center text-rose-500 min-h-screen bg-slate-50 dark:bg-[#09090b]">Customer not found</div>;

  const totalBilled = customer.sales?.reduce((sum: number, s: any) => sum + Number(s.final_amount), 0) || 0;
  const totalPaid = customer.sales?.reduce((sum: number, s: any) => sum + Number(s.paid_amount), 0) || 0;
  const outstanding = totalBilled - totalPaid;

  const handlePayInstallment = async (installment: any) => {
    if (!window.confirm(`Are you sure you want to mark Installment #${installment.installment_number} of ${formatCurrency(installment.amount)} as paid?`)) return;
    try {
      await payInstallment.mutateAsync({ 
        installmentId: installment.id, 
        data: { payment_mode: 'Cash', amount: installment.amount } 
      });
      toast.success('EMI installment paid successfully!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to pay installment');
    }
  };

  const salesColumns: ColumnDef<any>[] = [
    {
      header: 'Date & Invoice',
      cell: (sale) => (
        <div className="whitespace-nowrap">
          <p className="font-medium">{new Date(sale.date).toLocaleDateString()}</p>
          <p className="text-xs text-slate-500">{sale.invoice_number}</p>
        </div>
      )
    },
    {
      header: 'Items',
      cell: (sale) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-300">
          {sale.items?.length || 0} Items
        </span>
      )
    },
    {
      header: 'Bill Amount',
      className: 'text-right font-medium',
      cell: (sale) => formatCurrency(sale.final_amount)
    },
    {
      header: 'Paid',
      className: 'text-right font-medium text-emerald-600',
      cell: (sale) => formatCurrency(sale.paid_amount)
    },
    {
      header: 'Balance',
      className: 'text-right font-bold text-rose-600',
      cell: (sale) => formatCurrency(sale.final_amount - sale.paid_amount)
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={Users}
        title={customer.name}
        subtitle={`ID: ${customer.id}`}
        breadcrumbs={[
          { label: 'Customers', onClick: () => navigate('/customers') },
          { label: customer.name, active: true }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 px-4 py-2 text-sm rounded-lg" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button onClick={() => navigate(`/pos?customer_id=${id}`)} className="h-10 px-4 py-2 text-sm rounded-lg">
              <IndianRupee className="w-4 h-4 mr-2" />
              New Sale
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
                  <p className="font-medium text-slate-900 dark:text-white">{customer.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="w-4 h-4 text-slate-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-slate-500">Address</p>
                  <p className="font-medium text-slate-900 dark:text-white">{customer.address || 'N/A'}</p>
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
              onClick={() => {
                 navigate(`/pos?customer_id=${id}`);
              }}
            >
              <IndianRupee className="w-4 h-4 mr-2" />
              Collect Payment
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
          <div className="flex border-b border-slate-200 dark:border-white/5">
            <button 
              className={`px-6 py-4 text-sm font-semibold tracking-wide uppercase transition-colors ${activeTab === 'sales' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('sales')}
            >
              Sales History ({customer.sales?.length || 0})
            </button>
            <button 
              className={`px-6 py-4 text-sm font-semibold tracking-wide uppercase transition-colors ${activeTab === 'emi' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('emi')}
            >
              EMI Schedule ({emis?.length || 0})
            </button>
          </div>
          <div className="p-0">
            {activeTab === 'sales' ? (
              <DataTable 
                columns={salesColumns} 
                data={customer.sales || []} 
                emptyMessage="No sales history found for this customer."
              />
            ) : (
              <div className="p-6">
                {emis?.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No EMI records found for this customer.</p>
                ) : (
                  <div className="space-y-6">
                    {emis?.map((emi: any) => (
                      <div key={emi.id} className="border border-slate-200 dark:border-white/5 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">Invoice: {emi.sale?.invoice_number}</h4>
                            <p className="text-xs text-slate-500">Loan Amount: {formatCurrency(emi.loan_amount)} • Financier: {emi.financier_name}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          {emi.installments?.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No installments generated.</p>
                          ) : (
                            <div className="space-y-3">
                              {emi.installments?.map((inst: any) => (
                                <div key={inst.id} className="flex justify-between items-center p-3 border border-slate-100 dark:border-white/5 rounded bg-white dark:bg-black">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center font-bold">
                                      #{inst.installment_number}
                                    </div>
                                    <div>
                                      <p className="font-semibold">{formatCurrency(inst.amount)}</p>
                                      <p className="text-xs text-slate-500">Due: {new Date(inst.due_date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <div>
                                    {inst.status === 'paid' ? (
                                      <span className="inline-flex items-center text-emerald-600 text-sm font-medium">
                                        <CheckCircle className="w-4 h-4 mr-1" /> Paid on {new Date(inst.paid_on).toLocaleDateString()}
                                      </span>
                                    ) : (
                                      <Button 
                                        size="sm" 
                                        className="h-8"
                                        onClick={() => handlePayInstallment(inst)}
                                        disabled={payInstallment.isPending}
                                      >
                                        <IndianRupee className="w-3.5 h-3.5 mr-1" /> Pay Now
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <EditCustomerModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} customer={customer} />
    </div>
  );
}
