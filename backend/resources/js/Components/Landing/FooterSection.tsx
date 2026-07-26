import { SVGProps } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

const socials = [
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/share/1C1nRyzVrA/',
        colorClass: 'text-[#1877F2]',
        icon: (props: SVGProps<SVGSVGElement>) => (
            <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/zytrixontech_com?igsh=OHdydzVtN3VwYmJj',
        colorClass: 'text-[#E1306C]',
        icon: (props: SVGProps<SVGSVGElement>) => (
            <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
        ),
    },
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/company/zytrixon/posts/',
        colorClass: 'text-[#0A66C2]',
        icon: (props: SVGProps<SVGSVGElement>) => (
            <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
            </svg>
        ),
    },
];

export default function FooterSection() {
    return (
        <footer className="relative z-50 bg-white text-stone-600 pt-20 pb-10 border-t border-[#D4CBB3]/50">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top Section: Brand & Socials */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 pb-16 border-b border-[#D4CBB3]/50">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-1 rounded-xl bg-white shadow-sm border border-[#D4CBB3]">
                                <div className="bg-[#F7F4EB] rounded-[12px] p-2 flex items-center justify-center w-10 h-10">
                                    <span className="font-black text-lg text-emerald-800">
                                        M
                                    </span>
                                </div>
                            </div>
                            <span className="font-black text-base tracking-widest text-stone-800 uppercase">
                                MobileCRM
                            </span>
                        </div>
                        <p className="text-stone-500 font-medium max-w-sm">
                            The operating system for modern retail. Manage leads, payroll, and billing all in one place.
                        </p>
                    </div>

                    <div className="flex flex-col items-center lg:items-end gap-3 lg:self-center">
                        <span className="font-bold text-stone-800 uppercase tracking-widest text-[10px]">
                            Get connected
                        </span>
                        <div className="flex items-center gap-6">
                            {socials.map(social => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    className={`${social.colorClass} hover:brightness-110 hover:opacity-80 hover:scale-110 transform transition-all duration-300 ease-in-out`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="sr-only">{social.name}</span>
                                    <social.icon className="w-7 h-7" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Middle Section: Link Columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-16">
                    <div>
                        <h4 className="font-bold text-stone-900 uppercase tracking-widest text-xs mb-6">Product</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Features', route: 'features' },
                                { name: 'Integrations', route: 'integrations' },
                                { name: 'Pricing', route: 'pricing' },
                                { name: 'Changelog', route: 'changelog' },
                                { name: 'Docs', route: 'docs' },
                            ].map(link => (
                                <li key={link.name}>
                                    <Link href={route(link.route)} className="text-sm font-medium text-stone-500 hover:text-orange-650 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-stone-900 uppercase tracking-widest text-xs mb-6">Solutions</h4>
                        <ul className="space-y-4">
                            {['Retailers', 'Wholesale', 'Small Business', 'Enterprise'].map(link => (
                                <li key={link}><a href="#" className="text-sm font-medium text-stone-500 hover:text-orange-600 transition-colors">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-stone-900 uppercase tracking-widest text-xs mb-6">Resources</h4>
                        <ul className="space-y-4">
                            {['Blog', 'Help Center', 'Community', 'Webinars', 'Status'].map(link => (
                                <li key={link}><a href="#" className="text-sm font-medium text-stone-500 hover:text-orange-600 transition-colors">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-stone-900 uppercase tracking-widest text-xs mb-6">Company</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'About Us', route: 'about' },
                                { name: 'Contact', route: 'contact' },
                            ].map(link => (
                                <li key={link.name}>
                                    <Link href={route(link.route)} className="text-sm font-medium text-stone-500 hover:text-orange-650 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-stone-900 uppercase tracking-widest text-xs mb-6">Legal</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Privacy Policy', route: 'privacy-policy' },
                                { name: 'Terms of Service', route: 'terms-of-service' },
                                { name: 'Cookie Policy', route: 'cookie-policy' },
                                { name: 'Security', route: 'security' },
                            ].map(link => (
                                <li key={link.name}>
                                    <Link href={route(link.route)} className="text-sm font-medium text-stone-500 hover:text-orange-650 transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section: Copyright */}
                <div className="pt-8 border-t border-[#D4CBB3]/50 flex justify-center">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center">
                        <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">
                            &copy; {new Date().getFullYear()} MobileCRM, Inc. All rights reserved.
                        </p>
                        <span className="hidden md:inline text-stone-300 text-[10px]">|</span>
                        <div className="text-stone-400 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-1">
                            <span>Powered by</span>
                            <a
                                href="https://zytrixontech.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-800 hover:text-orange-650 transition-colors font-extrabold normal-case tracking-normal text-xs px-1"
                            >
                                Zytrixon Tech
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
}
