import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { User } from '@/types';

export default function Navbar({ auth }: { auth: { user: User } }) {
    const [scrolled, setScrolled] = useState(false);
    const [isDarkHeader, setIsDarkHeader] = useState(false);

    useEffect(() => {
        // Check if we are on a page that has a dark hero header at the top
        const path = window.location.pathname;
        if (path === '/about' || path === '/contact') {
            setIsDarkHeader(true);
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

    // Determine text colors based on scroll state and header type
    const isDarkTextNeeded = scrolled || !isDarkHeader;
    
    const logoTextColor = isDarkTextNeeded ? 'text-stone-800' : 'text-white';
    const linkTextColor = isDarkTextNeeded ? 'text-stone-500' : 'text-emerald-100/80 hover:text-white';
    const actionTextColor = isDarkTextNeeded ? 'text-stone-600' : 'text-emerald-100/80 hover:text-white';
    const borderColor = scrolled ? 'border-stone-200' : (isDarkHeader ? 'border-emerald-800/40' : 'border-[#D4CBB3]/40');

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-2`}>
            <nav className={`mx-auto transition-all duration-500 flex items-center justify-between px-6 ${scrolled
                    ? `max-w-4xl bg-white/90 backdrop-blur-xl border-[0.5px] ${borderColor} shadow-xl shadow-stone-200/20 py-2.5 rounded-[2rem]`
                    : `max-w-7xl bg-transparent py-4 border-b-[0.5px] ${borderColor}`
                }`}>
                <Link href="/" className="flex items-center gap-3">
                    <div className="p-1 rounded-2xl bg-white shadow-sm border-[0.5px] border-stone-200 hover:scale-105 active:scale-95 transition-transform duration-300">
                        <div className="bg-[#F7F4EB] rounded-[12px] p-2 flex items-center justify-center w-10 h-10">
                            <span className="font-black text-lg text-emerald-800">
                                M
                            </span>
                        </div>
                    </div>
                    <span className={`font-black text-base tracking-widest uppercase transition-colors ${logoTextColor} hover:text-orange-600`}>MobileCRM</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
                    <Link href="/about" className={`${linkTextColor} ${!isDarkTextNeeded ? '' : 'hover:text-orange-600'} active:scale-95 transition-all`}>About</Link>
                    <Link href="/blog" className={`${linkTextColor} ${!isDarkTextNeeded ? '' : 'hover:text-orange-600'} active:scale-95 transition-all`}>Blog</Link>
                    <Link href="/contact" className={`${linkTextColor} ${!isDarkTextNeeded ? '' : 'hover:text-orange-600'} active:scale-95 transition-all`}>Contact</Link>
                </div>

                <div className="flex gap-4">
                    {auth.user ? (
                        <a
                            href={`${frontendUrl}/dashboard`}
                            className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider ${actionTextColor} ${!isDarkTextNeeded ? '' : 'hover:text-orange-600'} active:scale-95 transition-all`}
                        >
                            Dashboard
                        </a>
                    ) : (
                        <>
                            <a
                                href={`${frontendUrl}/login`}
                                className={`hidden sm:block px-6 py-2.5 text-xs font-bold uppercase tracking-wider ${actionTextColor} ${!isDarkTextNeeded ? '' : 'hover:text-orange-600'} active:scale-95 transition-all`}
                            >
                                Log in
                            </a>
                            <a
                                href={`${frontendUrl}/partner/register`}
                                className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-800 hover:bg-orange-600 active:scale-95 rounded-xl transition-all ${scrolled ? 'shadow-md shadow-stone-200' : 'shadow-none border border-emerald-700/50'}`}
                            >
                                Partner Register
                            </a>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
}
