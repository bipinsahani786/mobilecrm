import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Building2, User, Mail, Phone, Lock, ArrowRight, KeyRound, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
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
            Grow with us <br />
            as a certified <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-650">partner.</span>
          </h1>
          <p className="text-xs sm:text-sm text-primary-600 font-extrabold tracking-[0.25em] uppercase">
            Partner Commission program
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full" />
          <p className="text-slate-600 font-medium text-base sm:text-lg lg:text-xl leading-relaxed">
            Join our partner program and earn generous lifetime commissions for every business reference you refer to our platform.
          </p>
        </div>

        {/* Bottom Metadata */}
        <div className="relative z-10 flex gap-8 text-slate-400 font-bold uppercase tracking-widest text-[9px] select-none">
          <span>• LIFETIME COMMISSIONS</span>
          <span>• EASY ONBOARDING</span>
          <span>• PARTNER API</span>
        </div>

      </div>

      {/* ── RIGHT PANEL (Transparent on mobile, solid white on desktop) ── */}
      <div className="w-full lg:w-[480px] xl:w-[540px] h-full bg-transparent lg:bg-white relative z-20 shrink-0 flex flex-col justify-between p-6 sm:p-10 border-l border-slate-100/50 shadow-2xl shadow-slate-200/50 lg:shadow-none overflow-y-auto">
        
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
            <p className="text-[9px] text-primary-600 font-bold uppercase tracking-widest mt-0.5">Partner Program</p>
          </div>
        </div>

        {/* Form Container (Translucent floating card on mobile, transparent layout on PC) */}
        <div className="my-auto w-full max-w-lg mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/50 lg:border-none lg:bg-transparent lg:shadow-none rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/10 space-y-6 flex flex-col justify-center relative z-30">
          
          {/* Header Title describing each step */}
          <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-500 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
              {step === 'FORM' ? 'Partner Signup' : 'Verify Email'}
            </h2>
            <p className="text-slate-550 font-semibold text-xs">
              {step === 'FORM'
                ? 'Fill in details to set up your partner workspace.'
                : `We've sent a 6-digit secure code to ${email}`}
            </p>
          </div>

          {/* Form Content */}
          <div className="relative z-10">
            {step === 'FORM' ? (
              <form onSubmit={handleFormSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Full Name *</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="E.g. John Doe"
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Email *</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Company / Agency</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Company Name"
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Password *</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Confirm Password *</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="password"
                        required
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm font-semibold text-slate-900 placeholder-slate-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registerMutation.isPending || checkUserMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-primary-500 to-indigo-650 hover:from-primary-600 hover:to-indigo-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-md shadow-primary-500/15 active:translate-y-0.5 transition-all duration-200 border-none flex items-center justify-center gap-2 animate-in slide-in-from-bottom-4 fade-in duration-500"
                >
                  {checkUserMutation.isPending || sendOtpMutation.isPending ? 'Processing...' : (
                    <>
                      Register Now
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>

              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Verification Code</label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-xl tracking-[0.5em] font-black focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 placeholder-slate-400 transition-all duration-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verifyOtpMutation.isPending || registerMutation.isPending || otp.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-primary-500 to-indigo-650 hover:from-primary-600 hover:to-indigo-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-md shadow-primary-500/15 active:translate-y-0.5 transition-all duration-200 border-none flex items-center justify-center gap-2"
                >
                  {verifyOtpMutation.isPending || registerMutation.isPending ? 'Verifying & Registering...' : (
                    <>
                      Verify & Register
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center w-full gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Go back to details
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Footer Login text */}
        <p className="text-center text-slate-500 text-xs font-semibold select-none pt-4 border-t border-slate-100/50 relative z-30">
          Already have a partner account?{' '}
          <Link to="/login" className="text-primary-600 font-black hover:text-primary-750 transition-colors">
            Log in here
          </Link>
        </p>

      </div>

    </div>
  );
}
