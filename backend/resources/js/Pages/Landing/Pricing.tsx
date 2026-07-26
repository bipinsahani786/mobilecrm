import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';

export default function Pricing({ auth }: PageProps) {
    return (
        <>
            <Head title="Pricing - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900 flex flex-col">
                
                <Navbar auth={auth} />

                <main className="relative z-10 flex-1 w-full pb-24">
                    {/* Header Section */}
                    <div className="bg-emerald-900 text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -ml-40 -mt-40 pointer-events-none" />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Simple Rates</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                Flat-Rate Pricing
                            </h1>
                            <p className="text-sm text-stone-400 font-medium max-w-md mx-auto">
                                No hidden fees. Access every features and database query at a single transparent tier.
                            </p>
                        </div>
                    </div>

                    {/* Pricing Detail Card */}
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="bg-white rounded-[3rem] border border-[#D4CBB3] p-8 md:p-16 shadow-xl relative overflow-hidden">
                            <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
                                {/* Details */}
                                <div className="space-y-6 flex-1 text-center lg:text-left">
                                    <span className="inline-block px-4 py-1 bg-emerald-800 text-white text-[9px] font-black uppercase tracking-widest rounded-full">All-In-One Plan</span>
                                    <div className="flex items-end justify-center lg:justify-start gap-1">
                                        <span className="text-5xl md:text-7xl font-black tracking-tight text-stone-900">₹2,499</span>
                                        <span className="text-lg text-stone-400 font-bold pb-2">/month</span>
                                    </div>
                                    <p className="text-stone-500 font-medium leading-relaxed text-sm">
                                        Unlimited party ledger trackers, fully automated payroll runs, custom GST invoice billing generation, and real-time dashboard analytics tools.
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="hidden lg:block w-px h-48 bg-stone-200" />
                                <div className="lg:hidden w-full h-px bg-stone-250" />

                                {/* Action & Features */}
                                <div className="flex-1 w-full space-y-8">
                                    <ul className="space-y-4">
                                        {['Unlimited Ledger Parties', 'Automated Payroll Reports', 'GST-Compliant Invoices', 'Database Encryption & SSL'].map((feat, i) => (
                                            <li key={i} className="flex items-center gap-3 text-stone-700 font-bold text-sm">
                                                <span className="text-emerald-700">✓</span> {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href={route('contact')} className="block w-full py-4 text-center font-black text-white bg-stone-900 hover:bg-emerald-700 rounded-xl transition-all shadow-md uppercase tracking-wider text-xs">
                                        Request Free Trial
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <FooterSection />
            </div>
        </>
    );
}
