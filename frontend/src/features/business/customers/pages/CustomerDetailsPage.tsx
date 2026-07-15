import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../api/useCustomers';
import { useCustomerEmis, usePayInstallment } from '../../finance/api/useEmi';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Edit2, Users, IndianRupee, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { EditCustomerModal } from '../components/EditCustomerModal';
import { CollectPaymentModal } from '../components/CollectPaymentModal';
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
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
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
      cell: (sale) => {
        const isUdharInvoice = sale.invoice_number?.startsWith('UDH-');
        return (
          <div className="whitespace-nowrap">
            <p className="font-medium">{new Date(sale.date).toLocaleDateString()}</p>
            <div className="flex flex-col gap-0.5 mt-0.5">
              <span className="text-xs text-slate-500 font-mono">{sale.invoice_number}</span>
              {isUdharInvoice && (
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-500/20 w-fit">
                  Udhar (Guarantor Debt)
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Details / Notes',
      cell: (sale) => {
        const parentInvoiceMatch = sale.notes?.match(/Invoice:\s*([A-Z0-9-]+)/i);
        const parentInvoice = parentInvoiceMatch ? parentInvoiceMatch[1] : null;
        const parentIdMatch = sale.notes?.match(/,\s*ID:\s*(\d+)\)/i);
        const parentId = parentIdMatch ? parentIdMatch[1] : null;
        
        return (
          <div className="max-w-[300px]">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {sale.notes || (sale.items?.length ? `${sale.items.length} Items` : 'No details')}
            </p>
            {parentInvoice && (
              parentId ? (
                <button
                  onClick={() => navigate(`/invoices/${parentId}`)}
                  className="mt-1 text-[10px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  🔗 Original Invoice: {parentInvoice}
                </button>
              ) : (
                <span className="mt-1 block text-[10px] font-bold text-slate-400">
                  Original Invoice: {parentInvoice}
                </span>
              )
            )}
          </div>
        );
      }
    },
    {
      header: 'Bill Amount',
      className: 'text-right font-medium',
      cell: (sale) => formatCurrency(sale.final_amount)
    },
    {
      header: 'Paid',
      className: 'text-right font-medium text-emerald-600',
      cell: (sale) => (
        <div className="flex flex-col items-end gap-1">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(sale.paid_amount)}</span>
          {sale.payments && sale.payments.length > 0 && (
            <div className="flex flex-col items-end gap-0.5 mt-0.5">
              {sale.payments.map((p: any, idx: number) => (
                <span key={p.id || idx} className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded tracking-wide whitespace-nowrap">
                  {p.payment_mode === 'Cash' && '💵'}
                  {p.payment_mode === 'UPI' && '📱'}
                  {p.payment_mode === 'Card' && '💳'}
                  {p.payment_mode === 'Udhar' && '🤝'}
                  {` ${p.payment_mode}: ${formatCurrency(p.amount)}`}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Balance',
      className: 'text-right font-bold',
      cell: (sale) => {
        const balance = sale.final_amount - sale.paid_amount;
        if (balance > 0) {
          return <span className="text-rose-600 dark:text-rose-400">{formatCurrency(balance)}</span>;
        } else if (balance < 0) {
          return <span className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(Math.abs(balance))}</span>;
        }
        return <span className="text-slate-900 dark:text-white">{formatCurrency(0)}</span>;
      }
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
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center justify-center gap-2 h-10 px-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Customer
            </button>
            <Button onClick={() => navigate(`/pos?customer_id=${id}`)} className="h-10 px-4 py-2 text-sm rounded-lg">
              <IndianRupee className="w-4 h-4 mr-2" />
              New Sale
            </Button>
          </div>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="md:col-span-2 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white text-base mb-5 tracking-tight">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{customer.phone || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Address</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{customer.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Outstanding Card */}
          <div className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${
            outstanding > 0 
              ? 'bg-gradient-to-br from-white to-rose-50/15 dark:from-[#09090b] dark:to-rose-950/5 border-rose-100 dark:border-rose-900/20' 
              : 'bg-gradient-to-br from-white to-slate-50/20 dark:from-[#09090b] dark:to-white/[0.01] border-slate-200 dark:border-white/5'
          }`}>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base tracking-tight">Total Outstanding</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Outstanding Balance</p>
            </div>
            
            <div className="my-5">
              <p className={`text-4xl font-display font-black tracking-tight ${
                outstanding > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
              }`}>
                {formatCurrency(outstanding)}
              </p>
              
              <div className="flex justify-between items-center mt-5 pt-3 border-t border-dashed border-slate-100 dark:border-white/5 text-xs text-slate-500">
                <span>Total Billed: <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(totalBilled)}</span></span>
                <span>Total Paid: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid)}</span></span>
              </div>
            </div>
            
            <Button 
              variant="brand"
              className="w-full h-10 text-xs font-semibold rounded-xl" 
              onClick={() => {
                setIsCollectPaymentOpen(true);
              }}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              Collect Payment
            </Button>
          </div>
        </div>

        {/* Sales History and EMI Schedule tabs */}
        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
            <button 
              className={`px-6 py-4 text-sm font-bold tracking-wide uppercase transition-colors flex items-center gap-2 relative ${activeTab === 'sales' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('sales')}
            >
              Sales History
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${activeTab === 'sales' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'}`}>
                {customer.sales?.length || 0}
              </span>
              {activeTab === 'sales' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
            <button 
              className={`px-6 py-4 text-sm font-bold tracking-wide uppercase transition-colors flex items-center gap-2 relative ${activeTab === 'emi' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              onClick={() => setActiveTab('emi')}
            >
              EMI Schedule
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${activeTab === 'emi' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'}`}>
                {Array.isArray(emis) ? emis.length : 0}
              </span>
              {activeTab === 'emi' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
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
                {!Array.isArray(emis) || emis.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No EMI records found for this customer.</p>
                ) : (
                  <div className="space-y-6">
                    {emis.map((emi: any) => (
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
                                    {(emi.is_payout_received || inst.status === 'paid') ? (
                                      <span className="inline-flex items-center text-emerald-600 text-xs font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-100 dark:border-emerald-500/20">
                                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Paid / Cleared
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center text-amber-600 text-xs font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded border border-amber-100 dark:border-amber-500/20">
                                        <Clock className="w-3.5 h-3.5 mr-1" /> Pending
                                      </span>
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
      <CollectPaymentModal isOpen={isCollectPaymentOpen} onClose={() => setIsCollectPaymentOpen(false)} customer={customer} />
    </div>
  );
}
