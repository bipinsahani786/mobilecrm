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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#f5f5f4] flex flex-col lg:flex-row font-sans selection:bg-[#fe7d02] selection:text-white transition-colors duration-300">

      {/* Left: Branding & Visual (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0b0f19] relative overflow-hidden flex-col justify-between p-8 lg:pt-10 lg:pl-10 lg:pb-16 lg:pr-16 group">

        {/* Dot Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        {/* Subtle Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(254,125,2,0.08),transparent_60%)] pointer-events-none z-0"></div>

        {/* Top Left Logo */}
        <div className="relative z-20 flex items-center gap-3 self-start animate-in slide-in-from-top-8 fade-in duration-700 fill-mode-both">
          {appLogo ? (
            <div className="bg-[#0b0f19] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.85),inset_-4px_-4px_8px_rgba(255,255,255,0.015)] p-2 rounded-xl border border-white/[0.005] flex items-center justify-center w-12 h-12 overflow-hidden">
              <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="bg-[#0b0f19] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.85),inset_-4px_-4px_8px_rgba(255,255,255,0.015)] p-2 rounded-xl border border-white/[0.005] flex items-center justify-center w-12 h-12">
              <span className="font-bold text-xl text-[#fe7d02]">{appName ? appName.charAt(0).toUpperCase() : 'B'}</span>
            </div>
          )}
          <span className="font-bold text-xl tracking-tight text-white uppercase transition-all duration-300">
            {appName}
          </span>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 w-full my-auto flex flex-row items-center justify-between gap-4 pt- animate-in slide-in-from-left-8 fade-in duration-700 delay-150 fill-mode-both">
          <div className="max-w-md">

            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Intelligence at the <span className="text-[#fe7d02]">Core</span> of Billing.
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Securely manage invoices, inventory, party ledgers, and multi-business settlements in one unified cloud ecosystem.
            </p>
          </div>

          {/* Big Logo Beside Text */}
          <div className="hidden xl:flex items-center justify-center opacity-10 blur-[1px] transform rotate-12 scale-150 animate-in zoom-in-75 fade-in duration-1000 delay-300 fill-mode-both">
            {appLogo ? (
              <img src={appLogo} alt="Background Logo" className="w-64 h-64 object-contain grayscale" />
            ) : (
              <span className="font-bold text-[12rem] text-white select-none">{appName ? appName.charAt(0).toUpperCase() : 'B'}</span>
            )}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-8 pt-8 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
          <div className="bg-[#0b0f19] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.85),inset_-4px_-4px_8px_rgba(255,255,255,0.015)] rounded-[2rem] p-6 flex-1 text-center border border-white/[0.005] hover:scale-[1.02] transition-transform duration-300">
            <p className="text-3xl font-bold text-white font-display">5K+</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Businesses Active</p>
          </div>
          <div className="bg-[#0b0f19] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.85),inset_-4px_-4px_8px_rgba(255,255,255,0.015)] rounded-[2rem] p-6 flex-1 text-center border border-white/[0.005] hover:scale-[1.02] transition-transform duration-300">
            <p className="text-3xl font-bold text-white font-display">1M+</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Invoices Monthly</p>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-[#f5f5f4]">
        <div className="w-full max-w-md bg-[#f5f5f4] rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-neu-light-flat border border-white/50 space-y-8 animate-in fade-in duration-500">

          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden mb-6 animate-in slide-in-from-top-4 fade-in duration-500 fill-mode-both">
            {appLogo ? (
              <div className="bg-[#f5f5f4] shadow-neu-light-inset rounded-xl w-12 h-12 p-2 flex items-center justify-center overflow-hidden border border-white/30">
                <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="bg-[#f5f5f4] shadow-neu-light-inset rounded-xl w-12 h-12 flex items-center justify-center font-bold text-[#fe7d02] border border-white/30">
                {appName ? appName.charAt(0).toUpperCase() : 'B'}
              </div>
            )}
            <span className="font-bold text-xl tracking-tight text-zinc-900 uppercase transition-all duration-300">
              {appName}
            </span>
          </div>

          <div className="animate-in slide-in-from-top-4 fade-in duration-500 delay-150 fill-mode-both">
            {step === 'IDENTIFIER' && (
              <>
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-3">Welcome</h1>
                <p className="text-zinc-500 font-medium text-sm">Please enter your credentials to access the dashboard.</p>
              </>
            )}
            {step === 'LOGIN' && (
              <>
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-3">Welcome Back</h1>
                <p className="text-zinc-500 font-medium text-sm">Sign in securely as <span className="text-[#fe7d02] font-semibold">{identifier}</span></p>
              </>
            )}
            {step === 'OTP' && (
              <>
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-3">Verify OTP</h1>
                <p className="text-zinc-500 font-medium text-sm">We've sent a 6-digit secure code to <span className="text-[#fe7d02] font-semibold">{identifier}</span></p>
              </>
            )}
            {step === 'SET_PASSWORD' && (
              <>
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-3">Secure Account</h1>
                <p className="text-zinc-500 font-medium text-sm">Create a strong password to protect your data.</p>
              </>
            )}
          </div>

          <div className="py-2">
            {step === 'IDENTIFIER' && (
              <IdentifierForm
                onNext={setStep}
                setIdentifier={setIdentifier}
              />
            )}

            {step === 'LOGIN' && (
              <LoginForm
                identifier={identifier}
                goBack={goBackToIdentifier}
              />
            )}

            {step === 'OTP' && (
              <OtpForm
                identifier={identifier}
                onNext={setStep}
                goBack={goBackToIdentifier}
                setOtpToken={setOtpToken}
              />
            )}

            {step === 'SET_PASSWORD' && (
              <SetPasswordForm
                otpToken={otpToken}
              />
            )}
          </div>

          <p className="text-center text-zinc-500 pt-6 border-t border-black/5 text-sm animate-in fade-in duration-500 delay-[1200ms] fill-mode-both">
            Interested in our partner program?{' '}
            <Link to="/partner/register" className="text-[#fe7d02] font-semibold hover:text-[#e67002] transition-colors hover:underline">
              Register as a Partner
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}


