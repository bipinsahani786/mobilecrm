import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';
import { useState } from 'react';

export default function Docs({ auth }: PageProps) {
    const [activeSection, setActiveSection] = useState('onboarding');

    const sections = [
        { id: 'onboarding', label: 'Onboarding Guide' },
        { id: 'ledgers', label: 'Party Ledgers' },
        { id: 'payroll', label: 'Payroll Configuration' },
        { id: 'api', label: 'API Reference' },
        { id: 'webhooks', label: 'Webhooks' },
    ];

    return (
        <>
            <Head title="Documentation - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900 flex flex-col">
                
                <Navbar auth={auth} />

                <main className="relative z-10 flex-1 w-full pb-24">
                    {/* Header Section */}
                    <div className="bg-emerald-900 text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -ml-40 -mt-40 pointer-events-none" />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Help Center</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                Documentation
                            </h1>
                            <p className="text-sm text-stone-400 font-medium max-w-md mx-auto">
                                Everything you need to configure and operate MobileCRM for your retail store.
                            </p>
                        </div>
                    </div>

                    {/* Docs Body with Sidebar */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="flex flex-col lg:flex-row gap-12">
                            {/* Left Sidebar Navigation */}
                            <aside className="w-full lg:w-64 shrink-0">
                                <div className="sticky top-28 bg-white border border-[#D4CBB3] rounded-3xl p-6 shadow-md space-y-2">
                                    <h4 className="font-black text-stone-900 uppercase tracking-widest text-[10px] mb-4 pl-3">Sections</h4>
                                    <nav className="flex flex-col space-y-1">
                                        {sections.map(sec => (
                                            <button
                                                key={sec.id}
                                                onClick={() => setActiveSection(sec.id)}
                                                className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                                                    activeSection === sec.id
                                                        ? 'bg-emerald-800 text-white shadow-sm'
                                                        : 'text-stone-500 hover:bg-stone-50 hover:text-stone-850'
                                                }`}
                                            >
                                                {sec.label}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </aside>

                            {/* Right Content Panel */}
                            <article className="flex-1 bg-white border border-[#D4CBB3] rounded-3xl p-8 md:p-12 shadow-md min-h-[50vh]">
                                {activeSection === 'onboarding' && (
                                    <div className="space-y-6">
                                        <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tight">Onboarding Guide</h2>
                                        <p className="text-stone-600 font-medium leading-relaxed">
                                            Setting up MobileCRM for your store is designed to take under five minutes. Follow these quick steps to register your workspace:
                                        </p>
                                        <div className="space-y-4 pt-4">
                                            <div className="flex gap-4 items-start">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shrink-0">1</span>
                                                <div>
                                                    <h4 className="font-bold text-stone-900 mb-1">Create Account Profile</h4>
                                                    <p className="text-stone-600 text-sm font-medium">Register using your business email and verify credentials. Complete store name entries.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-start">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shrink-0">2</span>
                                                <div>
                                                    <h4 className="font-bold text-stone-900 mb-1">Link GST Profile</h4>
                                                    <p className="text-stone-600 text-sm font-medium">Add your store location address, registration code, and default SGST/CGST rules.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-start">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm shrink-0">3</span>
                                                <div>
                                                    <h4 className="font-bold text-stone-900 mb-1">Add Initial Parties</h4>
                                                    <p className="text-stone-600 text-sm font-medium">Import customer contacts or vendor profiles to initiate balance bookkeeping.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'ledgers' && (
                                    <div className="space-y-6">
                                        <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tight">Managing Party Ledgers</h2>
                                        <p className="text-stone-600 font-medium leading-relaxed">
                                            The ledger module acts as your central ledger for vendor and customer statements. You can add debit or credit sheets dynamically:
                                        </p>
                                        <ul className="list-disc pl-5 space-y-2 text-stone-650 font-medium text-sm leading-relaxed">
                                            <li><strong>Adding Parties:</strong> Navigate to the Ledgers tab, click 'New Party', and configure telephone and email records.</li>
                                            <li><strong>Posting Entries:</strong> Select a party, click 'Add Transaction', and choose Credit (Money In) or Debit (Money Out).</li>
                                            <li><strong>Statement PDFs:</strong> Click 'Export Statement' to download clean, printable payment summaries.</li>
                                        </ul>
                                    </div>
                                )}

                                {activeSection === 'payroll' && (
                                    <div className="space-y-6">
                                        <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tight">Payroll Configuration</h2>
                                        <p className="text-stone-600 font-medium leading-relaxed">
                                            Automate monthly staff salary disbursements and payroll logs. Setting parameters eliminates wage miscalculations:
                                        </p>
                                        <div className="space-y-4 pt-2">
                                            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50">
                                                <h4 className="font-bold text-stone-900 mb-1 text-sm">Attendance Allowances</h4>
                                                <p className="text-stone-600 text-xs font-medium">Link daily work logs to calculate dynamic hourly wages or monthly flat retainers.</p>
                                            </div>
                                            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50">
                                                <h4 className="font-bold text-stone-900 mb-1 text-sm">Approving Advances</h4>
                                                <p className="text-stone-600 text-xs font-medium">Record salary advance payouts; these will be deducted automatically from the final month-end check run.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'api' && (
                                    <div className="space-y-6">
                                        <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tight">Developer API Reference</h2>
                                        <p className="text-stone-600 font-medium leading-relaxed">
                                            Integrate MobileCRM capabilities inside external software. Authenticate requests using your account token header:
                                        </p>
                                        <div className="space-y-2 pt-2">
                                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-lg">Authentication</span>
                                            <pre className="bg-stone-900 text-orange-200 text-xs font-mono p-4 rounded-xl overflow-x-auto shadow-inner">
{`Authorization: Bearer YOUR_ACCOUNT_API_KEY`}
                                            </pre>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-lg">Retrieve Ledgers</span>
                                            <pre className="bg-stone-900 text-orange-200 text-xs font-mono p-4 rounded-xl overflow-x-auto shadow-inner">
{`GET https://api.mobilecrm.com/v1/ledgers/parties

// Response
{
  "status": "success",
  "data": [
    {
      "party_id": "party_8f0a21",
      "name": "Acme Corp Ltd",
      "balance": -1540.00
    }
  ]
}`}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'webhooks' && (
                                    <div className="space-y-6">
                                        <h2 className="text-3xl font-black text-stone-900 uppercase tracking-tight">Webhooks</h2>
                                        <p className="text-stone-600 font-medium leading-relaxed">
                                            Subscribe to asynchronous event changes on your billing accounts or invoice payments. We support POST calls with signed signatures:
                                        </p>
                                        <div className="space-y-4 pt-2">
                                            <p className="text-stone-600 font-medium text-sm leading-relaxed">
                                                When a payment status changes, we will POST the following JSON load to your registered webhook target URL:
                                            </p>
                                            <pre className="bg-stone-900 text-orange-200 text-xs font-mono p-4 rounded-xl overflow-x-auto shadow-inner">
{`POST https://yourdomain.com/webhooks/mobilecrm

{
  "event": "invoice.settled",
  "timestamp": "2026-07-26T14:02:11Z",
  "data": {
    "invoice_id": "inv_9a102c",
    "amount": 2499.00,
    "status": "paid"
  }
}`}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </article>
                        </div>
                    </div>
                </main>

                <FooterSection />
            </div>
        </>
    );
}
