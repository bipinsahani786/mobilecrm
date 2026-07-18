import { useIntersectionObserver } from './useIntersectionObserver';

export default function StatsSection() {
    const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

    return (
        <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-7xl font-black text-stone-900 tracking-tighter uppercase mb-6 leading-[0.9]">
                        Trusted By <br className="hidden md:block" /> Thousands.
                    </h2>
                    <p className="text-xl text-stone-500 font-medium max-w-2xl mx-auto">
                        We're powering the next generation of modern retail businesses across the country.
                    </p>
                </div>

                <div 
                    ref={ref}
                    className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 transform ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                    }`}
                >
                    {[
                        { label: 'Active Users', value: '10,000+' },
                        { label: 'Invoices Generated', value: '5M+' },
                        { label: 'Uptime', value: '99.99%' },
                        { label: 'Customer Support', value: '24/7' }
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-8 rounded-[2rem] border border-[#D4CBB3] bg-white/40 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-500">
                            <div className="text-4xl md:text-5xl font-black text-emerald-700 tracking-tighter mb-2">{stat.value}</div>
                            <div className="text-sm font-black text-stone-900 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
