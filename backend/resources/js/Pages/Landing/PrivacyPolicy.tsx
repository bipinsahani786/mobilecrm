import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';

export default function PrivacyPolicy({ auth }: PageProps) {
    return (
        <>
            <Head title="Privacy Policy - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900 flex flex-col">
                
                <Navbar auth={auth} />

                <main className="relative z-10 flex-1 w-full pb-24">
                    {/* Header Section */}
                    <div className="bg-emerald-900 text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -ml-40 -mt-40 pointer-events-none" />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Legal Documentation</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                Privacy Policy
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
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">1. Introduction</h2>
                                <p className="leading-relaxed mb-4">
                                    Welcome to MobileCRM ("we," "our," or "us"). We respect your privacy and are committed to protecting the personal data of our users, merchants, and website visitors. This Privacy Policy explains how we collect, use, store, and share information when you use our platform, mobile application, and services.
                                </p>
                                <p className="leading-relaxed">
                                    By accessing or using our services, you agree to the collection and use of your information in accordance with this policy. If you do not agree with these terms, please do not use our platform.
                                </p>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">2. Information We Collect</h2>
                                <div className="space-y-4">
                                    <p className="leading-relaxed">
                                        We collect several types of information to provide, run, and improve our services to merchants:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Account Information:</strong> When you register an account, we collect your name, email address, telephone number, business name, and login credentials.</li>
                                        <li><strong>Merchant Data:</strong> To operate our ledger, billing, and payroll services, you may upload data relating to your transactions, party ledgers, billing history, and employees.</li>
                                        <li><strong>Billing & Payment Information:</strong> For paid subscriptions, we process billing addresses and bank/credit details via secure PCI-compliant third-party payment processors.</li>
                                        <li><strong>Usage & Device Data:</strong> We automatically collect information about how you access and interact with our services, including IP addresses, browser types, operating systems, and platform analytics.</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">3. How We Use Your Information</h2>
                                <p className="leading-relaxed mb-4">
                                    We use the collected data for various purposes necessary to deliver our business operations:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>To provision, maintain, and secure your account and the MobileCRM platform.</li>
                                    <li>To process payroll payments, party ledger entries, and generate GST-compliant invoices.</li>
                                    <li>To communicate updates, security alerts, customer support responses, and administrative messages.</li>
                                    <li>To compile aggregated, non-identifiable usage statistics for product improvement and feature development.</li>
                                </ul>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">4. Sharing and Disclosure</h2>
                                <p className="leading-relaxed mb-4">
                                    We do not sell your personal or merchant data. We only share information in the following situations:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>Third-Party Vendors:</strong> With trusted service providers who help us host our infrastructure, process payments, and run database analytics under strict confidentiality contracts.</li>
                                    <li><strong>Legal Requirements:</strong> If required to do so by applicable law, regulation, or court order to protect the safety, rights, or integrity of our users and services.</li>
                                    <li><strong>Business Transfers:</strong> In connection with any merger, sale of company assets, or financing transaction, subject to standard non-disclosure terms.</li>
                                </ul>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">5. Data Security</h2>
                                <p className="leading-relaxed">
                                    The security of your data is of paramount importance. We utilize industry-standard TLS encryption for all data in transit, secure AES-256 databases for data at rest, and regular server firewall reviews to protect against unauthorized access. However, no database or transmission channel can be guaranteed to be 100% secure.
                                </p>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">6. Your Rights and Choices</h2>
                                <p className="leading-relaxed">
                                    You have the right to access, rectify, update, or delete your account credentials and business profiles. You can configure your preferences directly inside the dashboard or request data deletion by contacting us. We will retain and use your information only as necessary to comply with our legal, accounting, and audit obligations.
                                </p>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">7. Changes to This Policy</h2>
                                <p className="leading-relaxed">
                                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Effective Date" at the top. You are encouraged to review this page periodically to stay informed about how we protect your data.
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
