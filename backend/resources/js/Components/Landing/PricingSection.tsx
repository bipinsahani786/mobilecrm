import { Link } from '@inertiajs/react';
import { useIntersectionObserver } from './useIntersectionObserver';

export default function PricingSection() {
    const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

    return (
        <section id="pricing" className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <h2 className="text-4xl md:text-7xl font-black text-stone-900 tracking-tighter uppercase mb-6">
                        One Price. <br/> Infinite Scale.
                    </h2>
                    <p className="text-xl text-stone-500 font-medium max-w-2xl mx-auto">
                        We don't punish you for growing. Access every premium feature for a single, flat monthly rate.
                    </p>
                </div>

                <div 
                    ref={ref}
                    className={`max-w-5xl mx-auto transition-all duration-1000 transform ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                    }`}
                >
                    <div className="bg-[#F7F4EB] rounded-[3rem] p-6 md:p-12 border border-[#D4CBB3] shadow-2xl relative overflow-hidden group">
                        {/* Interactive Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity duration-1000"></div>
                        
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10 p-4 md:p-0">
                            
                            {/* Left Side: Pricing details */}
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-block px-4 py-1 bg-emerald-800 text-white text-xs font-black uppercase tracking-widest rounded-full mb-6">
                                    All-In-One Plan
                                </div>
                                <div className="flex items-end justify-center lg:justify-start gap-2 mb-6">
                                    <span className="text-6xl md:text-8xl font-black text-stone-900 tracking-tighter">₹2,499</span>
                                    <span className="text-2xl text-stone-500 font-medium mb-3">/mo</span>
                                </div>
                                <p className="text-stone-600 font-medium text-lg">
                                    Everything you need to manage ledgers, payroll, and GST billing. No hidden limits.
                                </p>
                            </div>
                            
                            {/* Divider on desktop */}
                            <div className="hidden lg:block w-px h-48 bg-[#D4CBB3]"></div>
                            <div className="lg:hidden w-full h-px bg-[#D4CBB3]"></div>
                            
                            {/* Right Side: Features and CTA */}
                            <div className="flex-1 w-full">
                                <ul className="space-y-4 mb-10">
                                    {['Unlimited Party Ledgers', 'Automated Payroll Processing', 'One-Click GST Invoicing', 'Real-time Analytics Dashboard'].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-4 text-stone-800 font-bold md:text-lg">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={route('register')} className="block w-full py-5 text-center font-black text-white bg-stone-900 hover:bg-orange-600 rounded-2xl transition-colors uppercase tracking-widest text-sm shadow-xl">
                                    Start 14-Day Free Trial
                                </Link>
                            </div>
                            
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
