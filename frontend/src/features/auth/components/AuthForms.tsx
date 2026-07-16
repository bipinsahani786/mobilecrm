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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full mx-auto">
      <div className="space-y-2 animate-in slide-in-from-left-4 fade-in duration-500 delay-200 fill-mode-both">
        <label htmlFor="identifier" className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 cursor-pointer select-none">Identity</label>
        <Input 
          id="identifier"
          icon={<User size={20} />}
          className="h-12 bg-white dark:bg-[#151726] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all duration-300"
          {...form.register('identifier')} 
          placeholder="Email or Phone"
          error={form.formState.errors.identifier?.message as string}
        />
      </div>
      <Button type="submit" isLoading={checkUserMutation.isPending || sendOtpMutation.isPending} loadingText="Processing" className="w-full h-12 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-md shadow-primary-500/15 active:translate-y-0.5 transition-all duration-200 border-none animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 fill-mode-both">
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
      onError: (err: any) => {
        const errorMsg = err.response?.data?.errors 
          ? (Object.values(err.response.data.errors)[0] as any)?.[0] as string
          : err.response?.data?.message;
        toast.error(errorMsg || 'Login failed');
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full mx-auto">
      <div className="space-y-2 animate-in slide-in-from-right-4 fade-in duration-500 delay-200 fill-mode-both">
        <div className="flex justify-between items-center px-1">
          <label htmlFor="password" className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest cursor-pointer select-none">Secret</label>
          <a href="#" className="text-xs font-bold text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">Forgot Password?</a>
        </div>
        <Input 
          id="password"
          type="password"
          icon={<Lock size={20} />}
          className="h-12 bg-white dark:bg-[#151726] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all duration-300"
          {...form.register('password')} 
          placeholder="••••••••"
          error={form.formState.errors.password?.message as string}
        />
      </div>
      <div className="flex items-center px-1 justify-between animate-in slide-in-from-left-4 fade-in duration-500 delay-300 fill-mode-both">
        <label className="flex items-center gap-3 cursor-pointer group select-none">
          <div className="relative flex items-center">
            <input type="checkbox" className="peer hidden" />
            <div className="w-5 h-5 bg-white dark:bg-[#151726] border border-slate-200 dark:border-white/10 rounded-lg transition-all peer-checked:border-primary-500 peer-checked:bg-primary-500/10"></div>
            <svg className="absolute w-3.5 h-3.5 text-primary-500 opacity-0 scale-50 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300 left-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">Remember my account</span>
        </label>
      </div>
      <Button type="submit" isLoading={loginMutation.isPending} loadingText="Authenticating" className="w-full h-12 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-primary-500/15 active:translate-y-0.5 transition-all duration-200 border-none animate-in slide-in-from-bottom-4 fade-in duration-500 delay-400 fill-mode-both">
        <span>Sign into Dashboard</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
      <div className="pt-3 text-center animate-in fade-in duration-500 delay-500 fill-mode-both">
        <button type="button" onClick={goBack} className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Not your account? Go back</button>
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
      onError: (err: any) => {
        const errorMsg = err.response?.data?.errors 
          ? (Object.values(err.response.data.errors)[0] as any)?.[0] as string
          : err.response?.data?.message;
        toast.error(errorMsg || 'Invalid OTP');
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full mx-auto">
      <div className="space-y-2 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 fill-mode-both">
        <label htmlFor="otp" className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 cursor-pointer select-none">Secure Code</label>
        <Input 
          id="otp"
          type="text"
          icon={<KeyRound size={20} />}
          className="h-12 bg-white dark:bg-[#151726] border border-slate-200 dark:border-white/10 rounded-xl text-center text-base tracking-widest font-black focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-primary-500 dark:text-primary-400 placeholder-slate-400 dark:placeholder-zinc-500 transition-all duration-300"
          {...form.register('otp')} 
          placeholder="123456"
          maxLength={6}
          error={form.formState.errors.otp?.message as string}
        />
      </div>
      <Button type="submit" isLoading={verifyOtpMutation.isPending} loadingText="Verifying" className="w-full h-12 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-lg shadow-primary-500/15 active:translate-y-0.5 transition-all duration-200 border-none animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 fill-mode-both">
        <span>Verify OTP</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
      <div className="pt-3 text-center animate-in fade-in duration-500 delay-400 fill-mode-both">
        <button type="button" onClick={goBack} className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Wrong email/mobile? Go back</button>
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
      onError: (err: any) => {
        const errorMsg = err.response?.data?.errors 
          ? (Object.values(err.response.data.errors)[0] as any)?.[0] as string
          : err.response?.data?.message;
        toast.error(errorMsg || 'Failed to set password');
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full mx-auto">
      <div className="space-y-2 animate-in slide-in-from-left-4 fade-in duration-500 delay-200 fill-mode-both">
        <label htmlFor="name" className="text-xs font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest ml-1 cursor-pointer select-none">Full Name</label>
        <Input 
          id="name"
          type="text"
          icon={<User size={20} />}
          className="h-12 bg-white dark:bg-[#151726] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all duration-300"
          {...form.register('name')} 
          placeholder="Your Name"
          error={form.formState.errors.name?.message as string}
        />
      </div>
      <div className="space-y-2 animate-in slide-in-from-right-4 fade-in duration-500 delay-300 fill-mode-both">
        <label htmlFor="new_password" className="text-xs font-black text-slate-555 dark:text-slate-400 uppercase tracking-widest ml-1 cursor-pointer select-none">New Password</label>
        <Input 
          id="new_password"
          type="password"
          icon={<Lock size={20} />}
          className="h-12 bg-white dark:bg-[#151726] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all duration-300"
          {...form.register('password')} 
          placeholder="••••••••"
          error={form.formState.errors.password?.message as string}
        />
      </div>
      <div className="space-y-2 animate-in slide-in-from-left-4 fade-in duration-500 delay-400 fill-mode-both">
        <label htmlFor="password_confirmation" className="text-xs font-black text-slate-555 dark:text-slate-400 uppercase tracking-widest ml-1 cursor-pointer select-none">Confirm Password</label>
        <Input 
          id="password_confirmation"
          type="password"
          icon={<Lock size={20} />}
          className="h-12 bg-white dark:bg-[#151726] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all duration-300"
          {...form.register('password_confirmation')} 
          placeholder="••••••••"
          error={form.formState.errors.password_confirmation?.message as string}
        />
      </div>
      <Button type="submit" isLoading={setPasswordMutation.isPending} loadingText="Processing" className="w-full h-12 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white shadow-lg shadow-primary-500/15 active:translate-y-0.5 transition-all duration-200 border-none animate-in slide-in-from-bottom-6 fade-in duration-500 delay-500 fill-mode-both">
        <span>Complete Setup</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
    </form>
  );
};
