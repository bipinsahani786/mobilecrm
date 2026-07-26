import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';

export default function Integrations({ auth }: PageProps) {
    const integrations = [
        {
            name: "WhatsApp Business API",
            type: "Communication",
            description: "Automatically dispatch receipts, billing invoices, payment reminders, and statements directly to customer WhatsApp threads.",
            icon: "💬"
        },
        {
            name: "Razorpay & UPI Payments",
            type: "Financial Gateway",
            description: "Embed dynamic QR codes on invoice sheets. Collect digital payments instantly over UPI networks or credit/debit card portals.",
            icon: "💳"
        },
        {
            name: "Tally & Spreadsheet Sync",
            type: "Accounting Exports",
            description: "Export clean CSV and JSON ledger logs formatted specifically for immediate import into Tally, QuickBooks, or standard sheets.",
            icon: "📊"
        },
        {
            name: "SMS Carrier Notifications",
            type: "Alert Systems",
            description: "Send standard SMS transactional details, payment reminders, and payroll allowance alerts to vendors and staff automatically.",
            icon: "✉️"
        }
    ];

    return (
        <>
            <Head title="Integrations - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900 flex flex-col">
                
                <Navbar auth={auth} />

                <main className="relative z-10 flex-1 w-full pb-24">
                    {/* Header Section */}
                    <div className="bg-emerald-900 text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -ml-40 -mt-40 pointer-events-none" />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Connected Ecosystem</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                Integrations
                            </h1>
                            <p className="text-sm text-stone-400 font-medium max-w-md mx-auto">
                                Sync MobileCRM with your existing communication lines, payment processors, and financial ledger software.
                            </p>
                        </div>
                    </div>

                    {/* Integrations Grid */}
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="grid md:grid-cols-2 gap-8">
                            {integrations.map((item, i) => (
                                <div key={i} className="bg-white rounded-3xl border border-[#D4CBB3] p-8 shadow-md flex flex-col justify-between hover:-translate-y-1 transition-all duration-300">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-3xl p-2 bg-[#F7F4EB] rounded-xl border border-stone-200">{item.icon}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-100">{item.type}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-stone-900 tracking-tight">{item.name}</h3>
                                        <p className="text-stone-500 font-medium text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stone-300 text-center">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-stone-900 mb-8">
                            Request a custom sync.
                        </h2>
                        <Link href={route('contact')} className="inline-block px-10 py-5 bg-stone-900 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-sm rounded-full transition-colors shadow-lg">
                            Request Free Trial
                        </Link>
                    </section>
                </main>

                <FooterSection />
            </div>
        </>
    );
}
