import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';

export default function About({ auth }: PageProps) {
    return (
        <>
            <Head title="About Us - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900 flex flex-col">
                
                <Navbar auth={auth} />

                <main className="relative z-10 flex-1 w-full pb-24">
                    
                    {/* SECTION 1: HERO */}
                    <div className="bg-emerald-900 text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -ml-40 -mt-40 pointer-events-none"></div>
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Product Overview</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                MobileCRM
                            </h1>
                            <p className="text-sm text-stone-400 font-medium max-w-md mx-auto">
                                The unified operating system for modern retail, designed and engineered by Zytrixon Tech.
                            </p>
                        </div>
                    </div>

                    {/* SECTION 2: THE PRODUCT VISION */}
                    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6">01 — The Vision</h2>
                        <div className="text-xl md:text-3xl font-medium tracking-tight text-stone-900 leading-snug space-y-8">
                            <p>
                                MobileCRM was built by Zytrixon Tech to solve the fragmentation and complexity faced by modern retail merchants. Historically, managing a retail store required coordinating a messy combination of ledger booklets, spreadsheet trackers, offline invoicing tools, and chat groups.
                            </p>
                            <p>
                                We consolidated all of these operations into a single platform. MobileCRM lets you run your party ledgers, staff payroll, and tax-compliant billing from a single, high-performance dashboard that works seamlessly on desktop and mobile.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 3: CORE CAPABILITIES */}
                    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stone-300">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-12">02 — Core Capabilities</h2>
                        
                        <div className="space-y-16">
                            <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
                                <span className="text-4xl font-black text-stone-300 w-16">01</span>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">One-Click Invoicing</h3>
                                    <p className="text-stone-600 font-medium max-w-xl">Generate professional, GST-compliant invoices instantly. Send digital receipts directly to customers and keep your billing history automatically cataloged and secure.</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
                                <span className="text-4xl font-black text-stone-300 w-16">02</span>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">Automated Ledgers</h3>
                                    <p className="text-stone-600 font-medium max-w-xl">Ditch paper ledgers. MobileCRM tracks accounts receivable, outstanding balances, and receipt settlements in real time. Maintain crystal-clear transparency with your vendors and clients.</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
                                <span className="text-4xl font-black text-stone-300 w-16">03</span>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">Integrated Payroll</h3>
                                    <p className="text-stone-600 font-medium max-w-xl">Easily manage staff attendance, dynamic wages, bonuses, and advances. Calculate accurate monthly payrolls and process payouts instantly with no spreadsheet calculation errors.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: KEY ADVANTAGES */}
                    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stone-300">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-12">03 — Why Choose MobileCRM</h2>
                        
                        <div className="space-y-12">
                            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-4">
                                <span className="text-4xl md:text-5xl font-black tracking-tighter text-stone-900">Zero Training</span>
                                <span className="text-sm font-bold uppercase tracking-widest text-stone-500 pb-2">Ready to Deploy</span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-4">
                                <span className="text-4xl md:text-5xl font-black tracking-tighter text-stone-900">AES-256 Encrypted</span>
                                <span className="text-sm font-bold uppercase tracking-widest text-stone-500 pb-2">Secured Data</span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-4">
                                <span className="text-4xl md:text-5xl font-black tracking-tighter text-stone-900">Low Latency</span>
                                <span className="text-sm font-bold uppercase tracking-widest text-stone-500 pb-2">Zero Waiting Time</span>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: CTA */}
                    <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stone-300 text-center">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-stone-900 mb-8">
                            Empower your business.
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
