import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';

export default function Security({ auth }: PageProps) {
    return (
        <>
            <Head title="Security Practices - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900 flex flex-col">
                
                <Navbar auth={auth} />

                <main className="relative z-10 flex-1 w-full pb-24">
                    {/* Header Section */}
                    <div className="bg-emerald-900 text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -ml-40 -mt-40 pointer-events-none" />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Security & Operations</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                Platform Security
                            </h1>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                                Standards & Best Practices
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="prose prose-stone max-w-none space-y-12 text-stone-600 font-medium">
                            <section>
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">1. Security Architecture</h2>
                                <p className="leading-relaxed mb-4">
                                    At MobileCRM, we prioritize the protection of your business ledger and payroll information. Our platform is engineered using modern, robust paradigms to minimize vulnerability risk and maintain zero downtime:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>All servers reside inside isolated VPC (Virtual Private Cloud) networks, utilizing restricted security groups.</li>
                                    <li>Public requests undergo rigorous sanitization and filter protection through standard web application firewalls (WAF).</li>
                                    <li>Systems are continually patched, monitored, and audited to meet SOC-2 compliance standards.</li>
                                </ul>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">2. Encryption Standards</h2>
                                <div className="space-y-4">
                                    <p className="leading-relaxed">
                                        We ensure that your sensitive credentials, GST records, and transaction ledgers are fully encrypted throughout their lifecycle:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Data in Transit:</strong> All platform traffic is strictly routed over HTTPS, utilizing TLS 1.3 encryption protocols. Non-secure HTTP requests are dropped automatically.</li>
                                        <li><strong>Data at Rest:</strong> Core merchant databases, access logs, and user records are encrypted using AES-256 standard keys, managed via secure HSM infrastructure.</li>
                                        <li><strong>Password Hashing:</strong> Passwords are never stored as plaintext. We utilize bcrypt algorithms with adaptive work factors to protect accounts from brute-force offline cracking.</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">3. Infrastructure and Backup Reliability</h2>
                                <p className="leading-relaxed mb-4">
                                    We protect against data loss and physical outages using secure, redundant backup policies:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Continuous real-time database replication to ensure data is preserved during hardware faults.</li>
                                    <li>Automated daily encrypted backups retained across geographically isolated cloud storage vaults.</li>
                                    <li>Regularly tested recovery protocols to ensure swift disaster recovery (RTO under 1 hour).</li>
                                </ul>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">4. Application Controls</h2>
                                <p className="leading-relaxed mb-4">
                                    We implement standard authentication and authorization controls within the MobileCRM software:
                                </p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Multi-factor authentication (MFA) availability for all merchant accounts.</li>
                                    <li>Role-based access controls (RBAC) to ensure employees only view ledgers and payroll components authorized by managers.</li>
                                    <li>Automated rate-limiting filters to prevent API abuse, credential stuffing, and scraping attempts.</li>
                                    <li>CSRF (Cross-Site Request Forgery) protection on every form submission and transaction call.</li>
                                </ul>
                            </section>

                            <section className="pt-8 border-t border-stone-300">
                                <h2 className="text-xl font-bold text-stone-900 mb-4 uppercase tracking-wider text-xs text-emerald-800">5. Responsible Disclosure Program</h2>
                                <p className="leading-relaxed">
                                    We welcome reports from independent security researchers. If you identify a vulnerability in our service, please contact us immediately through our security compliance address. We ask that you provide a detailed description of the vulnerability, reproduction steps, and allow our team a reasonable timeframe to address the issue before public disclosure.
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
