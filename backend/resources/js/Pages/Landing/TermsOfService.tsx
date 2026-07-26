import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';

export default function TermsOfService({ auth }: PageProps) {
    return (
        <>
            <Head title="Terms of Service - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900 flex flex-col">
                
                <Navbar auth={auth} />

                <main className="relative z-10 flex-1 w-full pb-24">
                    {/* Header Section */}
                    <div className="bg-emerald-900 text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -ml-40 -mt-40 pointer-events-none" />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Legal Documentation</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                Terms of Service
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
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">1. Agreement to Terms</h2>
                                <p className="leading-relaxed mb-4">
                                    By registering for an account or using the MobileCRM web and mobile applications (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). The Service is operated by MobileCRM, Inc., a company powered by Zytrixon Tech.
                                </p>
                                <p className="leading-relaxed">
                                    If you are entering into this agreement on behalf of a company, organization, or another legal entity, you represent that you have the authority to bind such entity to these Terms. If you do not agree to these Terms, you must not access or use the Service.
                                </p>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">2. Account Registration and Security</h2>
                                <p className="leading-relaxed mb-4">
                                    To use certain features of the Service, you must register for an account by providing accurate, complete, and current information. You are responsible for:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 mb-4">
                                    <li>Maintaining the confidentiality of your account credentials, including passwords and authentication tokens.</li>
                                    <li>All activities that occur under your account or API key.</li>
                                    <li>Immediately notifying us of any unauthorized use or breach of account security.</li>
                                </ul>
                                <p className="leading-relaxed">
                                    We reserve the right to suspend or terminate accounts that provide false details or violate security policies.
                                </p>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">3. Fees, Subscriptions, and Billing</h2>
                                <p className="leading-relaxed mb-4">
                                    MobileCRM offers paid subscription tiers. By signing up for a paid tier:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>You agree to pay all monthly, annual, or flat fees specified for the plan you select.</li>
                                    <li>All billing transactions are processed automatically using secure processors. You must keep your payment info up to date.</li>
                                    <li>Subscriptions renew automatically at the end of each billing cycle unless you cancel them via the dashboard before the renewal date.</li>
                                    <li>Unless explicitly stated otherwise, all payments are non-refundable. We do not provide prorated refunds for partial months of service.</li>
                                </ul>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">4. Acceptable Use and Content Rules</h2>
                                <p className="leading-relaxed mb-4">
                                    You represent that you will use the Service strictly for lawful business purposes. You agree NOT to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Upload, transmit, or process fraudulent invoices, fake billing ledgers, or spam records.</li>
                                    <li>Attempt to reverse-engineer, disrupt, or bypass the platform's API boundaries, rate limit filters, or data storage nodes.</li>
                                    <li>Use automated bots or scripts to query, scrape, or extract platform data without our prior written consent.</li>
                                    <li>Violate the privacy, intellectual property, or legal rights of any third parties.</li>
                                </ul>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">5. Limitation of Liability</h2>
                                <p className="leading-relaxed">
                                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, MOBILECRM, INC. AND ZYTRIXON TECH SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA CORRUPTION, REVENUE DECREASES, OR CLIENT RETENTION LOSSES ARISING FROM OR RELATING TO YOUR USE OR INABILITY TO USE THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                                </p>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">6. Termination</h2>
                                <p className="leading-relaxed">
                                    You can terminate your account at any time by requesting deletion or canceling your subscriptions in the dashboard settings. We also reserve the right to suspend or terminate your access immediately if you violate these Terms or present a security threat to our systems.
                                </p>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">7. Governing Law and Disputes</h2>
                                <p className="leading-relaxed">
                                    These Terms shall be governed and construed in accordance with the laws of the jurisdiction where our parent company Zytrixon Tech is incorporated, without regard to conflict of law provisions. Any legal action or dispute arising out of these Terms shall be resolved exclusively in the competent courts of that jurisdiction.
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
