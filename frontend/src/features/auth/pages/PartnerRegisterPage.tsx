import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Building2, User, Mail, Phone, Lock, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-[#09090b] flex flex-col lg:flex-row font-sans selection:bg-[#fe7d02] selection:text-white">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 p-2 relative overflow-hidden">
        <div className="w-full h-full rounded-[2.5rem] bg-zinc-900 border border-white/10 relative overflow-hidden flex flex-col justify-between p-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fe7d02]/30 via-zinc-900 to-zinc-900"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              {appLogo ? (
                <div className="bg-white/10 p-2 rounded-2xl w-12 h-12">
                  <img src={appLogo} alt={appName} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="bg-white/10 p-2 rounded-2xl w-12 h-12 flex items-center justify-center">
                  <span className="font-bold text-2xl text-[#fe7d02]">{appName?.charAt(0)}</span>
                </div>
              )}
              <span className="font-bold text-2xl text-white uppercase">{appName}</span>
            </div>

            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Grow with Us as a <span className="text-[#fe7d02]">Partner</span>.
            </h2>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-md">
              Join our partner program and earn generous lifetime commissions for every business you refer to our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-12">
          
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="bg-[#fe7d02] p-2.5 rounded-xl w-10 h-10 flex items-center justify-center font-bold text-white">
              {appName?.charAt(0) || 'B'}
            </div>
            <span className="font-bold text-xl text-white uppercase">{appName}</span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {step === 'FORM' ? 'Partner Registration' : 'Verify Your Email'}
            </h1>
            <p className="text-zinc-500">
              {step === 'FORM' 
                ? 'Fill in your details to create a partner account.' 
                : `We've sent a 6-digit secure code to ${email}`}
            </p>
          </div>

          {step === 'FORM' ? (
            <form onSubmit={handleFormSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#fe7d02] focus:ring-1 focus:ring-[#fe7d02] transition-all"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address *"
                    className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#fe7d02] focus:ring-1 focus:ring-[#fe7d02] transition-all"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number (Optional)"
                    className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#fe7d02] focus:ring-1 focus:ring-[#fe7d02] transition-all"
                  />
                </div>

                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company/Agency Name (Optional)"
                    className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#fe7d02] focus:ring-1 focus:ring-[#fe7d02] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password *"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#fe7d02] focus:ring-1 focus:ring-[#fe7d02] transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="password"
                      required
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Confirm *"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#fe7d02] focus:ring-1 focus:ring-[#fe7d02] transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={checkUserMutation.isPending || sendOtpMutation.isPending}
                className="w-full bg-[#fe7d02] hover:bg-[#ea580c] text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
              >
                {checkUserMutation.isPending || sendOtpMutation.isPending ? 'Processing...' : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              <p className="text-center text-zinc-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-[#fe7d02] font-semibold hover:underline">
                  Log in here
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl text-white text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-[#fe7d02] focus:ring-1 focus:ring-[#fe7d02] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={verifyOtpMutation.isPending || registerMutation.isPending || otp.length !== 6}
                className="w-full bg-[#fe7d02] hover:bg-[#ea580c] text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
                  className="text-sm font-bold text-zinc-500 hover:text-white transition-colors flex items-center justify-center w-full gap-2"
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
