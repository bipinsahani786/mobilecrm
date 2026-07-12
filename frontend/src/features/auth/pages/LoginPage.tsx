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
    <div className="relative min-h-screen w-full bg-[#f5f5f4] flex flex-col lg:flex-row font-sans overflow-hidden selection:bg-[#fe7d02] selection:text-white">

      {/* Dynamic Wavy Background (Responsive) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle shadow/glow wave for depth */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full text-[#fe7d02]/10 fill-current translate-x-1 translate-y-1 scale-150 sm:scale-100 origin-left">
          <path d="M0,0 L35,0 C55,35 25,65 45,100 L0,100 Z" />
        </svg>

        {/* Main Dark Wave */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full text-[#0b0f19] fill-current scale-150 sm:scale-100 origin-left">
          <path d="M0,0 L35,0 C55,35 25,65 45,100 L0,100 Z" />
        </svg>

        {/* Ambient Glows inside the dark wave */}
        <div className="absolute top-1/4 left-0 sm:left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-[#fe7d02]/10 sm:bg-[#fe7d02]/5 blur-[80px] sm:blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 -left-10 sm:left-1/8 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500/10 sm:bg-blue-500/5 blur-[60px] sm:blur-[80px] rounded-full mix-blend-screen" />
      </div>

      {/* Left Content (Branding - Desktop Only) */}
      <div className="hidden lg:flex w-[40%] relative z-10 flex-col justify-between p-12 xl:p-16 text-white h-full pointer-events-none">

        {/* Top Left Logo */}
        <div className="flex items-center gap-4 animate-in slide-in-from-top-8 fade-in duration-700 fill-mode-both">
          {appLogo ? (
            <div className="bg-[#0b0f19] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.85),inset_-4px_-4px_8px_rgba(255,255,255,0.015)] p-2.5 rounded-2xl border border-white/[0.005] flex items-center justify-center w-14 h-14 overflow-hidden backdrop-blur-sm">
              <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="bg-[#0b0f19] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.85),inset_-4px_-4px_8px_rgba(255,255,255,0.015)] p-2.5 rounded-2xl border border-white/[0.005] flex items-center justify-center w-14 h-14 backdrop-blur-sm">
              <span className="font-black text-2xl text-[#fe7d02]">{appName ? appName.charAt(0).toUpperCase() : 'B'}</span>
            </div>
          )}
          <span className="font-black text-2xl tracking-widest text-white uppercase transition-all duration-300">
            {appName}
          </span>
        </div>

        {/* Main Typography Area */}
        <div className="my-auto animate-in slide-in-from-left-8 fade-in duration-700 delay-150 fill-mode-both pr-10">
          <h2 className="text-5xl xl:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
            Intelligence <br />at the <span className="text-[#fe7d02] inline-block -rotate-2 scale-110 mx-1">Core</span> <br />of Billing.
          </h2>
          <p className="text-lg xl:text-xl text-zinc-400 leading-relaxed font-medium max-w-md">
            Securely manage invoices, inventory, party ledgers, and multi-business settlements in one unified cloud ecosystem.
          </p>
        </div>

        {/* Bottom Stats */}
        <div className="flex items-center gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 flex-1 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#fe7d02]/20 blur-2xl rounded-full -mr-10 -mt-10" />
            <p className="text-4xl font-black text-white tracking-tighter mb-1 relative z-10">5K+</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest relative z-10">Businesses</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 flex-1 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 blur-2xl rounded-full -mr-10 -mt-10" />
            <p className="text-4xl font-black text-white tracking-tighter mb-1 relative z-10">1M+</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest relative z-10">Invoices/Mo</p>
          </div>
        </div>
      </div>

      {/* Right Content (Login Form) */}
      <div className="w-full lg:w-[50%] lg:ml-auto relative z-10 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-16 min-h-screen">
        
        <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-[3rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white space-y-6 sm:space-y-8 animate-in zoom-in-95 fade-in duration-700 relative overflow-hidden">
          
          {/* Decorative elements inside the card */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#fe7d02]/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

          {/* Mobile Dark Header (Only visible on mobile since wave is hidden) */}
          <div className="lg:hidden w-full flex flex-col items-center justify-center relative overflow-hidden">
            {appLogo ? (
              <div className="bg-white/80 shadow-neu-light-inset rounded-2xl w-16 h-16 p-2 flex items-center justify-center overflow-hidden border border-white">
                <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain drop-shadow-md" />
              </div>
            ) : (
              <div className="bg-white/80 shadow-neu-light-inset rounded-2xl w-16 h-16 flex items-center justify-center font-bold text-2xl text-[#fe7d02] border border-white">
                {appName ? appName.charAt(0).toUpperCase() : 'B'}
              </div>
            )}
            <span className="font-bold text-xl tracking-tight text-zinc-900 uppercase mt-3">
              {appName}
            </span>
          </div>

          <div className="relative z-10 animate-in slide-in-from-top-4 fade-in duration-500 delay-150 fill-mode-both text-center lg:text-left">
            {step === 'IDENTIFIER' && (
              <>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tighter mb-3">Welcome</h1>
                <p className="text-zinc-500 font-medium text-sm">Enter your credentials to access the ecosystem.</p>
              </>
            )}
            {step === 'LOGIN' && (
              <>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tighter mb-3">Welcome Back</h1>
                <p className="text-zinc-500 font-medium text-sm">Sign in securely as <span className="text-[#fe7d02] font-black">{identifier}</span></p>
              </>
            )}
            {step === 'OTP' && (
              <>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tighter mb-3">Verify OTP</h1>
                <p className="text-zinc-500 font-medium text-sm">We've sent a 6-digit secure code to <span className="text-[#fe7d02] font-black">{identifier}</span></p>
              </>
            )}
            {step === 'SET_PASSWORD' && (
              <>
                <h1 className="text-4xl font-black text-zinc-900 tracking-tighter mb-3">Secure Account</h1>
                <p className="text-zinc-500 font-medium text-sm">Create a strong password to protect your data.</p>
              </>
            )}
          </div>

          <div className="relative z-10 py-2">
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

          <p className="relative z-10 text-center text-zinc-500 pt-6 border-t border-black/5 text-sm font-medium animate-in fade-in duration-500 delay-[1200ms] fill-mode-both">
            Interested in our partner program?{' '}
            <Link to="/partner/register" className="text-[#fe7d02] font-black hover:text-[#e67002] transition-colors hover:underline decoration-2 underline-offset-4">
              Register here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}


