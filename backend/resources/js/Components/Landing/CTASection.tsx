import { Link } from '@inertiajs/react';

export default function CTASection() {
    return (
        <section className="relative overflow-hidden bg-stone-950 py-16 md:py-48 flex items-center justify-center min-h-[70vh]">
            {/* Immersive Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
            
            {/* Massive Watermark Typography */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 pointer-events-none overflow-hidden select-none">
                <h1 className="text-[20vw] font-black text-transparent uppercase leading-[0.8] whitespace-nowrap" style={{ WebkitTextStroke: '3px #10b981' }}>
                    READY TO
                </h1>
                <h1 className="text-[20vw] font-black text-transparent uppercase leading-[0.8] whitespace-nowrap" style={{ WebkitTextStroke: '3px #f97316' }}>
                    SCALE UP
                </h1>
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8">
                    Stop Managing. <br className="hidden md:block"/> Start Growing.
                </h2>
                <p className="text-xl text-stone-400 font-medium mb-12 max-w-2xl mx-auto">
                    Join the thousands of retail leaders who have transformed their operations with MobileCRM. Setup takes less than 5 minutes.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        href={route('register')}
                        className="px-10 py-5 bg-orange-500 hover:bg-emerald-500 text-white font-black rounded-full shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all duration-500 hover:scale-105 uppercase tracking-widest text-sm"
                    >
                        Get Started Free
                    </Link>
                </div>
            </div>
        </section>
    );
}
