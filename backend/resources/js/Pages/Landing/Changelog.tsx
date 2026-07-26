import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Landing/Navbar';
import FooterSection from '@/Components/Landing/FooterSection';
import { PageProps } from '@/types';

export default function Changelog({ auth }: PageProps) {
    const logs = [
        {
            version: "v2.1.0",
            date: "July 2026",
            title: "Advanced Invoicing Engine",
            changes: [
                "Added support for custom IGST/SGST itemized billing rates.",
                "Optimized PDF invoice rendering load times under 200ms.",
                "Integrated direct WhatsApp messaging capabilities for dispatching invoice links."
            ]
        },
        {
            version: "v2.0.0",
            date: "June 2026",
            title: "Staff Payroll & Allowances Module",
            changes: [
                "Released full payroll checks generator interface in merchant dashboard.",
                "Support attendance, advanced wages, and static payout records.",
                "Added granular Role-Based Access Controls (RBAC) to delegate payroll to managers."
            ]
        },
        {
            version: "v1.5.0",
            date: "April 2026",
            title: "UPI Dynamic QR Invoices",
            changes: [
                "Automatic UPI QR generation on printable invoice layouts.",
                "Instant status check webhook callbacks for payment settlement states."
            ]
        }
    ];

    return (
        <>
            <Head title="Changelog - MobileCRM" />
            
            <div className="min-h-screen bg-[#F7F4EB] text-stone-800 font-sans relative overflow-x-hidden selection:bg-orange-200 selection:text-stone-900 flex flex-col">
                
                <Navbar auth={auth} />

                <main className="relative z-10 flex-1 w-full pb-24">
                    {/* Header Section */}
                    <div className="bg-emerald-900 text-white pt-36 pb-20 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-orange-500/10 rounded-full blur-[80px] -ml-40 -mt-40 pointer-events-none" />
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 block">Product Iterations</span>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                                Platform Changelog
                            </h1>
                            <p className="text-sm text-stone-400 font-medium max-w-md mx-auto">
                                Follow our latest system additions, security updates, and performance improvements.
                            </p>
                        </div>
                    </div>

                    {/* Timeline Logs */}
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        <div className="space-y-16 border-l-2 border-[#D4CBB3] pl-6 md:pl-12 ml-4">
                            {logs.map((log, i) => (
                                <div key={i} className="relative space-y-4">
                                    {/* Icon Indicator */}
                                    <span className="absolute -left-[31px] md:-left-[55px] top-1 w-4 h-4 rounded-full bg-emerald-800 border-[3px] border-[#F7F4EB]" />
                                    
                                    <div className="flex flex-wrap items-baseline gap-3">
                                        <span className="text-xl font-black text-stone-900">{log.version}</span>
                                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">{log.date}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-stone-900 tracking-tight">{log.title}</h3>
                                    
                                    <ul className="list-disc pl-5 space-y-2 text-stone-600 font-medium text-sm leading-relaxed max-w-2xl">
                                        {log.changes.map((change, idx) => (
                                            <li key={idx}>{change}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <FooterSection />
            </div>
        </>
    );
}
