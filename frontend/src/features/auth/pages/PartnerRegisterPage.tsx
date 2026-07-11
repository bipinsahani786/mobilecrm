import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Building2, User, Mail, Phone, Lock, ArrowRight, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCheckUser, useSendOtp, useVerifyOtp } from '../api/useAuthMutations';

export default function PartnerRegisterPage() {
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [otp, setOtp] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const { appName, appLogo } = useAppStore();
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const checkUserMutation = useCheckUser();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/partner/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.data.user, data.data.token);
      toast.success('Registration successful! Welcome to the Partner Program.');
      navigate('/partner/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    checkUserMutation.mutate({ identifier: email }, {
      onSuccess: (res) => {
        if (res.exists) {
          toast.error('This email is already registered.');
        } else {
          sendOtpMutation.mutate({ identifier: email }, {
            onSuccess: () => {
              toast.success(`OTP has been sent to ${email}`);
              setStep('OTP');
            },
            onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to send OTP')
          });
        }
      },
      onError: (err: any) => {
        const errorMsg = err.response?.data?.errors
          ? (Object.values(err.response.data.errors)[0] as any)?.[0] as string
          : err.response?.data?.message;
        toast.error(errorMsg || 'Validation failed');
      }
    });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    verifyOtpMutation.mutate({ identifier: email, otp }, {
      onSuccess: (res) => {
        const verificationToken = res.verification_token;
        toast.success('OTP Verified! Creating your account...');

        // Add referral code if passed in URL
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');

        registerMutation.mutate({
          name,
          email,
          phone: phone || undefined,
          company_name: companyName || undefined,
          password,
          password_confirmation: passwordConfirmation,
          referred_by: refCode || undefined,
          verification_token: verificationToken
        });
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Invalid OTP')
    });
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#f5f5f4] flex flex-col lg:flex-row font-sans selection:bg-[#fe7d02] selection:text-white transition-colors duration-300">

      {/* Left: Branding (Dark Mode - Deep Navy) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0b0f19] relative overflow-hidden flex-col justify-between p-8 lg:pt-10 lg:pl-10 lg:pb-16 lg:pr-16 group">

        {/* Dot Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        {/* Subtle Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(254,125,2,0.08),transparent_60%)] pointer-events-none z-0"></div>

        {/* Top Left Logo */}
        <div className="relative z-20 flex items-center gap-3 self-start animate-in slide-in-from-top-8 fade-in duration-700 fill-mode-both">
          {appLogo ? (
            <div className="bg-[#0b0f19] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.85),inset_-4px_-4px_8px_rgba(255,255,255,0.015)] p-2 rounded-xl border border-white/[0.005] w-12 h-12 overflow-hidden flex items-center justify-center">
              <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="bg-[#0b0f19] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.85),inset_-4px_-4px_8px_rgba(255,255,255,0.015)] p-2 rounded-xl border border-white/[0.005] w-12 h-12 flex items-center justify-center">
              <span className="font-bold text-xl text-[#fe7d02]">{appName?.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <span className="font-bold text-xl text-white uppercase tracking-tight transition-all duration-300">{appName}</span>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 w-full my-auto flex flex-row items-center justify-between gap-8 animate-in slide-in-from-left-8 fade-in duration-700 delay-150 fill-mode-both">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-4 py-1.5   rounded-full bg-[#0b0f19] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.85),inset_-4px_-4px_8px_rgba(255,255,255,0.015)] text-[10px] font-bold text-[#fe7d02] uppercase tracking-widest mb-8 border border-white/[0.005]">
              Partner Program
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Grow with Us as a <span className="text-[#fe7d02]">Partner</span>.
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
              Join our partner program and earn generous lifetime commissions for every business you refer to our platform.
            </p>
          </div>

          {/* Big Logo Beside Text */}
          <div className="hidden xl:flex items-center justify-center opacity-10 blur-[1px] transform -rotate-12 scale-150 animate-in zoom-in-75 fade-in duration-1000 delay-300 fill-mode-both">
            {appLogo ? (
              <img src={appLogo} alt="Background Logo" className="w-64 h-64 object-contain grayscale" />
            ) : (
              <span className="font-bold text-[12rem] text-white select-none">{appName ? appName.charAt(0).toUpperCase() : 'B'}</span>
            )}
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500 font-bold uppercase tracking-widest self-start animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
          Enterprise Billing Cloud
        </div>
      </div>

      {/* Right: Registration Form (Light Mode - Warm Stone) */}
      <div className="flex-1 w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-[#f5f5f4]">
        <div className="w-full max-w-xl bg-[#f5f5f4] rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-neu-light-flat border border-white/50 space-y-8 animate-in fade-in duration-500">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6 animate-in slide-in-from-top-4 fade-in duration-500 fill-mode-both">
            <div className="bg-[#f5f5f4] shadow-neu-light-inset rounded-xl w-12 h-12 flex items-center justify-center font-bold text-[#fe7d02] border border-white/30">
              {appName?.charAt(0).toUpperCase() || 'B'}
            </div>
            <span className="font-bold text-xl text-zinc-900 uppercase tracking-tight">{appName}</span>
          </div>

          <div className="animate-in slide-in-from-top-4 fade-in duration-500 delay-150 fill-mode-both">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-3">
              {step === 'FORM' ? 'Partner Registration' : 'Verify Your Email'}
            </h1>
            <p className="text-zinc-500 font-medium text-sm">
              {step === 'FORM'
                ? 'Fill in your details to create a partner account.'
                : `We've sent a 6-digit secure code to ${email}`}
            </p>
          </div>

          {step === 'FORM' ? (
            <form onSubmit={handleFormSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group animate-in slide-in-from-left-4 fade-in duration-500 delay-200 fill-mode-both">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#fe7d02] transition-colors" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name *"
                      className="w-full pl-12 pr-4 py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#fe7d02]/50 focus:ring-0 transition-all duration-300"
                    />
                  </div>

                  <div className="relative group animate-in slide-in-from-right-4 fade-in duration-500 delay-200 fill-mode-both">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#fe7d02] transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address *"
                      className="w-full pl-12 pr-4 py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#fe7d02]/50 focus:ring-0 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group animate-in slide-in-from-left-4 fade-in duration-500 delay-300 fill-mode-both">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#fe7d02] transition-colors" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number (Optional)"
                      className="w-full pl-12 pr-4 py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#fe7d02]/50 focus:ring-0 transition-all duration-300"
                    />
                  </div>

                  <div className="relative group animate-in slide-in-from-right-4 fade-in duration-500 delay-300 fill-mode-both">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#fe7d02] transition-colors" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company/Agency Name (Optional)"
                      className="w-full pl-12 pr-4 py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#fe7d02]/50 focus:ring-0 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group animate-in slide-in-from-left-4 fade-in duration-500 delay-500 fill-mode-both">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#fe7d02] transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password *"
                      className="w-full pl-12 pr-4 py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#fe7d02]/50 focus:ring-0 transition-all duration-300"
                    />
                  </div>
                  <div className="relative group animate-in slide-in-from-right-4 fade-in duration-500 delay-500 fill-mode-both">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#fe7d02] transition-colors" />
                    <input
                      type="password"
                      required
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Confirm *"
                      className="w-full pl-12 pr-4 py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-[#fe7d02]/50 focus:ring-0 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending || checkUserMutation.isPending}
                className="w-full bg-[#fe7d02] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#e67002] transition-all duration-300 shadow-[4px_4px_10px_rgba(254,125,2,0.3),inset_2px_2px_4px_rgba(255,255,255,0.3)] hover:shadow-[2px_2px_5px_rgba(254,125,2,0.3),inset_2px_2px_4px_rgba(255,255,255,0.3)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group animate-in slide-in-from-bottom-6 fade-in duration-500 delay-1000 fill-mode-both"
              >
                {checkUserMutation.isPending || sendOtpMutation.isPending ? 'Processing...' : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-zinc-500 pt-6 border-t border-black/5 text-sm animate-in fade-in duration-500 delay-[1200ms] fill-mode-both">
                Already have an account?{' '}
                <Link to="/login" className="text-[#fe7d02] font-semibold hover:text-[#e67002] transition-colors hover:underline">
                  Log in here
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#fe7d02] transition-colors" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-12 pr-4 py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl text-zinc-950 text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-[#fe7d02]/50 focus:ring-0 transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={verifyOtpMutation.isPending || registerMutation.isPending || otp.length !== 6}
                className="w-full bg-[#fe7d02] hover:bg-[#ea580c] text-white font-bold py-4 rounded-2xl transition-all shadow-neu-btn active:shadow-neu-btn-inset active:translate-y-0.5 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 border-none"
              >
                {verifyOtpMutation.isPending || registerMutation.isPending ? 'Verifying & Registering...' : (
                  <>
                    Verify & Register
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="text-sm font-bold text-zinc-500 hover:text-zinc-700 transition-colors flex items-center justify-center w-full gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go back to details
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
