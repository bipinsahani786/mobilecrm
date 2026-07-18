import { useState } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

export default function FAQSection() {
    const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            q: "How easy is it to migrate my existing data?",
            a: "Extremely easy. Our dedicated onboarding team will handle the entire migration process from your existing spreadsheets or legacy software at zero additional cost."
        },
        {
            q: "Do I have to pay extra for adding more staff?",
            a: "No. Our pricing is completely flat and transparent. You can add unlimited staff members, cashiers, and managers to your workspace without ever paying a rupee more."
        },
        {
            q: "Is MobileCRM compliant with the latest GST regulations?",
            a: "Yes. Our system automatically updates to reflect the latest GST tax slabs and compliance requirements, ensuring your business is always audit-ready."
        },
        {
            q: "What happens if my internet goes down?",
            a: "Our point-of-sale module includes a robust offline mode. You can continue billing customers without interruption, and the data will automatically sync the moment you're back online."
        }
    ];

    return (
        <section className="py-16 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-7xl font-black text-stone-900 tracking-tighter uppercase mb-6 leading-[0.9]">
                        Common <br className="hidden md:block" /> Questions.
                    </h2>
                </div>

                <div 
                    ref={ref}
                    className={`space-y-4 transition-all duration-1000 transform ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                    }`}
                >
                    {faqs.map((faq, i) => (
                        <div 
                            key={i} 
                            className={`border border-[#D4CBB3] rounded-[2rem] overflow-hidden transition-all duration-500 cursor-pointer bg-white/40 backdrop-blur-sm ${openIndex === i ? 'shadow-xl bg-white' : 'hover:bg-white/80'}`}
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                        >
                            <div className="p-8 flex justify-between items-center">
                                <h3 className={`text-xl font-black tracking-tight transition-colors ${openIndex === i ? 'text-orange-600' : 'text-stone-900'}`}>
                                    {faq.q}
                                </h3>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${openIndex === i ? 'bg-orange-100 text-orange-600 rotate-180' : 'bg-stone-200 text-stone-600'}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            <div className={`px-8 overflow-hidden transition-all duration-500 ease-in-out ${openIndex === i ? 'max-h-64 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <p className="text-stone-600 font-medium text-lg leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
