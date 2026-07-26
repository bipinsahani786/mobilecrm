import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';

export default function CookiePolicy({ auth }: PageProps) {
    return (
        <>
            <Head title="Cookie Policy - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900 flex flex-col">
                
                <Navbar auth={auth} />

                <main className="relative z-10 flex-1 w-full pb-24">
                    {/* Header Section */}
                    <div className="bg-emerald-900 text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -ml-40 -mt-40 pointer-events-none" />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Legal Documentation</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                Cookie Policy
                            </h1>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                                Effective Date: July 26, 2026
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="prose prose-stone max-w-none space-y-12 text-stone-600 font-medium">
                            <section>
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">1. What Are Cookies?</h2>
                                <p className="leading-relaxed mb-4">
                                    Cookies are small text files containing a string of characters that can be placed on your computer or mobile device when you visit a website. They uniquely identify your browser or device to help websites run efficiently and provide analytics insights.
                                </p>
                                <p className="leading-relaxed">
                                    Cookies set by us are called first-party cookies. Cookies set by parties other than us are called third-party cookies (which enable third-party features or functions like analytics, advertising, and interactive elements).
                                </p>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">2. How We Use Cookies</h2>
                                <p className="leading-relaxed mb-4">
                                    We use cookies for several reasons, detailed below:
                                </p>
                                <ul className="list-disc pl-5 space-y-4">
                                    <li>
                                        <strong>Essential/Required Cookies:</strong> These cookies are strictly necessary to deliver the services available through our platform and to use some of its core features, such as accessing secure areas, handling authentication tokens, and maintaining session states.
                                    </li>
                                    <li>
                                        <strong>Preferences/Functional Cookies:</strong> These allow our platform to remember choices you make (such as database filter presets, dashboard layouts, language preferences, or dark-mode settings) to provide a more personalized experience.
                                    </li>
                                    <li>
                                        <strong>Analytics/Performance Cookies:</strong> These cookies collect aggregate information on how our services are used (e.g., page visit statistics, click-through rates, load latency metrics) to help us refine and optimize platform performance.
                                    </li>
                                </ul>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">3. Specific Cookies We Use</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b border-stone-300 text-stone-850 font-bold">
                                                <th className="py-3 px-2">Cookie Name</th>
                                                <th className="py-3 px-2">Type</th>
                                                <th className="py-3 px-2">Purpose</th>
                                                <th className="py-3 px-2">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-200">
                                            <tr>
                                                <td className="py-3 px-2 font-mono">mobilecrm_session</td>
                                                <td className="py-3 px-2">Essential</td>
                                                <td className="py-3 px-2">Maintains encrypted user authentication session.</td>
                                                <td className="py-3 px-2">Session</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-2 font-mono">XSRF-TOKEN</td>
                                                <td className="py-3 px-2">Essential</td>
                                                <td className="py-3 px-2">Protects forms against cross-site request forgery attacks.</td>
                                                <td className="py-3 px-2">Session</td>
                                            </tr>
                                            <tr>
                                                <td className="py-3 px-2 font-mono">_ga</td>
                                                <td className="py-3 px-2">Analytics</td>
                                                <td className="py-3 px-2">Distinguishes users and tracks overall dashboard engagement.</td>
                                                <td className="py-3 px-2">2 Years</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">4. Controlling Cookies</h2>
                                <p className="leading-relaxed mb-4">
                                    You have the right to decide whether to accept or reject cookies. You can exercise your cookie choices through these methods:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Browser Settings:</strong> You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject essential cookies, you may still use our public website, but some platform features (such as secure merchant login) will fail to operate correctly.</li>
                                    <li><strong>Cookie Consent Banner:</strong> When you first visit our site, you can manage preferences through our interactive cookie banner.</li>
                                </ul>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">5. More Information</h2>
                                <p className="leading-relaxed">
                                    If you have questions about our use of cookies or other tracking technologies, please contact our privacy compliance team via our contact form.
                                </p>
                            </section>
                        </div>
                    </div>
                </main>

                <FooterSection />
            </div>
        </>
    );
}
