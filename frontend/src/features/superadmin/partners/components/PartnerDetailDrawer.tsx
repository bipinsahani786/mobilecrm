import { Drawer } from '@/components/ui/drawer';
import { usePartnerAnalytics } from '../api/usePartners';
import { Mail, Phone, Briefcase, Landmark, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface PartnerDetailDrawerProps {
  partnerId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PartnerDetailDrawer({ partnerId, isOpen, onClose }: PartnerDetailDrawerProps) {
  const { data: analytics, isLoading } = usePartnerAnalytics(partnerId);

  if (!isOpen) return null;

  const partner = analytics?.partner;
  const metrics = analytics?.metrics;
  const recentLeads = analytics?.recent_leads ?? [];
  const recentCommissions = analytics?.recent_commissions ?? [];

  // Payout details parser
  const payout = partner?.payout_details ?? {};

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={partner?.name ?? 'Partner Details'}
      subtitle={partner?.company_name ? `${partner.company_name} · Referral Agent` : 'Referral Agent'}
      className="max-w-2xl"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading partner analytics...</p>
        </div>
      ) : !analytics ? (
        <div className="text-center py-12 text-slate-500">Failed to load partner information.</div>
      ) : (
        <div className="space-y-6 text-slate-700 dark:text-slate-300">
          
          {/* ── Partner Profile Contact Card ── */}
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-500">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">{partner?.name}</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Code: <span className="text-primary-600 dark:text-primary-500 select-all font-mono font-bold">{partner?.referral_code}</span>
                </p>
              </div>
              <div className="ml-auto">
                <Badge variant={partner?.status ? 'success' : 'destructive'}>
                  {partner?.status ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm mt-1 border-t border-slate-200/50 dark:border-white/5 pt-3">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{partner?.email}</span>
              </div>
              {partner?.phone && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{partner.phone}</span>
                </div>
              )}
              {partner?.custom_domain && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 col-span-1 sm:col-span-2">
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <a 
                    href={`https://${partner.custom_domain}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-primary-500 hover:underline font-medium"
                  >
                    https://{partner.custom_domain}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ── Commission & Payout Status Summary ── */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Commissions & Payout Status
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl p-3">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">Earned</p>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">
                  ₹{metrics?.total_commission_earned}
                </p>
              </div>
              <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-xl p-3">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wider">Paid Payouts</p>
                <p className="text-lg font-black text-blue-700 dark:text-blue-400 mt-1">
                  ₹{metrics?.paid_commission}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl p-3 shadow-sm shadow-amber-500/5">
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">To Be Paid</p>
                <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-1">
                  ₹{metrics?.pending_commission}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-1">
                  ₹{metrics?.total_referred_revenue}
                </p>
              </div>
            </div>
          </div>

          {/* ── Partner Bank Payout Details ── */}
          <div className="bg-white dark:bg-[#141419] border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2 mb-3">
              <Landmark className="w-4 h-4 text-primary-500" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Partner Payout Account Details
              </h4>
            </div>
            {Object.keys(payout).length > 0 ? (
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                {payout.bank_name && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Bank Name</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{payout.bank_name}</span>
                  </div>
                )}
                {payout.account_holder && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Account Holder</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{payout.account_holder}</span>
                  </div>
                )}
                {payout.account_number && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Account Number</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 select-all">{payout.account_number}</span>
                  </div>
                )}
                {payout.ifsc && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">IFSC Code</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 select-all">{payout.ifsc}</span>
                  </div>
                )}
                {payout.upi_id && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">UPI Address</span>
                    <span className="font-semibold text-primary-600 dark:text-primary-400 font-mono select-all">{payout.upi_id}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center p-3 text-xs text-slate-400 italic">
                No payout bank details registered for this sales partner.
              </div>
            )}
          </div>

          {/* ── Referral Funnel Analytics ── */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Referral Pipeline Analytics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Leads</span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">
                  {metrics?.total_leads}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Converted</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-500 mt-1 block">
                  {metrics?.converted_leads}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Conv. Rate</span>
                <span className="text-xl font-extrabold text-primary-500 mt-1 block">
                  {metrics?.conversion_rate}%
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl p-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Referred Stores</span>
                <span className="text-xl font-extrabold text-indigo-500 mt-1 block">
                  {metrics?.total_businesses}
                </span>
              </div>
            </div>
          </div>

          {/* ── Recent Leads Table ── */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Recent Referral Leads
              </h4>
              <span className="text-[10px] font-semibold text-slate-400">LATEST 5</span>
            </div>
            <div className="border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden bg-white dark:bg-[#111115]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-2.5">Business Name</th>
                    <th className="px-4 py-2.5">Contact Person</th>
                    <th className="px-4 py-2.5">Created</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {recentLeads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">No leads generated by this agent yet.</td>
                    </tr>
                  ) : (
                    recentLeads.map((lead: any) => (
                      <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{lead.business_name}</td>
                        <td className="px-4 py-2.5 text-slate-500">{lead.contact_person}</td>
                        <td className="px-4 py-2.5 text-slate-400">{format(new Date(lead.created_at), 'MMM dd, yyyy')}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            lead.status === 'converted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            lead.status === 'lost' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400' :
                            lead.status === 'contacted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400' :
                            'bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-400'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Recent Referral Commissions Table ── */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Recent Referral Commissions
              </h4>
              <span className="text-[10px] font-semibold text-slate-400">LATEST 5</span>
            </div>
            <div className="border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden bg-white dark:bg-[#111115]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-2.5">Tenant Store</th>
                    <th className="px-4 py-2.5">Plan</th>
                    <th className="px-4 py-2.5 text-right">Sale Amount</th>
                    <th className="px-4 py-2.5 text-right">Commission</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {recentCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">No commission payouts registered yet.</td>
                    </tr>
                  ) : (
                    recentCommissions.map((comm: any) => (
                      <tr key={comm.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{comm.business?.name}</td>
                        <td className="px-4 py-2.5 text-slate-500">{comm.plan?.name || 'Custom Plan'}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">₹{comm.amount_paid_by_tenant}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-primary-600 dark:text-primary-500">₹{comm.commission_amount}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            comm.status === 'paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400' :
                            comm.status === 'cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'
                          }`}>
                            {comm.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </Drawer>
  );
}
