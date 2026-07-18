import { useIntersectionObserver } from './useIntersectionObserver';

const features = [
    {
        num: "01",
        title: "Unified Ledger",
        subtitle: "Zero Payment Anxiety",
        desc: "A completely centralized command center for all your party collections, ledgers, and transactions. Experience true peace of mind knowing every penny is tracked in real-time.",
        gradient: "from-orange-500 to-amber-500",
        shadow: "shadow-orange-500/20",
        align: "right"
    },
    {
        num: "02",
        title: "Seamless Payroll",
        subtitle: "Automated Employee Management",
        desc: "Transform how you handle human resources. From attendance tracking to automated bonus calculations, our intelligent payroll system does the heavy lifting for you.",
        gradient: "from-emerald-700 to-teal-600",
        shadow: "shadow-emerald-500/20",
        align: "left"
    },
    {
        num: "03",
        title: "Live Analytics",
        subtitle: "Data-Driven Decisions",
        desc: "Stop guessing. Start knowing. Access beautiful, interactive charts that give you instant, actionable insights into your business performance at a single glance.",
        gradient: "from-stone-500 to-stone-400",
        shadow: "shadow-stone-500/20",
        align: "right"
    },
    {
        num: "04",
        title: "GST Ready",
        subtitle: "Compliance Made Beautiful",
        desc: "Say goodbye to tax season nightmares. Generate mathematically perfect, fully compliant GST invoices with one click. We make government compliance look good.",
        gradient: "from-yellow-600 to-orange-500",
        shadow: "shadow-yellow-500/20",
        align: "left"
    }
];

export default function FeaturesSection() {
    const { ref: headerRef, isVisible: isHeaderVisible } = useIntersectionObserver({ threshold: 0.1 });

    return (
        <section id="features" className="py-16 relative z-20">
            
            {/* Top Area: Logo Landing Zone & Massive Typography */}
            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 mb-20 lg:mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[20vh] lg:min-h-[40vh]">
                    {/* The logo lands in the top left here on desktop */}
                    <div className="hidden lg:block lg:col-span-4 xl:col-span-5 h-full"></div>
                    
                    {/* Massive Header on the right */}
                    <div 
                        ref={headerRef}
                        className={`lg:col-span-8 xl:col-span-7 transition-all duration-1000 transform text-center lg:text-left ${
                            isHeaderVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                        }`}
                    >
                        <h2 className="text-5xl sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6rem] font-black text-stone-900 tracking-tighter leading-[0.9] uppercase mix-blend-multiply">
                            Powering <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-emerald-600">Next-Gen</span> <br className="hidden lg:block" />
                            Retail.
                        </h2>
                        <p className="mt-6 lg:mt-8 text-lg sm:text-xl lg:text-2xl text-stone-600 font-medium max-w-2xl leading-relaxed mx-auto lg:mx-0">
                            A masterclass in business management. We stripped away the complexity to leave you with pure, unadulterated performance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Area: Full-Width Asymmetrical Features (Awwwards Style) */}
            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 space-y-32 lg:space-y-48 pb-32">
                {features.map((feature, i) => {
                    const { ref, isVisible } = useIntersectionObserver({ threshold: 0.2 });
                    const isRight = feature.align === 'right';

                    return (
                        <div 
                            key={i} 
                            ref={ref}
                            className={`flex flex-col ${isRight ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24 transition-all duration-1000 ease-out transform ${
                                isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95'
                            }`}
                        >
                            {/* Massive Visual Block */}
                            <div className="w-full lg:w-1/2 relative group perspective-1000">
                                {/* Decorative Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 blur-3xl rounded-[4rem] group-hover:opacity-40 transition-opacity duration-700`}></div>
                                
                                {/* Glass Container */}
                                <div className={`relative aspect-square sm:aspect-video lg:aspect-[4/3] rounded-[2rem] sm:rounded-[3rem] bg-white/40 backdrop-blur-2xl border border-white/50 shadow-2xl ${feature.shadow} overflow-hidden flex items-center justify-center transition-transform duration-700 hover:rotate-2 hover:scale-[1.02]`}>
                                    {/* Massive Background Number */}
                                    <span className="absolute -bottom-10 -right-10 text-[15rem] font-black text-stone-900/5 select-none transition-transform duration-700 group-hover:-translate-y-10">
                                        {feature.num}
                                    </span>
                                    
                                    {/* Vibrant Foreground Icon Area */}
                                    <div className={`w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br ${feature.gradient} shadow-2xl flex items-center justify-center transition-transform duration-700 group-hover:scale-110`}>
                                        <span className="text-4xl sm:text-6xl font-black text-white mix-blend-overlay">{feature.num}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Typography Content Block */}
                            <div className="w-full lg:w-1/2 flex flex-col justify-center">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r ${feature.gradient} shadow-lg`}>
                                        Module {feature.num}
                                    </span>
                                    <div className="h-px flex-grow bg-stone-200"></div>
                                </div>
                                
                                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 uppercase tracking-tighter leading-[1.1] mb-4">
                                    {feature.title}
                                </h3>
                                <h4 className="text-xl sm:text-2xl font-bold text-stone-400 uppercase tracking-wide mb-8">
                                    {feature.subtitle}
                                </h4>
                                <p className="text-lg sm:text-xl text-stone-600 font-medium leading-relaxed max-w-xl">
                                    {feature.desc}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            
        </section>
    );
}
