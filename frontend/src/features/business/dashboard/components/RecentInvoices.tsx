import { ArrowRight, MoreHorizontal } from "lucide-react";

const recentInvoices = [
  { id: "INV-2026-001", customer: "Acme Corp", date: "Jun 09, 2026", amount: "₹45,000", status: "Paid" },
  { id: "INV-2026-002", customer: "Globex Inc", date: "Jun 08, 2026", amount: "₹12,500", status: "Pending" },
  { id: "INV-2026-003", customer: "Initech", date: "Jun 05, 2026", amount: "₹8,900", status: "Paid" },
  { id: "INV-2026-004", customer: "Umbrella Corp", date: "Jun 01, 2026", amount: "₹1,20,000", status: "Overdue" },
  { id: "INV-2026-005", customer: "Massive Dynamic", date: "May 28, 2026", amount: "₹34,000", status: "Paid" },
];

export function RecentInvoices() {
  return (
    <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-sm">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
        <div>
          <h3 className="text-lg font-bold text-white">Recent Invoices</h3>
          <p className="text-sm text-zinc-500 font-medium">Latest generated bills</p>
        </div>
        <button className="text-sm font-bold text-[#fe7d02] hover:text-[#e67002] flex items-center gap-1 group bg-[#fe7d02]/10 px-3 py-1.5 rounded-lg transition-colors">
          View all <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-zinc-500 bg-black/40">
              <th className="px-6 py-4 font-bold">Invoice #</th>
              <th className="px-6 py-4 font-bold">Customer</th>
              <th className="px-6 py-4 font-bold">Date</th>
              <th className="px-6 py-4 font-bold">Amount</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {recentInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-white/[0.03] transition-colors group cursor-pointer">
                <td className="px-6 py-5 font-bold text-white">{invoice.id}</td>
                <td className="px-6 py-5 text-zinc-300 font-medium">{invoice.customer}</td>
                <td className="px-6 py-5 text-zinc-500">{invoice.date}</td>
                <td className="px-6 py-5 font-bold text-white">{invoice.amount}</td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                    invoice.status === "Paid" ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" :
                    invoice.status === "Pending" ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" :
                    "bg-rose-400/10 text-rose-400 border border-rose-400/20"
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
