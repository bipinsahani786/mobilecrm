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
              <span className="font-black text-2xl text-[#fe7d02]">{appName?.charAt(0).toUpperCase() || 'B'}</span>
            </div>
          )}
          <span className="font-black text-2xl tracking-widest text-white uppercase transition-all duration-300">
            {appName}
          </span>
        </div>

        {/* Main Typography Area */}
        <div className="my-auto animate-in slide-in-from-left-8 fade-in duration-700 delay-150 fill-mode-both pr-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md text-[10px] font-bold text-[#fe7d02] uppercase tracking-widest mb-8 border border-white/10">
            Partner Program
          </div>
          <h2 className="text-5xl xl:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
            Grow with <br />Us as a <span className="text-[#fe7d02] inline-block -rotate-2 scale-110 mx-1">Partner</span>.
          </h2>
          <p className="text-lg xl:text-xl text-zinc-400 leading-relaxed font-medium max-w-md">
            Join our partner program and earn generous lifetime commissions for every business you refer to our platform.
          </p>
        </div>

        <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
          Enterprise Billing Cloud
        </div>
      </div>

      {/* Right Content (Registration Form) */}
      <div className="w-full lg:w-[50%] lg:ml-auto relative z-10 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-16 min-h-screen">
        <div className="w-full max-w-xl bg-white/70 backdrop-blur-2xl rounded-[3rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white space-y-6 sm:space-y-8 animate-in zoom-in-95 fade-in duration-700 relative overflow-hidden">
          
          {/* Decorative elements inside the card */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#fe7d02]/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

          {/* Mobile Logo */}
          <div className="lg:hidden relative z-10 flex flex-col items-center justify-center gap-3 mb-4 animate-in slide-in-from-top-4 fade-in duration-500 fill-mode-both">
            {appLogo ? (
              <div className="bg-white/80 shadow-neu-light-inset rounded-2xl w-16 h-16 p-2 flex items-center justify-center overflow-hidden border border-white">
                <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain drop-shadow-md" />
              </div>
            ) : (
              <div className="bg-white/80 shadow-neu-light-inset rounded-2xl w-16 h-16 flex items-center justify-center font-bold text-2xl text-[#fe7d02] border border-white">
                {appName ? appName.charAt(0).toUpperCase() : 'B'}
              </div>
            )}
            <span className="font-bold text-xl text-zinc-900 uppercase tracking-tight mt-2">{appName}</span>
          </div>

          <div className="relative z-10 animate-in slide-in-from-top-4 fade-in duration-500 delay-150 fill-mode-both text-center lg:text-left">
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter mb-3">
              {step === 'FORM' ? 'Partner Registration' : 'Verify Your Email'}
            </h1>
            <p className="text-zinc-500 font-medium text-sm">
              {step === 'FORM'
                ? 'Fill in your details to create a partner account.'
                : `We've sent a 6-digit secure code to ${email}`}
            </p>
          </div>

          <div className="relative z-10 py-2">
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
                  className="w-full bg-[#fe7d02] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#e67002] transition-all duration-300 shadow-[4px_4px_10px_rgba(254,125,2,0.3),inset_2px_2px_4px_rgba(255,255,255,0.3)] hover:shadow-[2px_2px_5px_rgba(254,125,2,0.3),inset_2px_2px_4px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group animate-in slide-in-from-bottom-6 fade-in duration-500 delay-1000 fill-mode-both"
                >
                  {checkUserMutation.isPending || sendOtpMutation.isPending ? 'Processing...' : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-zinc-500 pt-6 border-t border-black/5 text-sm font-medium animate-in fade-in duration-500 delay-[1200ms] fill-mode-both">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#fe7d02] font-black hover:text-[#e67002] transition-colors hover:underline decoration-2 underline-offset-4">
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
                    className="w-full pl-12 pr-4 py-4 bg-[#f5f5f4] dark:bg-zinc-800 border border-black/5 dark:border-white/5 shadow-neu-light-inset dark:shadow-none rounded-2xl text-zinc-950 dark:text-white text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-[#fe7d02]/50 focus:ring-0 transition-all duration-300"
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
                    className="text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex items-center justify-center w-full gap-2"
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
    </div>
  );
}
