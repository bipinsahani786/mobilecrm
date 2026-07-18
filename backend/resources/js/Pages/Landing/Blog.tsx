import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';

export default function Blog({ auth }: PageProps) {
    const posts = [
        {
            title: "How to Automate Your Retail Ledgers",
            category: "Guides",
            date: "Jul 12, 2026",
            image: "bg-emerald-800"
        },
        {
            title: "The Future of Mobile CRM in 2027",
            category: "Industry",
            date: "Jul 05, 2026",
            image: "bg-orange-600"
        },
        {
            title: "5 Tips for Faster GST Billing",
            category: "Tips & Tricks",
            date: "Jun 28, 2026",
            image: "bg-stone-800"
        }
    ];

    return (
        <>
            <Head title="Blog - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900">
                
                {/* Minimalist Background Shapes */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full border-[3px] border-emerald-500/10" />
                    <div className="absolute bottom-[20%] right-[5%] w-72 h-72 rounded-full bg-orange-100/50 backdrop-blur-3xl" />
                </div>

                <Navbar auth={auth} />

                <main className="relative z-10 pt-32 pb-24 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="max-w-4xl mb-20 text-center md:text-left">
                        <h1 className="text-5xl md:text-7xl font-black text-stone-900 uppercase tracking-tighter mb-6 leading-[0.9]">
                            The <br className="hidden md:block"/> Insights.
                        </h1>
                        <p className="text-xl md:text-2xl text-stone-600 font-medium leading-relaxed">
                            Thoughts, guides, and news from the team building the operating system for retail.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, i) => (
                            <Link href="#" key={i} className="group bg-white rounded-[2rem] border border-[#D4CBB3] overflow-hidden shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 flex flex-col">
                                <div className={`w-full h-48 ${post.image} opacity-90 group-hover:opacity-100 transition-opacity`} />
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-black text-orange-600 uppercase tracking-widest">{post.category}</span>
                                        <span className="text-xs font-bold text-stone-400">{post.date}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-stone-900 tracking-tight leading-tight mb-4 group-hover:text-emerald-700 transition-colors">
                                        {post.title}
                                    </h3>
                                    <div className="mt-auto pt-6 flex items-center text-sm font-bold text-stone-500 uppercase tracking-widest group-hover:text-orange-600 transition-colors">
                                        Read Article
                                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </main>

                <FooterSection />
            </div>
        </>
    );
}
