import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';

export default function Contact({ auth }: PageProps) {
    return (
        <>
            <Head title="Contact Us - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900 flex flex-col">
                
                <Navbar auth={auth} />

                <main className="relative z-10 flex-1 w-full pb-24">
                    
                    {/* Dedicated Compact Hero Section */}
                    <div className="bg-emerald-900 text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -mr-40 -mt-40 pointer-events-none"></div>
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Support & Sales</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                Get in Touch.
                            </h1>
                            <p className="text-sm text-stone-400 font-medium max-w-md mx-auto">
                                Our dedicated team is ready to assist you with any inquiries, from enterprise sales to technical support.
                            </p>
                        </div>
                    </div>

                    {/* Small UI Form Card overlapping the hero */}
                    <div className="max-w-[28rem] mx-auto px-4 relative z-20 -mt-12">
                        <div className="bg-white rounded-2xl shadow-2xl shadow-stone-900/10 border border-stone-100 p-6 md:p-8">
                            
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1.5 ml-1">First Name</label>
                                        <input type="text" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-stone-800 font-medium" placeholder="Jane" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Last Name</label>
                                        <input type="text" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-stone-800 font-medium" placeholder="Doe" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Email Address</label>
                                    <input type="email" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-stone-800 font-medium" placeholder="jane@example.com" />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Subject</label>
                                    <select className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-stone-800 font-medium cursor-pointer">
                                        <option>General Inquiry</option>
                                        <option>Technical Support</option>
                                        <option>Sales & Demo</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1.5 ml-1">Message</label>
                                    <textarea rows={4} className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-stone-800 font-medium resize-none" placeholder="How can we help?"></textarea>
                                </div>
                                
                                <button type="button" className="w-full bg-stone-900 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg transition-all shadow-md text-xs uppercase tracking-wider mt-2">
                                    Send Message
                                </button>
                            </form>

                        </div>

                        {/* Direct contact info below the form */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-stone-500 font-medium mb-1">Prefer to email us directly?</p>
                            <a href="mailto:hello@mobilecrm.com" className="text-sm font-bold text-stone-800 hover:text-emerald-600 transition-colors">hello@mobilecrm.com</a>
                        </div>
                    </div>

                </main>

                <FooterSection />
            </div>
        </>
    );
}
