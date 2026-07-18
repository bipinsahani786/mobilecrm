import { useIntersectionObserver } from './useIntersectionObserver';

const testimonials = [
    { quote: "This platform completely revolutionized how we handle our party ledgers. We saved over 40 hours a month on reconciliation alone.", author: "Rajesh Kumar", role: "Kumar Textiles" },
    { quote: "The automated GST invoicing is a lifesaver. It's so clean and intuitive that my entire staff learned it in a day.", author: "Priya Sharma", role: "Sharma Electronics" },
    { quote: "Payroll used to be a nightmare of spreadsheets. Now it's just a few clicks. Best investment we've made this year.", author: "Amit Patel", role: "Patel & Sons" },
    { quote: "I've never used a tool that feels so premium and snappy. It's an absolute joy to use on both my phone and desktop.", author: "Elena Rodriguez", role: "Studio 42" },
    { quote: "We scaled our operations to 5 new stores seamlessly thanks to MobileCRM's multi-branch support.", author: "Vikram Singh", role: "Singh Retail" }
];

export default function TestimonialsSection() {
    return (
        <section id="testimonials" className="py-16 relative overflow-hidden">
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
            `}</style>
            
            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center">
                <h2 className="text-4xl md:text-6xl font-black text-stone-900 tracking-tighter uppercase mb-6">
                    What The <br className="md:hidden" /> Best Say
                </h2>
                <div className="w-24 h-1 bg-orange-500 mx-auto"></div>
            </div>

            <div className="w-full relative py-8">
                {/* Fade masks */}
                <div className="absolute top-0 bottom-0 left-0 w-16 md:w-48 bg-gradient-to-r from-[#F7F4EB] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute top-0 bottom-0 right-0 w-16 md:w-48 bg-gradient-to-l from-[#F7F4EB] to-transparent z-10 pointer-events-none"></div>
                
                {/* Marquee Track */}
                <div className="flex w-max animate-marquee gap-6 md:gap-8 px-4 hover:[animation-play-state:paused]">
                    {/* Double the array for seamless looping */}
                    {[...testimonials, ...testimonials].map((testimonial, i) => (
                        <div key={i} className="w-[85vw] md:w-[600px] flex-shrink-0 bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border border-[#D4CBB3] shadow-xl hover:scale-[1.02] transition-transform duration-500 cursor-grab active:cursor-grabbing">
                            <svg className="w-12 h-12 text-orange-200 mb-8" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.714 4.103-10.159 10.983-11.609l-1.022 3.125c-4.444.97-5.96 4.093-5.96 7.859h6.982v8.016h-10.983zm-14.017 0v-7.391c0-5.714 4.103-10.159 10.983-11.609l-1.022 3.125c-4.444.97-5.96 4.093-5.96 7.859h6.982v8.016h-10.983z"></path></svg>
                            <p className="text-xl md:text-2xl text-stone-700 font-medium leading-relaxed mb-8">
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center gap-4 border-t border-stone-100 pt-6">
                                <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center text-white font-black text-lg">
                                    {testimonial.author.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-black text-stone-900 uppercase tracking-widest text-xs md:text-sm">{testimonial.author}</h4>
                                    <p className="text-stone-500 text-xs md:text-sm font-medium">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
