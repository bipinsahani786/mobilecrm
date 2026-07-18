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
                    
                    {/* SECTION 1: HERO (Matches Contact Page) */}
                    <div className="bg-emerald-900 text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -ml-40 -mt-40 pointer-events-none"></div>
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Company Profile</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                Our Story.
                            </h1>
                            <p className="text-sm text-stone-400 font-medium max-w-md mx-auto">
                                We build invisible, intuitive software to run modern retail businesses.
                            </p>
                        </div>
                    </div>

                    {/* SECTION 2: THE PROBLEM (Pure Typography) */}
                    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6">01 — The Problem</h2>
                        <div className="text-xl md:text-3xl font-medium tracking-tight text-stone-900 leading-snug space-y-8">
                            <p>
                                In 2024, we noticed a massive gap in the market. While enterprise companies had access to incredibly powerful software, small and medium retailers were forced to cobble together dozens of disjointed tools just to survive.
                            </p>
                            <p>
                                One app for ledgers. Another for payroll. A separate portal for GST billing. And WhatsApp to communicate it all. It was complete chaos.
                            </p>
                            <p>
                                We decided that if the software didn't exist, we would build it ourselves.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 3: CORE PRINCIPLES (List Based, No Cards) */}
                    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stone-300">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-12">02 — Core Principles</h2>
                        
                        <div className="space-y-16">
                            <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
                                <span className="text-4xl font-black text-stone-300 w-16">01</span>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">Radical Simplicity</h3>
                                    <p className="text-stone-600 font-medium max-w-xl">Software should get out of the way. If a feature requires a manual, we've failed. We design interfaces that feel native to human intuition.</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
                                <span className="text-4xl font-black text-stone-300 w-16">02</span>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">Merchant First</h3>
                                    <p className="text-stone-600 font-medium max-w-xl">Every technical decision is weighed against one metric: does this help the merchant scale faster? Nothing else matters.</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
                                <span className="text-4xl font-black text-stone-300 w-16">03</span>
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">Built for Speed</h3>
                                    <p className="text-stone-600 font-medium max-w-xl">Retail moves incredibly fast. The software running it needs to move even faster. We engineer for zero-latency interactions.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: IMPACT METRICS (Massive Inline Typography) */}
                    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stone-300">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-12">03 — Scale & Impact</h2>
                        
                        <div className="space-y-12">
                            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-4">
                                <span className="text-5xl md:text-7xl font-black tracking-tighter text-stone-900">10,000+</span>
                                <span className="text-sm font-bold uppercase tracking-widest text-stone-500 pb-2">Active Stores</span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-4">
                                <span className="text-5xl md:text-7xl font-black tracking-tighter text-stone-900">$2.4B</span>
                                <span className="text-sm font-bold uppercase tracking-widest text-stone-500 pb-2">Processed Value</span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200 pb-4">
                                <span className="text-5xl md:text-7xl font-black tracking-tighter text-stone-900">99.99%</span>
                                <span className="text-sm font-bold uppercase tracking-widest text-stone-500 pb-2">Platform Uptime</span>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: THE TEAM (Directory Style, No Cards) */}
                    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stone-300">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-12">04 — Leadership</h2>
                        
                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm">SJ</div>
                                <div>
                                    <h4 className="font-bold text-stone-900">Sarah Jenkins</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Chief Executive Officer</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">DC</div>
                                <div>
                                    <h4 className="font-bold text-stone-900">David Chen</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Chief Technology Officer</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">MR</div>
                                <div>
                                    <h4 className="font-bold text-stone-900">Marcus Reed</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Head of Product</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-stone-300 text-stone-800 flex items-center justify-center font-bold text-sm">ER</div>
                                <div>
                                    <h4 className="font-bold text-stone-900">Elena Rostova</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Head of Design</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6: CTA (Text Heavy) */}
                    <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-stone-300 text-center">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-stone-900 mb-8">
                            Join the ecosystem.
                        </h2>
                        <Link href="/register" className="inline-block px-10 py-5 bg-stone-900 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-sm rounded-full transition-colors shadow-lg">
                            Start Free Trial
                        </Link>
                    </section>

                </main>

                <FooterSection />
            </div>
        </>
    );
}
