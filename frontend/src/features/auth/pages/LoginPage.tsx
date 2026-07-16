import { useState } from 'react';
import { IdentifierForm, LoginForm, OtpForm, SetPasswordForm } from '../components/AuthForms';
import { useAppStore } from '@/store/appStore';
import { Link } from 'react-router-dom';

type AuthStep = 'IDENTIFIER' | 'LOGIN' | 'OTP' | 'SET_PASSWORD';

export default function LoginPage() {
  const [step, setStep] = useState<AuthStep>('IDENTIFIER');
  const [identifier, setIdentifier] = useState('');
  const [otpToken, setOtpToken] = useState('');

  const { appName, appLogo } = useAppStore();

  const goBackToIdentifier = () => {
    setStep('IDENTIFIER');
  };

  return (
    <div className="h-screen w-full bg-[#FAF9F5] text-slate-800 flex overflow-hidden relative select-none">
      
      {/* ── SHARED BACKGROUND LAYER (Visible on both PC and mobile) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial Dots */}
        <div className="absolute inset-0 bg-[radial-gradient(#e3decb_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />
        
        {/* Layered Diagonal Curve SVGs */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M0,0 L100,0 L100,70 C70,78 30,48 0,94 Z" fill="#EFE8DD" opacity="0.5" />
          <path d="M0,0 L100,0 L100,64 C65,74 25,44 0,88 Z" fill="#F4EFE6" />
        </svg>

        {/* Floating Circle and Curved Geometric Elements */}
        <div className="absolute top-16 left-16 w-32 h-32 rounded-full border-2 border-[#E3DECB]" />
        <div className="absolute bottom-24 left-1/4 w-60 h-60 rounded-full border border-dashed border-primary-500/15 animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-rose-200/35 rounded-full blur-3xl" />
        <div className="absolute bottom-12 right-12 w-80 h-80 bg-indigo-100/25 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-amber-400 rounded-full opacity-60 animate-ping" />
        <div className="absolute bottom-1/3 left-16 w-2.5 h-2.5 bg-rose-400 rounded-full opacity-60" />
      </div>

      {/* ── LEFT CANVAS (Desktop Only) ── */}
      <div className="hidden lg:flex flex-1 h-full flex-col justify-between p-12 lg:p-16 relative z-10">
        
        {/* Top Left Header Logo */}
        <div className="relative z-10 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          {appLogo ? (
            <div className="p-1 rounded-2xl bg-white shadow-sm border border-[#E3DECB] hover:scale-105 transition-transform duration-500">
              <div className="bg-[#FAF9F5] rounded-[12px] p-2 flex items-center justify-center w-12 h-12 overflow-hidden">
                <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          ) : (
            <div className="p-1 rounded-2xl bg-white shadow-sm border border-[#E3DECB] hover:scale-105 transition-transform duration-500">
              <div className="bg-[#FAF9F5] rounded-[12px] p-2 flex items-center justify-center w-12 h-12">
                <span className="font-black text-xl text-primary-500">
                  {appName ? appName.charAt(0).toUpperCase() : 'B'}
                </span>
              </div>
            </div>
          )}
          <span className="font-black text-base tracking-widest text-slate-800 uppercase">{appName}</span>
        </div>

        {/* Center Big Bold Typography Area */}
        <div className="my-auto max-w-xl space-y-6 relative z-10 animate-in slide-in-from-left-6 duration-700">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] uppercase">
            Manage your <br />
            retail store <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-650">intelligently.</span>
          </h1>
          <p className="text-xs sm:text-sm text-primary-600 font-extrabold tracking-[0.25em] uppercase">
            Unified Party billing & ledger platform
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full" />
          <p className="text-slate-600 font-medium text-base sm:text-lg lg:text-xl leading-relaxed">
            Track business collections, custom billing invoices, party ledger payments, and customer accounts inside a clean, modern ecosystem.
          </p>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 flex gap-8 text-slate-400 font-bold uppercase tracking-widest text-[9px] select-none">
          <span>• SECURE ACCESS</span>
          <span>• GST LEDGER</span>
          <span>• COMPLIANT</span>
        </div>

      </div>

      {/* ── RIGHT PANEL (Transparent on mobile, solid white on desktop) ── */}
      <div className="w-full lg:w-[460px] xl:w-[500px] h-full bg-transparent lg:bg-white relative z-20 shrink-0 flex flex-col justify-between p-6 sm:p-12 lg:border-l lg:border-slate-100/50 shadow-2xl shadow-slate-200/50 lg:shadow-none">
        
        {/* Layered Organic Wave Separators on the left edge of the white card (Desktop only) */}
        <svg className="absolute top-0 bottom-0 left-[-55px] w-[55px] h-full text-[#EFE8DD]/70 fill-current hidden lg:block z-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M100,0 C20,30 20,70 100,100 Z" />
        </svg>
        <svg className="absolute top-0 bottom-0 left-[-40px] w-[40px] h-full text-white fill-current hidden lg:block z-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M100,0 C60,25 40,75 100,100 Z" />
        </svg>

        {/* Mobile Header - Logo & Title (Visible on Mobile only at the very top of screen) */}
        <div className="flex lg:hidden items-center gap-3.5 mb-6 shrink-0 relative z-30">
          {appLogo ? (
            <div className="w-11 h-11 overflow-hidden flex items-center justify-center rounded-xl border border-slate-200 p-1 bg-white shadow-sm">
              <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-11 h-11 overflow-hidden flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
              <span className="font-black text-lg text-primary-500">
                {appName ? appName.charAt(0).toUpperCase() : 'B'}
              </span>
            </div>
          )}
          <div>
            <h1 className="font-black text-lg tracking-wider text-slate-900 uppercase leading-none">{appName}</h1>
            <p className="text-[9px] text-primary-600 font-bold uppercase tracking-widest mt-0.5">Unified Ledger</p>
          </div>
        </div>

        {/* Form Container (Translucent floating card on mobile, transparent layout on PC) */}
        <div className="my-auto w-full max-w-sm mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/50 lg:border-none lg:bg-transparent lg:shadow-none rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/10 space-y-6 flex flex-col justify-center shrink-0 relative z-30">
          
          {/* Header Title describing each step */}
          <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-500">
            {step === 'IDENTIFIER' && (
              <>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">Sign in</h2>
                <p className="text-slate-500 font-semibold text-xs">Enter credentials to access your terminal.</p>
              </>
            )}
            {step === 'LOGIN' && (
              <>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">Verify password</h2>
                <p className="text-slate-500 font-semibold text-xs">Verify your password for <span className="text-primary-650 font-black">{identifier}</span></p>
              </>
            )}
            {step === 'OTP' && (
              <>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">Enter OTP</h2>
                <p className="text-slate-500 font-semibold text-xs">Verification code sent to <span className="text-primary-650 font-black">{identifier}</span></p>
              </>
            )}
            {step === 'SET_PASSWORD' && (
              <>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">Setup password</h2>
                <p className="text-slate-500 font-semibold text-xs">Set a strong password for account safety.</p>
              </>
            )}
          </div>

          {/* Form component step */}
          <div className="relative z-10">
            {step === 'IDENTIFIER' && (
              <IdentifierForm onNext={setStep} setIdentifier={setIdentifier} />
            )}

            {step === 'LOGIN' && (
              <LoginForm identifier={identifier} goBack={goBackToIdentifier} />
            )}

            {step === 'OTP' && (
              <OtpForm identifier={identifier} onNext={setStep} goBack={goBackToIdentifier} setOtpToken={setOtpToken} />
            )}

            {step === 'SET_PASSWORD' && (
              <SetPasswordForm otpToken={otpToken} />
            )}
          </div>

        </div>

        {/* Footer Login/Register text */}
        <p className="text-center text-slate-500 text-xs font-semibold select-none pt-4 border-t border-slate-100/50 relative z-30">
          Interested in our partner program?{' '}
          <Link to="/partner/register" className="text-primary-600 font-black hover:text-primary-750 transition-colors">
            Register here
          </Link>
        </p>

      </div>

    </div>
  );
}
