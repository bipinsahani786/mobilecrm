import { useParams, useNavigate } from 'react-router-dom';
import { useSale } from '../api/useSales';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { FileText, Printer, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useTenantStore } from '@/store/tenantStore';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { useState } from 'react';
import { InvoiceHeader } from '../components/invoice/InvoiceHeader';
import { InvoiceItemsTable } from '../components/invoice/InvoiceItemsTable';
import { InvoiceTotals } from '../components/invoice/InvoiceTotals';
import { EditSaleModal } from '../components/EditSaleModal';

function InvoiceDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={FileText}
        title="Loading Invoice..." 
        subtitle="Please wait"
      />
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        <CardSkeleton count={1} />
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mt-6 border border-slate-200 dark:border-slate-800">
          <table className="w-full">
            <tbody>
              <TableSkeleton cols={4} rows={3} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sale, isLoading } = useSale(Number(id));
  const { activeBusiness } = useTenantStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'receipt'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) return <InvoiceDetailsSkeleton />;
  if (!sale) return <div className="p-8 text-center text-rose-500">Invoice not found</div>;

  const handlePrint = () => {
    window.print();
  };

  const isEmiPaid = sale?.emiDetail?.installments?.some((inst: any) => inst.status === 'paid');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 print:bg-white print:min-h-0">
      <div className="print:hidden">
        <PageHeader
          title={`Invoice ${sale.invoice_number}`}
          subtitle={`Generated on ${new Date(sale.date).toLocaleDateString()}`}
          icon={FileText}
          breadcrumbs={[
            { label: 'Invoices', onClick: () => navigate('/invoices') },
            { label: sale.invoice_number, active: true }
          ]}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/invoices')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button 
                variant="outline" 
                className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-400"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Invoice
              </Button>
              {activeTab === 'receipt' && (
                <Button onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" /> Print Receipt
                </Button>
              )}
            </div>
          }
        />
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 print:p-0 print:m-0 print:max-w-none">
        
        {/* Tabs - Hidden when printing */}
        <div className="print:hidden flex space-x-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-lg w-fit mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
              activeTab === 'overview' 
                ? 'bg-white dark:bg-[#09090b] text-primary-600 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('receipt')}
            className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
              activeTab === 'receipt' 
                ? 'bg-white dark:bg-[#09090b] text-primary-600 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            Printable Receipt
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="print:hidden space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Overview Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Summary Card */}
              <div className="md:col-span-2 bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Invoice Details</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(sale.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Discount</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(sale.discount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Final Amount</p>
                    <p className="text-xl font-bold text-primary-600">{formatCurrency(sale.final_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Paid Amount</p>
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(sale.paid_amount)}</p>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Items ({sale.items?.length || 0})</h4>
                <div className="border border-slate-200 dark:border-white/5 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Item</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Qty</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Price</th>
                        <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {sale.items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900 dark:text-white">{item.product?.model_name || 'Unknown Product'}</p>
                            {item.batch && <p className="text-xs text-slate-500">Batch: {item.batch.batch_number}</p>}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{formatCurrency(item.unit_price)}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Side Cards */}
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Customer Info</h3>
                  {sale.customer ? (
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-lg">{sale.customer.name}</p>
                      <p className="text-slate-500 text-sm mt-1">{sale.customer.phone || 'No phone provided'}</p>
                      <Button 
                        variant="ghost" 
                        className="p-0 h-auto mt-3 text-primary-600"
                        onClick={() => navigate(`/customers/${sale.customer.id}`)}
                      >
                        View Full Profile
                      </Button>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">Walk-in Customer (No profile)</div>
                  )}
                </div>

                {/* Payment History */}
                <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Payment Methods</h3>
                  <div className="space-y-3">
                    {sale.payments?.map((payment: any) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{payment.payment_mode}</p>
                          {payment.notes && <p className="text-xs text-slate-500">{payment.notes}</p>}
                        </div>
                        <p className="font-bold text-emerald-600">{formatCurrency(payment.amount)}</p>
                      </div>
                    ))}
                  </div>

                  {sale.emiDetail && (
                    <div className="mt-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                      <p className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider mb-2">EMI Finance</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{sale.emiDetail.financier_name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Loan: {formatCurrency(sale.emiDetail.loan_amount)}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Tenure: {sale.emiDetail.tenure_months} months</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm print:shadow-none print:border-none print:rounded-none animate-in fade-in slide-in-from-bottom-2 duration-300">
            <InvoiceHeader sale={sale} activeBusiness={activeBusiness} />
            
            <InvoiceItemsTable items={sale.items || []} />
            
            <InvoiceTotals sale={sale} />

            {/* Payments Section in Receipt */}
            <div className="p-8 border-t border-slate-200 dark:border-white/5">
              <h3 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-4">Payment Details</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sale.payments?.map((payment: any) => (
                    <div key={payment.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-500 mb-1">{payment.payment_mode}</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                      {payment.notes && <p className="text-xs text-slate-400 mt-1">{payment.notes}</p>}
                    </div>
                  ))}
                </div>

                {sale.emiDetail && (
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-3 flex items-center">
                      Finance Details - {sale.emiDetail.financier_name}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-indigo-600/70 dark:text-indigo-400/70 mb-1">Down Payment</p>
                        <p className="font-semibold text-indigo-900 dark:text-indigo-300">{formatCurrency(sale.emiDetail.down_payment)}</p>
                      </div>
                      <div>
                        <p className="text-indigo-600/70 dark:text-indigo-400/70 mb-1">Loan Amount</p>
                        <p className="font-semibold text-indigo-900 dark:text-indigo-300">{formatCurrency(sale.emiDetail.loan_amount)}</p>
                      </div>
                      <div>
                        <p className="text-indigo-600/70 dark:text-indigo-400/70 mb-1">Processing Fee</p>
                        <p className="font-semibold text-indigo-900 dark:text-indigo-300">{formatCurrency(sale.emiDetail.processing_fee)}</p>
                      </div>
                      <div>
                        <p className="text-indigo-600/70 dark:text-indigo-400/70 mb-1">Tenure</p>
                        <p className="font-semibold text-indigo-900 dark:text-indigo-300">{sale.emiDetail.tenure_months || 'N/A'} Months</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-8 text-center text-sm text-slate-400 border-t border-slate-200 dark:border-white/5">
              Thank you for your business!
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <EditSaleModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          sale={sale}
          isEmiPaid={isEmiPaid}
        />
      )}
    </div>
  );
}
