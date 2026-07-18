import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import Navbar from '@/Components/Landing/Navbar';
import HeroSection from '@/Components/Landing/HeroSection';
import FeaturesSection from '@/Components/Landing/FeaturesSection';
import PricingSection from '@/Components/Landing/PricingSection';
import TestimonialsSection from '@/Components/Landing/TestimonialsSection';
import CTASection from '@/Components/Landing/CTASection';
import FooterSection from '@/Components/Landing/FooterSection';
import StatsSection from '@/Components/Landing/StatsSection';
import FAQSection from '@/Components/Landing/FAQSection';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useRef, useEffect } from 'react';

export default function LandingPage({ auth }: PageProps) {
    const logoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ticking = false;
        const updatePosition = () => {
            if (logoRef.current) {
                const scrollY = window.scrollY;

                const maxScroll = 630;
                const progress = Math.min(scrollY / maxScroll, 1);

                const isMobile = window.innerWidth < 1024;

                // Mobile: centered. Desktop: starts right, moves left
                const xPos = isMobile ? 0 : (30 - (progress * 60));
                const initialY = isMobile ? 25 : 20;

                // Squeeze (shrink) during the first half of scroll, then Expand (grow) in the second half
                let baseScale = 1;
                if (progress < 0.5) {
                    // Shrink from 1 to 0.4
                    baseScale = 1 - (progress * 2 * 0.6);
                } else {
                    // Grow from 0.4 to 1.2
                    const p2 = (progress - 0.5) * 2;
                    baseScale = 0.4 + (p2 * 0.8);
                }

                // Mobile adjustment
                const scale = isMobile ? baseScale * 0.8 : baseScale;
                const absoluteY = progress < 1 ? scrollY : maxScroll;

                // Removed rotation, only translating and scaling
                logoRef.current.style.transform = `translateX(calc(-50% + ${xPos}vw)) translateY(calc(${absoluteY}px + ${initialY}vh)) scale(${scale})`;

                // On mobile, keep it as a subtle watermark so it doesn't block text
                logoRef.current.style.opacity = isMobile ? '0.1' : '1';
                logoRef.current.style.zIndex = isMobile ? '0' : '40';
            }
            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updatePosition);
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        updatePosition();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Head title="Welcome to Mobile CRM" />

            {/* Global Container */}
            {/* Added arbitrary Tailwind classes to hide the physical scrollbar while allowing scrolling */}
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 selection:bg-orange-200 selection:text-stone-900 font-sans relative overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {/* ── PLAIN BACKGROUND WITH GEOMETRIC SHAPES ── */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* The parent container provides the plain #F7F4EB solid background */}
                    
                    {/* Minimalist Hollow Shapes */}
                    <div className="absolute top-[15%] left-[10%] w-48 h-48 rounded-full border-[3px] border-orange-500/20" />
                    <div className="absolute top-[40%] right-[15%] w-32 h-32 rotate-45 border-[3px] border-emerald-600/20" />
                    <div className="absolute bottom-[20%] left-[20%] w-64 h-64 rounded-full border-[3px] border-[#D4CBB3] opacity-50 border-dashed animate-[spin_30s_linear_infinite]" />
                    
                    {/* Soft Solid Accent Shapes */}
                    <div className="absolute top-[10%] right-[30%] w-24 h-24 rounded-full bg-emerald-100/50 backdrop-blur-sm" />
                    <div className="absolute bottom-[30%] right-[10%] w-40 h-40 rounded-tl-[3rem] rounded-br-[3rem] bg-orange-100/50 rotate-12 backdrop-blur-sm" />
                    
                    {/* Thin Line Accents */}
                    <div className="absolute top-[20%] right-0 w-32 h-px bg-stone-300" />
                    <div className="absolute bottom-[40%] left-0 w-48 h-px bg-stone-300" />
                </div>

                <Navbar auth={auth} />

                {/* FLOATING LOGO */}
                <div
                    ref={logoRef}
                    className="absolute z-40 pointer-events-none transition-transform duration-75 top-0 left-[50%]"
                    style={{
                        transform: `translateX(calc(-50% + 30vw)) translateY(20vh) rotate(0deg) scale(1)`,
                        opacity: 1,
                    }}
                >
                    <div className="absolute inset-0 bg-white/50 blur-[50px] rounded-full scale-150"></div>
                    <ApplicationLogo
                        className="w-64 h-64 md:w-96 md:h-96 text-emerald-900 drop-shadow-2xl relative"
                    />
                </div>

                <div className="relative z-10">
                    <HeroSection />
                </div>

                <div className="relative z-20">
                    <FeaturesSection />
                    <StatsSection />
                    <TestimonialsSection />
                    <PricingSection />
                    <FAQSection />
                    <CTASection />
                </div>

                <div className="relative z-30">
                    <FooterSection />
                </div>
            </div>
        </>
    );
}
