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
    <div className="min-h-screen bg-[#09090b] flex flex-col lg:flex-row font-sans selection:bg-[#fe7d02] selection:text-white transition-colors duration-300">

      {/* Left: Branding & Visual (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 p-2 relative overflow-hidden">
        <div className="w-full h-full rounded-[2.5rem] bg-zinc-900 border border-white/10 relative overflow-hidden group">
          {/* Decorative BG */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#fe7d02]/40 via-zinc-900/90 to-zinc-900"></div>

          <div className="relative z-10 w-full h-full p-20 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              {appLogo ? (
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center justify-center w-12 h-12 overflow-hidden">
                  <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center justify-center w-12 h-12">
                  <span className="font-bold text-2xl text-[#fe7d02]">{appName ? appName.charAt(0).toUpperCase() : 'B'}</span>
                </div>
              )}
              <span className="font-bold text-2xl tracking-tight text-white uppercase transition-all duration-300">
                {appName}
              </span>
            </div>

            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fe7d02]/20 border border-[#fe7d02]/30 mb-8">
                <span className="text-[10px] font-bold text-[#fe7d02] uppercase tracking-widest">Enterprise Ready</span>
              </div>
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
                Intelligence at the <span className="text-[#fe7d02]">Core</span> of Billing.
              </h2>
              <p className="text-xl text-zinc-400 leading-relaxed">
                Securely manage invoices, inventory, party ledgers, and multi-business settlements in one unified cloud ecosystem.
              </p>
            </div>

            <div className="flex items-center gap-12 border-t border-white/10 pt-12">
              <div>
                <p className="text-3xl font-bold text-white font-display">5K+</p>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Businesses Active</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white font-display">1M+</p>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Invoices Monthly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-lg space-y-12">

          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden mb-12">
            {appLogo ? (
              <div className="bg-transparent rounded-xl w-10 h-10 flex items-center justify-center overflow-hidden">
                <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="bg-[#fe7d02] p-2.5 rounded-xl w-10 h-10 flex items-center justify-center font-bold text-white">
                {appName ? appName.charAt(0).toUpperCase() : 'B'}
              </div>
            )}
            <span className="font-bold text-xl tracking-tight text-white uppercase transition-all duration-300">
              {appName}
            </span>
          </div>

          <div className="animate-in fade-in duration-500">
            {step === 'IDENTIFIER' && (
              <>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Welcome</h1>
                <p className="text-zinc-500 font-medium text-lg">Please enter your credentials to access the dashboard.</p>
              </>
            )}
            {step === 'LOGIN' && (
              <>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Welcome Back</h1>
                <p className="text-zinc-500 font-medium text-lg">Sign in securely as <span className="text-white font-medium">{identifier}</span></p>
              </>
            )}
            {step === 'OTP' && (
              <>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Verify OTP</h1>
                <p className="text-zinc-500 font-medium text-lg">We've sent a 6-digit secure code to <span className="text-white font-medium">{identifier}</span></p>
              </>
            )}
            {step === 'SET_PASSWORD' && (
              <>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Secure Account</h1>
                <p className="text-zinc-500 font-medium text-lg">Create a strong password to protect your data.</p>
              </>
            )}
          </div>

          <div>
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

          <p className="text-center text-zinc-500 pt-4 border-t border-white/5">
            Interested in our partner program?{' '}
            <Link to="/partner/register" className="text-[#fe7d02] font-semibold hover:underline">
              Register as a Partner
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
