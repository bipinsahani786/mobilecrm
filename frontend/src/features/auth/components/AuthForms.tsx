import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { identifierSchema, loginPasswordSchema, otpSchema, setPasswordSchema } from '../schemas/authSchema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { useCheckUser, useSendOtp, useLogin, useVerifyOtp, useSetPassword } from '../api/useAuthMutations';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
// Skeleton removed for smoother transition

// --- IDENTIFIER FORM ---
export const IdentifierForm = ({ onNext, setIdentifier }: any) => {
  const form = useForm({ resolver: zodResolver(identifierSchema) });
  const checkUserMutation = useCheckUser();
  const sendOtpMutation = useSendOtp();

  const onSubmit = (data: any) => {
    checkUserMutation.mutate(data, {
      onSuccess: (res) => {
        setIdentifier(data.identifier);
        if (res.exists) {
          onNext('LOGIN');
        } else {
          sendOtpMutation.mutate(data, {
            onSuccess: () => {
              toast.success(`OTP has been sent to ${data.identifier}`);
              onNext('OTP');
            },
            onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to send OTP')
          });
        }
      },
      onError: (err: any) => {
        const errorMsg = err.response?.data?.errors 
          ? (Object.values(err.response.data.errors)[0] as any)?.[0] as string
          : err.response?.data?.message;
        toast.error(errorMsg || 'Verification failed');
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2 animate-in slide-in-from-left-4 fade-in duration-500 delay-300 fill-mode-both">
        <label htmlFor="identifier" className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 cursor-pointer select-none">Identity</label>
        <Input 
          id="identifier"
          icon={<User size={20} />}
          className="py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl focus:ring-0 focus:border-[#fe7d02]/50 text-zinc-950 placeholder-zinc-400 transition-all duration-300"
          {...form.register('identifier')} 
          placeholder="Email or 10-digit Phone"
          error={form.formState.errors.identifier?.message as string}
        />
      </div>
      <Button type="submit" isLoading={checkUserMutation.isPending || sendOtpMutation.isPending} loadingText="Processing" className="w-full mt-2 bg-[#fe7d02] hover:bg-[#e67002] text-white shadow-neu-btn active:shadow-neu-btn-inset active:translate-y-0.5 hover:scale-[1.01] transition-all duration-200 border-none animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500 fill-mode-both">
        <span>Continue</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
    </form>
  );
};

// --- LOGIN PASSWORD FORM ---
export const LoginForm = ({ identifier, goBack }: any) => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const form = useForm({ resolver: zodResolver(loginPasswordSchema) });
  const loginMutation = useLogin();

  const onSubmit = (data: any) => {
    loginMutation.mutate({ identifier, password: data.password }, {
      onSuccess: (res) => {
        setAuth(res.user, res.token);
        const isSuperadmin = res.user.roles?.some((r: any) => r.name === 'Superadmin');
        navigate(isSuperadmin ? '/superadmin/dashboard' : '/dashboard');
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Login failed')
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2 animate-in slide-in-from-right-4 fade-in duration-500 delay-300 fill-mode-both">
        <div className="flex justify-between items-center px-1">
          <label htmlFor="password" className="text-xs font-bold text-zinc-500 uppercase tracking-widest cursor-pointer select-none">Secret</label>
          <a href="#" className="text-xs font-bold text-[#fe7d02] hover:text-[#e67002] transition-colors">Forgot Password?</a>
        </div>
        <Input 
          id="password"
          type="password"
          icon={<Lock size={20} />}
          className="py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl focus:ring-0 focus:border-[#fe7d02]/50 text-zinc-950 placeholder-zinc-400 transition-all duration-300"
          {...form.register('password')} 
          placeholder="••••••••"
          error={form.formState.errors.password?.message as string}
        />
      </div>
      <div className="flex items-center px-1 justify-between animate-in slide-in-from-left-4 fade-in duration-500 delay-400 fill-mode-both">
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <div className="relative flex items-center">
            <input type="checkbox" className="peer hidden" />
            <div className="w-5.5 h-5.5 bg-[#f5f5f4] shadow-neu-light-inset rounded-lg border border-black/5 transition-all peer-checked:border-[#fe7d02]/40"></div>
            <svg className="absolute w-3.5 h-3.5 text-[#fe7d02] opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300 left-[4px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-500 group-hover:text-zinc-700 transition-colors">Remember my account</span>
        </label>
      </div>
      <Button type="submit" isLoading={loginMutation.isPending} loadingText="Authenticating" className="w-full mt-2 bg-[#fe7d02] hover:bg-[#e67002] text-white shadow-neu-btn active:shadow-neu-btn-inset active:translate-y-0.5 hover:scale-[1.01] transition-all duration-200 border-none animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500 fill-mode-both">
        <span>Sign into Dashboard</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
      <div className="pt-6 text-center animate-in fade-in duration-500 delay-700 fill-mode-both">
        <button type="button" onClick={goBack} className="text-xs font-bold text-zinc-500 hover:text-zinc-700 transition-colors">Not your account? Go back</button>
      </div>
    </form>
  );
};

// --- OTP VERIFICATION FORM ---
export const OtpForm = ({ identifier, onNext, goBack, setOtpToken }: any) => {
  const form = useForm({ resolver: zodResolver(otpSchema) });
  const verifyOtpMutation = useVerifyOtp();

  const onSubmit = (data: any) => {
    verifyOtpMutation.mutate({ identifier, otp: data.otp }, {
      onSuccess: (res) => {
        setOtpToken(res.verification_token);
        toast.success('OTP Verified!');
        onNext('SET_PASSWORD');
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Invalid OTP')
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 fill-mode-both">
        <label htmlFor="otp" className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 cursor-pointer select-none">Secure Code</label>
        <Input 
          id="otp"
          type="text"
          icon={<KeyRound size={20} />}
          className="py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl text-center text-lg tracking-widest font-bold focus:ring-0 focus:border-[#fe7d02]/50 text-[#fe7d02] placeholder-zinc-400 transition-all duration-300"
          {...form.register('otp')} 
          placeholder="123456"
          maxLength={6}
          error={form.formState.errors.otp?.message as string}
        />
      </div>
      <Button type="submit" isLoading={verifyOtpMutation.isPending} loadingText="Verifying" className="w-full mt-2 bg-[#fe7d02] hover:bg-[#e67002] text-white shadow-neu-btn active:shadow-neu-btn-inset active:translate-y-0.5 hover:scale-[1.01] transition-all duration-200 border-none animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500 fill-mode-both">
        <span>Verify OTP</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
      <div className="pt-6 text-center animate-in fade-in duration-500 delay-700 fill-mode-both">
        <button type="button" onClick={goBack} className="text-xs font-bold text-zinc-500 hover:text-zinc-700 transition-colors">Wrong email/mobile? Go back</button>
      </div>
    </form>
  );
};

// --- SET PASSWORD FORM ---
export const SetPasswordForm = ({ otpToken }: any) => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const form = useForm({ resolver: zodResolver(setPasswordSchema) });
  const setPasswordMutation = useSetPassword();

  const onSubmit = (data: any) => {
    setPasswordMutation.mutate({ verification_token: otpToken, ...data }, {
      onSuccess: (res) => {
        setAuth(res.user, res.token);
        toast.success('Account setup complete!');
        const isSuperadmin = res.user.roles?.some((r: any) => r.name === 'Superadmin');
        navigate(isSuperadmin ? '/superadmin/dashboard' : '/dashboard');
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to set password')
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2 animate-in slide-in-from-left-4 fade-in duration-500 delay-300 fill-mode-both">
        <label htmlFor="name" className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 cursor-pointer select-none">Full Name</label>
        <Input 
          id="name"
          type="text"
          icon={<User size={20} />}
          className="py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl focus:ring-0 focus:border-[#fe7d02]/50 text-zinc-950 placeholder-zinc-400 transition-all duration-300"
          {...form.register('name')} 
          placeholder="Your Name"
          error={form.formState.errors.name?.message as string}
        />
      </div>
      <div className="space-y-2 animate-in slide-in-from-right-4 fade-in duration-500 delay-400 fill-mode-both">
        <label htmlFor="new_password" className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 cursor-pointer select-none">New Password</label>
        <Input 
          id="new_password"
          type="password"
          icon={<Lock size={20} />}
          className="py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl focus:ring-0 focus:border-[#fe7d02]/50 text-zinc-950 placeholder-zinc-400 transition-all duration-300"
          {...form.register('password')} 
          placeholder="••••••••"
          error={form.formState.errors.password?.message as string}
        />
      </div>
      <div className="space-y-2 animate-in slide-in-from-left-4 fade-in duration-500 delay-500 fill-mode-both">
        <label htmlFor="password_confirmation" className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1 cursor-pointer select-none">Confirm Password</label>
        <Input 
          id="password_confirmation"
          type="password"
          icon={<Lock size={20} />}
          className="py-4 bg-[#f5f5f4] border border-black/5 shadow-neu-light-inset rounded-2xl focus:ring-0 focus:border-[#fe7d02]/50 text-zinc-950 placeholder-zinc-400 transition-all duration-300"
          {...form.register('password_confirmation')} 
          placeholder="••••••••"
          error={form.formState.errors.password_confirmation?.message as string}
        />
      </div>
      <Button type="submit" isLoading={setPasswordMutation.isPending} loadingText="Processing" className="w-full mt-6 bg-[#fe7d02] hover:bg-[#e67002] text-white shadow-neu-btn active:shadow-neu-btn-inset active:translate-y-0.5 hover:scale-[1.01] transition-all duration-200 border-none animate-in slide-in-from-bottom-6 fade-in duration-500 delay-700 fill-mode-both">
        <span>Complete Setup</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
    </form>
  );
};

