import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupplier, useSupplierLedger } from '../api/useSuppliers';
import { PageHeader } from '../../../../components/layout/PageHeader';
import { Button } from '../../../../components/ui/button';
import { Plus, Phone, MapPin, Package, Download, Edit2, IndianRupee, RotateCcw, BookOpen, Printer, FileDown } from 'lucide-react';
import { formatCurrency } from '../../../../lib/formatters';
import { AddPaymentModal } from '../components/AddPaymentModal';
import { EditSupplierModal } from '../components/EditSupplierModal';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import api from '@/lib/api';
import { toast } from 'sonner';

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
  const [ledgerStartDate, setLedgerStartDate] = useState<string>('');
  const [ledgerEndDate, setLedgerEndDate] = useState<string>('');
  const { data: ledgerData } = useSupplierLedger(Number(id), ledgerStartDate, ledgerEndDate);
  const [activeTab, setActiveTab] = useState<'purchases' | 'payments' | 'ledger'>('purchases');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | undefined>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDownloadBill = async (purchase: any) => {
    try {
      toast.loading('Generating bill PDF...', { id: 'pdf-download' });
      const response = await api.get(`/business/suppliers/purchases/${purchase.id}/bill-pdf?header=true&footer=true`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `purchase-bill-${purchase.purchase_number || purchase.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF downloaded successfully', { id: 'pdf-download' });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: 'pdf-download' });
    }
  };

  const exportLedgerCsv = () => {
    if (!ledgerData?.entries) return;
    
    const infoRows = [
      [`"Supplier Ledger: ${supplier?.name?.replace(/"/g, '""')}"`],
      [`"Exported On: ${new Date().toLocaleString('en-IN')}"`],
      [`"Date Range: ${ledgerStartDate ? new Date(ledgerStartDate).toLocaleDateString('en-IN') : 'All'} to ${ledgerEndDate ? new Date(ledgerEndDate).toLocaleDateString('en-IN') : 'All'}"`],
      []
    ];

    const headers = ['Date', 'Particulars', 'Type', 'Debit (Billed)', 'Credit (Paid/Return)', 'Balance'];
    
    const rows = ledgerData.entries.map((entry: any) => [
      `"${new Date(entry.date).toLocaleDateString('en-IN')}"`,
      `"${entry.particulars.replace(/"/g, '""')}"`,
      `"${entry.type.toUpperCase()}"`,
      entry.debit || 0,
      entry.credit || 0,
      entry.balance || 0
    ]);

    const totalsRow = [
      '',
      '"NET TOTALS"',
      '',
      ledgerData.total_debit || 0,
      ledgerData.total_credit || 0,
      ledgerData.closing_balance || 0
    ];

    const csvContent = [
      ...infoRows.map(r => r.join(',')),
      headers.join(','),
      ...rows.map((r: any) => r.join(',')),
      totalsRow.join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger-${supplier?.name}-${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <SupplierDetailsSkeleton />;
  if (!supplier) return <div className="p-8 text-center text-rose-500 min-h-screen bg-slate-50 dark:bg-[#09090b]">Supplier not found</div>;

  const totalBilled = supplier.purchases?.reduce((sum: number, p: any) => sum + Number(p.bill_amount), 0) || 0;
  const purchasesPaid = supplier.purchases?.reduce((sum: number, p: any) => sum + Number(p.paid_amount), 0) || 0;
  const unlinkedPayments = supplier.payments?.filter((p: any) => !p.supplier_purchase_id).reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  const totalPaid = purchasesPaid + unlinkedPayments;
  const outstanding = totalBilled - totalPaid;

  const purchasesColumns: ColumnDef<any>[] = [
    {
      header: 'Bill Info',
      cell: (purchase) => (
        <div className="whitespace-nowrap">
          <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{purchase.purchase_number}</p>
          <p className="text-xs text-slate-500 mt-0.5">{new Date(purchase.purchase_date).toLocaleDateString()}</p>
          {purchase.due_date && <p className="text-[10px] font-semibold text-rose-500 mt-0.5">Due: {new Date(purchase.due_date).toLocaleDateString()}</p>}
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
      header: 'Net Bill',
      className: 'text-right',
      cell: (purchase) => {
        const itemsTotal = purchase.items?.reduce((sum: number, item: any) => sum + Number(item.total_price), 0) || purchase.bill_amount;
        const returnedAmount = itemsTotal - purchase.bill_amount;
        
        return (
          <div className="flex flex-col items-end justify-center">
            <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(purchase.bill_amount)}</span>
            {returnedAmount > 0 && (
              <span className="text-[10px] text-rose-500 font-medium mt-0.5">
                (-{formatCurrency(returnedAmount)} Ret.)
              </span>
            )}
          </div>
        );
      }
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
        <div className="flex justify-end items-center gap-2">
          {purchase.bill_amount - purchase.paid_amount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPurchaseId(purchase.id);
                setIsPaymentModalOpen(true);
              }}
            >
              <IndianRupee className="w-3.5 h-3.5 mr-1" /> Pay
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 dark:border-emerald-500/20"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadBill(purchase);
            }}
          >
             <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Bill
          </Button>
          {purchase.invoice_file && (
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              window.open(purchase.invoice_file, '_blank');
            }}>
              <Download className="w-4 h-4 text-slate-500" />
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
      {/* Massive Fintech Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary-500/10 dark:bg-primary-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-500/10 dark:bg-primary-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6 z-10">
        
        {/* Top Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              <button onClick={() => navigate('/suppliers')} className="hover:text-primary-500 transition-colors">Suppliers</button>
              <span>/</span>
              <span className="text-primary-500">{supplier.name}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{supplier.name}</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">{supplier.custom_id || `ID: ${supplier.id}`}</p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center justify-center gap-2 h-10 px-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Supplier
            </button>
            <Button variant="brand" onClick={() => navigate(`/suppliers/${id}/purchases/new`)} className="h-10 px-4 py-2 text-sm rounded-xl font-bold uppercase tracking-widest">
              <Plus className="w-4 h-4 mr-2" />
              Add Purchase Bill
            </Button>
            <button 
              onClick={() => navigate(`/suppliers/${id}/purchase-returns/new`)}
              className="flex items-center justify-center gap-2 h-10 px-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Purchase Return
            </button>
          </div>
        </div>

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
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{supplier.phone || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Address</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{supplier.address || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Items Supplied</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{supplier.items_supplied || 'N/A'}</p>
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Outstanding Udhar Balance</p>
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
              className="w-full h-10 text-xs font-bold uppercase tracking-widest rounded-xl" 
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <IndianRupee className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-4 text-sm font-bold tracking-wide uppercase transition-colors flex items-center gap-2 relative ${activeTab === 'purchases' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Purchases
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${activeTab === 'purchases' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'}`}>
                {supplier.purchases?.length || 0}
              </span>
              {activeTab === 'purchases' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-4 text-sm font-bold tracking-wide uppercase transition-colors flex items-center gap-2 relative ${activeTab === 'payments' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              Payments
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${activeTab === 'payments' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'}`}>
                {supplier.payments?.length || 0}
              </span>
              {activeTab === 'payments' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-6 py-4 text-sm font-bold tracking-wide uppercase transition-colors flex items-center gap-2 relative ${activeTab === 'ledger' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <BookOpen className="w-4 h-4" />
              Ledger
              {activeTab === 'ledger' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
          </div>

          <div className="p-0">
            {activeTab === 'purchases' && (
              <DataTable 
                columns={purchasesColumns} 
                data={supplier.purchases || []} 
                emptyMessage="No purchases found."
                renderSubComponent={(purchase) => {
                  const billPayments = supplier.payments?.filter((p: any) => p.supplier_purchase_id === purchase.id) || [];
                  
                  if (billPayments.length === 0) {
                    return (
                      <div className="p-4 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-center text-sm font-medium text-slate-400">
                        No payments linked directly to this bill.
                      </div>
                    );
                  }

                  return (
                    <div className="p-4 bg-slate-50/50 dark:bg-[#111118]/50 border-t border-slate-100 dark:border-white/5 shadow-inner">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 px-2">Linked Payments</h4>
                      <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#09090b]">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10">
                            <tr>
                              <th className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                              <th className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Mode</th>
                              <th className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Notes</th>
                              <th className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {billPayments.map((p: any) => (
                              <tr key={p.id} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{new Date(p.date).toLocaleDateString()}</td>
                                <td className="px-4 py-3 uppercase text-xs font-semibold text-slate-600 dark:text-slate-400">{p.payment_mode}</td>
                                <td className="px-4 py-3 text-slate-500">{p.notes || '-'}</td>
                                <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatCurrency(p.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }}
              />
            )}

            {activeTab === 'payments' && (
              <DataTable 
                columns={paymentsColumns} 
                data={supplier.payments || []} 
                emptyMessage="No payments found."
              />
            )}

            {activeTab === 'ledger' && (
              <div className="space-y-4 printable-ledger">
                {/* Filters & Export */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center p-4 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl print:hidden">
                   <div className="flex gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Start Date</label>
                        <input type="date" value={ledgerStartDate} onChange={(e) => setLedgerStartDate(e.target.value)} className="flex h-9 w-36 rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/10 dark:bg-[#111118] dark:text-slate-50" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">End Date</label>
                        <input type="date" value={ledgerEndDate} onChange={(e) => setLedgerEndDate(e.target.value)} className="flex h-9 w-36 rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/10 dark:bg-[#111118] dark:text-slate-50" />
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => exportLedgerCsv()}>
                         <FileDown className="w-4 h-4 mr-2" /> Excel
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.print()}>
                         <Printer className="w-4 h-4 mr-2" /> Print/PDF
                      </Button>
                   </div>
                </div>

                <div className="overflow-x-auto">
                  {ledgerData?.entries && ledgerData.entries.length > 0 ? (
                    <>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Particulars</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Debit (Billed)</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Credit (Paid/Return)</th>
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...ledgerData.entries].reverse().map((entry: any) => (
                          <tr key={entry.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black ${
                                  entry.type === 'purchase' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                  entry.type === 'payment' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                  'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                }`}>
                                  {entry.type === 'purchase' ? 'P' : entry.type === 'payment' ? '₹' : 'R'}
                                </span>
                                <span className="text-sm font-semibold text-slate-800 dark:text-white">{entry.particulars}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-right text-blue-600 dark:text-blue-400">
                              {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-right text-emerald-600 dark:text-emerald-400">
                              {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                            </td>
                            <td className={`px-4 py-3 text-sm font-black text-right ${
                              entry.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                            }`}>
                              {formatCurrency(entry.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/[0.02]">
                          <td className="px-4 py-3" colSpan={2}>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Totals</span>
                          </td>
                          <td className="px-4 py-3 text-sm font-black text-right text-blue-600 dark:text-blue-400">
                            {formatCurrency(ledgerData.total_debit)}
                          </td>
                          <td className="px-4 py-3 text-sm font-black text-right text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(ledgerData.total_credit)}
                          </td>
                          <td className={`px-4 py-3 text-sm font-black text-right ${
                            ledgerData.closing_balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {formatCurrency(ledgerData.closing_balance)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-sm font-semibold">
                    No ledger entries found.
                  </div>
                )}
              </div>
            </div>
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
