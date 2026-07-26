import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';

export default function Features({ auth }: PageProps) {
    const featuresList = [
        {
            title: "One-Click Billing & GST Invoicing",
            description: "Generate compliant GST bills instantly. Automatically calculate SGST, CGST, and IGST rates based on items. Deliver invoices directly via email or WhatsApp and track status.",
            icon: "🧾"
        },
        {
            title: "Real-Time Party Ledgers",
            description: "Track all debit and credit transactions per customer and supplier. Stay up-to-date with clear accounts receivable and payable ledger sheets, sending instant statement PDFs with one tap.",
            icon: "📒"
        },
        {
            title: "Automated Staff Payroll",
            description: "Manage employee attendance, baseline salaries, bonuses, and advances. Automatically compile payroll checks at the end of the month, reducing administrative spreadsheet overhead.",
            icon: "👥"
        },
        {
            title: "Advanced Merchant Analytics",
            description: "View sales margins, payment collection speeds, and vendor expense reports dynamically. Keep track of your store's cash flow performance with graphical charts and transaction timelines.",
            icon: "📈"
        }
    ];

    return (
        <>
            <Head title="Features - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900 flex flex-col">
                
                <Navbar auth={auth} />

                <main className="relative z-10 flex-1 w-full pb-24">
                    {/* Header Section */}
                    <div className="bg-emerald-900 text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -ml-40 -mt-40 pointer-events-none" />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Platform Capability</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                Core Features
                            </h1>
                            <p className="text-sm text-stone-400 font-medium max-w-md mx-auto">
                                Discover the powerful merchant tools engineered inside the MobileCRM retail operating system.
                            </p>
                        </div>
                    </div>

                    {/* Features Content */}
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="space-y-16">
                            {featuresList.map((feat, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-12 items-start border-b border-stone-300 pb-12 last:border-0 last:pb-0">
                                    <div className="text-4xl p-4 bg-white rounded-2xl border border-[#D4CBB3] shadow-sm shrink-0">
                                        {feat.icon}
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight">{feat.title}</h3>
                                        <p className="text-stone-600 font-medium leading-relaxed text-base">{feat.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stone-300 text-center">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-stone-900 mb-8">
                            Ready to scale up?
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
