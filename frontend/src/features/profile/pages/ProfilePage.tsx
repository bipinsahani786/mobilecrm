import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useRemoveAvatar,
  useChangePassword,
} from '../api/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  User, Camera, Trash2, Save, Lock, Mail, Phone, Shield,
  Calendar, Loader2, Eye, EyeOff, KeyRound, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

// ── Schemas ──
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional().or(z.literal('')),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Min 8 characters'),
  new_password_confirmation: z.string().min(8, 'Min 8 characters'),
}).refine((d) => d.new_password === d.new_password_confirmation, {
  message: 'Passwords do not match',
  path: ['new_password_confirmation'],
});
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: profileData, isLoading } = useProfile();
  const profile = profileData?.data;

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const changePassword = useChangePassword();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // ── Profile form ──
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  // ── Handlers ──
  const onProfileSubmit = async (data: ProfileValues) => {
    try {
      await updateProfile.mutateAsync(data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: PasswordValues) => {
    try {
      await changePassword.mutateAsync(data);
      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error: any) {
      const msg = error.response?.data?.errors?.current_password?.[0]
        || error.response?.data?.message
        || 'Failed to change password';
      toast.error(msg);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }
    try {
      await uploadAvatar.mutateAsync(file);
      toast.success('Avatar uploaded!');
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar.mutateAsync();
      toast.success('Avatar removed');
    } catch {
      toast.error('Failed to remove avatar');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07070a] text-slate-900 dark:text-slate-200 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none" />
        
        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 pb-6 space-y-6 z-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-pulse">
            
            {/* Header Banner Skeleton */}
            <div className="col-span-1 lg:col-span-5 bg-white/50 dark:bg-[#111118]/50 border border-slate-200/50 dark:border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-2xl bg-slate-200/50 dark:bg-white/5" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-8 w-44 rounded-lg bg-slate-200/50 dark:bg-white/5" />
                <Skeleton className="h-4 w-60 rounded-md bg-slate-200/50 dark:bg-white/5" />
              </div>
            </div>

            {/* Profile Form Skeleton */}
            <div className="lg:col-span-3 bg-white/50 dark:bg-[#111118]/50 border border-slate-200/50 dark:border-white/5 rounded-3xl p-8 space-y-6">
              <Skeleton className="h-6 w-36 rounded-md bg-slate-200/50 dark:bg-white/5" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl bg-slate-200/50 dark:bg-white/5" />
                <Skeleton className="h-12 w-full rounded-xl bg-slate-200/50 dark:bg-white/5" />
                <Skeleton className="h-12 w-full rounded-xl bg-slate-200/50 dark:bg-white/5" />
              </div>
            </div>

            {/* Security Form Skeleton */}
            <div className="lg:col-span-2 bg-white/50 dark:bg-[#111118]/50 border border-slate-200/50 dark:border-white/5 rounded-3xl p-8 space-y-6">
              <Skeleton className="h-6 w-36 rounded-md bg-slate-200/50 dark:bg-white/5" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl bg-slate-200/50 dark:bg-white/5" />
                <Skeleton className="h-12 w-full rounded-xl bg-slate-200/50 dark:bg-white/5" />
                <Skeleton className="h-12 w-full rounded-xl bg-slate-200/50 dark:bg-white/5" />
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07070a] text-slate-900 dark:text-slate-200 relative overflow-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-500/[0.04] dark:bg-primary-500/[0.02] rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.02] rounded-full blur-[120px] animate-float2 pointer-events-none" />

      {/* Outer grid shifted up (pt-2) and stretched wider (max-w-[1600px]) towards the left sidebar */}
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 pb-6 space-y-6 z-20">

        {/* ═══════════ Banner & Profile Photo Card ═══════════ */}
        <div className="group relative bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none transition-all duration-300">
          
          {/* Header Cover Background */}
          <div className="h-44 bg-gradient-to-r from-primary-600 via-indigo-600 to-violet-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          <div className="px-6 pb-6 relative flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mt-4 md:mt-0">
            
            {/* Squircle Avatar Container with Hover Upload (overlapping banner) */}
            <div className="relative -mt-14 md:-mt-16 z-20">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary-400 to-indigo-500 rounded-[2.2rem] blur opacity-25 group-hover:opacity-40 transition duration-500" />
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] border-4 border-white dark:border-[#111118] shadow-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 transform group-hover:-translate-y-1 transition duration-500">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-800">
                    <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-primary-500 to-indigo-500 uppercase">
                      {profile?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                
                {/* Upload Overlays */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2.5 backdrop-blur-sm">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 bg-white/20 hover:bg-white/35 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
                    title="Upload Photo"
                  >
                    <Camera className="w-4.5 h-4.5" />
                  </button>
                  {profile?.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="w-9 h-9 bg-rose-500/80 hover:bg-rose-500 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />

              {uploadAvatar.isPending && (
                <div className="absolute inset-0 rounded-[2rem] bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Name, Roles, and Join Date (positioned safely below the dark banner) */}
            <div className="text-center md:text-left flex-1 pb-1">
              <span className="text-[9px] bg-primary-500/10 border border-primary-500/20 text-primary-500 px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] mb-2 inline-block">
                My Profile
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2.5">
                {profile?.name}
                <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" />
                  Active Account
                </span>
              </h2>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                {profile?.roles?.map((role: any) => (
                  <div key={role.id || role.name || role} className="flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
                    <Shield className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400 mr-1.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {role.name || role}
                    </span>
                  </div>
                ))}
                
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.03] px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ Forms Grid Container ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Personal Info Card (3/5 Grid size on PC, full on mobile) */}
          <div className="lg:col-span-3 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/10 dark:shadow-none hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            
            <div>
              <div className="mb-6 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-100/50 dark:border-primary-500/10 shadow-inner">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight">Personal Details</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-0.5">Manage your user profile identity</p>
                </div>
              </div>

              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-555 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <User className="w-3.5 h-3.5" /> Full Name
                    </label>
                    <div className="relative">
                      <Input
                        {...profileForm.register('name')}
                        placeholder="Name"
                        className="h-11 bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all pl-10"
                      />
                    </div>
                    {profileForm.formState.errors.name && (
                      <p className="text-xs text-rose-500 font-bold ml-1">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-555 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </label>
                    <div className="relative">
                      <Input
                        {...profileForm.register('email')}
                        type="email"
                        placeholder="you@example.com"
                        className="h-11 bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all pl-10"
                      />
                    </div>
                    {profileForm.formState.errors.email && (
                      <p className="text-xs text-rose-500 font-bold ml-1">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-555 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </label>
                    <div className="relative">
                      <Input
                        {...profileForm.register('phone')}
                        placeholder="+91 XXXXX XXXXX"
                        className="h-11 bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateProfile.isPending || !profileForm.formState.isDirty}
                    className="bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white px-8 h-11 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
                  >
                    {updateProfile.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Profile
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Change Password Card (2/5 Grid size on PC, full on mobile) */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-slate-200/10 dark:shadow-none hover:shadow-2xl transition-all duration-300">
            
            <div className="mb-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-100/50 dark:border-primary-500/10 shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight">Security Credentials</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-0.5">Manage password credentials</p>
              </div>
            </div>

            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest ml-1">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    {...passwordForm.register('current_password')}
                    type={showCurrentPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 pr-12 transition-all pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.current_password && (
                  <p className="text-xs text-rose-500 font-bold ml-1">{passwordForm.formState.errors.current_password.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest ml-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    {...passwordForm.register('new_password')}
                    type={showNewPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 pr-12 transition-all pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.new_password && (
                  <p className="text-xs text-rose-500 font-bold ml-1">{passwordForm.formState.errors.new_password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest ml-1">
                  Confirm Password
                </label>
                <Input
                  {...passwordForm.register('new_password_confirmation')}
                  type={showNewPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/10 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all pl-10"
                />
                {passwordForm.formState.errors.new_password_confirmation && (
                  <p className="text-xs text-rose-500 font-bold ml-1">{passwordForm.formState.errors.new_password_confirmation.message}</p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="w-full bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white h-11 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
                >
                  {changePassword.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4 mr-2" />
                  )}
                  Update Password
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
