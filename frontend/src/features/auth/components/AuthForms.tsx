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
import { AuthFormSkeleton } from './AuthFormSkeleton';

// Higher Order Component to add Skeleton aesthetic
const withSkeleton = (Component: React.FC<any>) => {
  return function WrappedComponent(props: any) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Modern aesthetic: brief skeleton flash when transitioning forms
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }, []);

    if (loading) return <AuthFormSkeleton />;
    return <Component {...props} />;
  }
}

// --- IDENTIFIER FORM ---
export const IdentifierForm = withSkeleton(({ onNext, setIdentifier }: any) => {
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <label htmlFor="identifier" className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 cursor-pointer select-none">Identity</label>
        <Input 
          id="identifier"
          icon={<User size={20} />}
          className="py-3.5 rounded-xl text-[15px]"
          {...form.register('identifier')} 
          placeholder="Email or 10-digit Phone"
          error={form.formState.errors.identifier?.message as string}
        />
      </div>
      <Button type="submit" isLoading={checkUserMutation.isPending || sendOtpMutation.isPending} loadingText="Processing" className="w-full mt-2">
        <span>Continue</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
    </form>
  );
});

// --- LOGIN PASSWORD FORM ---
export const LoginForm = withSkeleton(({ identifier, goBack }: any) => {
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <label htmlFor="password" className="text-xs font-bold text-zinc-400 uppercase tracking-widest cursor-pointer select-none">Secret</label>
          <a href="#" className="text-xs font-bold text-[#fe7d02] hover:text-[#e67002] transition-colors">Forgot Password?</a>
        </div>
        <Input 
          id="password"
          type="password"
          icon={<Lock size={20} />}
          className="py-3.5 rounded-xl text-[15px]"
          {...form.register('password')} 
          placeholder="••••••••"
          error={form.formState.errors.password?.message as string}
        />
      </div>
      <div className="flex items-center px-1 justify-between">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center">
            <input type="checkbox" className="peer hidden" />
            <div className="w-5 h-5 border-2 border-zinc-700 rounded-md peer-checked:bg-[#fe7d02] peer-checked:border-[#fe7d02] transition-all"></div>
            <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity left-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-400 group-hover:text-white transition-colors">Remember my account</span>
        </label>
      </div>
      <Button type="submit" isLoading={loginMutation.isPending} loadingText="Authenticating" className="w-full mt-2">
        <span>Sign into Dashboard</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
      <div className="pt-8 text-center">
        <button type="button" onClick={goBack} className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Not your account? Go back</button>
      </div>
    </form>
  );
});

// --- OTP VERIFICATION FORM ---
export const OtpForm = withSkeleton(({ identifier, onNext, goBack, setOtpToken }: any) => {
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <label htmlFor="otp" className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 cursor-pointer select-none">Secure Code</label>
        <Input 
          id="otp"
          type="text"
          icon={<KeyRound size={20} />}
          className="py-3.5 rounded-xl text-center text-lg tracking-widest font-bold"
          {...form.register('otp')} 
          placeholder="123456"
          maxLength={6}
          error={form.formState.errors.otp?.message as string}
        />
      </div>
      <Button type="submit" isLoading={verifyOtpMutation.isPending} loadingText="Verifying" className="w-full mt-2">
        <span>Verify OTP</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
      <div className="pt-8 text-center">
        <button type="button" onClick={goBack} className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Wrong email/mobile? Go back</button>
      </div>
    </form>
  );
});

// --- SET PASSWORD FORM ---
export const SetPasswordForm = withSkeleton(({ otpToken }: any) => {
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <label htmlFor="name" className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 cursor-pointer select-none">Full Name</label>
        <Input 
          id="name"
          type="text"
          icon={<User size={20} />}
          className="py-3.5 rounded-xl text-[15px]"
          {...form.register('name')} 
          placeholder="Your Name"
          error={form.formState.errors.name?.message as string}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="new_password" className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 cursor-pointer select-none">New Password</label>
        <Input 
          id="new_password"
          type="password"
          icon={<Lock size={20} />}
          className="py-3.5 rounded-xl text-[15px]"
          {...form.register('password')} 
          placeholder="••••••••"
          error={form.formState.errors.password?.message as string}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password_confirmation" className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 cursor-pointer select-none">Confirm Password</label>
        <Input 
          id="password_confirmation"
          type="password"
          icon={<Lock size={20} />}
          className="py-3.5 rounded-xl text-[15px]"
          {...form.register('password_confirmation')} 
          placeholder="••••••••"
          error={form.formState.errors.password_confirmation?.message as string}
        />
      </div>
      <Button type="submit" isLoading={setPasswordMutation.isPending} loadingText="Processing" className="w-full mt-8">
        <span>Complete Setup</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </Button>
    </form>
  );
});
