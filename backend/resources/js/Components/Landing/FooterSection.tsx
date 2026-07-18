import ApplicationLogo from '@/Components/ApplicationLogo';

export default function FooterSection() {
    return (
        <footer className="relative z-50 bg-white text-stone-600 pt-20 pb-10 border-t border-[#D4CBB3]/50">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Top Section: Brand & Newsletter */}
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
                    
                    <div className="w-full lg:w-auto">
                        <h4 className="font-bold text-stone-800 uppercase tracking-widest text-xs mb-4">Subscribe to our newsletter</h4>
                        <div className="flex gap-2 w-full max-w-md">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                className="bg-[#F7F4EB] border-none rounded-xl px-4 py-3 flex-1 text-sm text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                            <button className="bg-emerald-800 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all text-xs uppercase tracking-wider shadow-md shadow-stone-200">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Link Columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-16">
                    <div>
                        <h4 className="font-bold text-stone-900 uppercase tracking-widest text-xs mb-6">Product</h4>
                        <ul className="space-y-4">
                            {['Features', 'Integrations', 'Pricing', 'Changelog', 'Docs'].map(link => (
                                <li key={link}><a href="#" className="text-sm font-medium text-stone-500 hover:text-orange-600 transition-colors">{link}</a></li>
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
                            {['About Us', 'Careers', 'Contact', 'Partners'].map(link => (
                                <li key={link}><a href="#" className="text-sm font-medium text-stone-500 hover:text-orange-600 transition-colors">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-stone-900 uppercase tracking-widest text-xs mb-6">Legal</h4>
                        <ul className="space-y-4">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(link => (
                                <li key={link}><a href="#" className="text-sm font-medium text-stone-500 hover:text-orange-600 transition-colors">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section: Copyright & Socials */}
                <div className="pt-8 border-t border-[#D4CBB3]/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">
                            &copy; {new Date().getFullYear()} MobileCRM, Inc. All rights reserved.
                        </p>
                        <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            All systems operational
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-5">
                        {['Twitter', 'GitHub', 'LinkedIn', 'YouTube'].map(social => (
                            <a key={social} href="#" className="text-stone-400 hover:text-orange-600 transition-colors">
                                <span className="sr-only">{social}</span>
                                <div className="w-4 h-4 bg-current rounded-sm"></div>
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
}
