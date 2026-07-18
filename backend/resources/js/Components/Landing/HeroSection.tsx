import { Link } from '@inertiajs/react';
import { useIntersectionObserver } from './useIntersectionObserver';

export default function HeroSection() {
    const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

    return (
        <main
            className="pt-32 pb-16 lg:pt-28 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden flex items-center min-h-[60vh] lg:min-h-[75vh]"
        >
        <div
            ref={ref}
            className={`max-w-2xl space-y-8 transition-all duration-1000 transform text-center lg:text-left mx-auto lg:mx-0 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                }`}
        >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-stone-900 tracking-tight leading-[1.05] uppercase pb-2">
                Manage your <br className="hidden lg:block" />
                business <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-emerald-700">intelligently.</span>
            </h1>

            <p className="text-lg md:text-xl text-stone-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Track business collections, custom billing invoices, party ledger payments, and customer accounts inside a clean, modern ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6">
                <Link
                    href={route('register')}
                    className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 rounded-xl transition-all shadow-lg shadow-orange-200/50 transform hover:-translate-y-1 text-center"
                >
                    Start Free Trial
                </Link>
                <a
                    href="#features"
                    className="w-full sm:w-auto px-8 py-4 text-base font-bold text-stone-700 bg-white/80 backdrop-blur-sm hover:bg-white rounded-xl transition-all border border-[#D4CBB3] shadow-sm text-center uppercase tracking-wider text-xs"
                >
                    Learn More
                </a>
            </div>
        </div>
    </main>
    );
}
