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
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  User, Camera, Trash2, Save, Lock, Mail, Phone, Shield,
  Calendar, Loader2, Eye, EyeOff,
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
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-slate-200 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
        
        {/* PageHeader Skeleton */}
        <div className="pt-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-4 relative z-10">
          <Skeleton className="h-10 w-48 rounded-xl bg-slate-200/50 dark:bg-white/5" />
          <Skeleton className="h-5 w-80 rounded-lg bg-slate-200/50 dark:bg-white/5" />
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 relative z-10 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Avatar Skeleton */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-slate-900 dark:bg-[#111115] border border-slate-800 dark:border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
                <Skeleton className="w-40 h-40 rounded-full bg-white/5" />
                <div className="mt-6 flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
                  <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
                </div>
              </div>
            </div>

            {/* Forms Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Form */}
              <div className="bg-white/70 dark:bg-[#111115]/80 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <Skeleton className="w-12 h-12 rounded-2xl bg-slate-200/50 dark:bg-white/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32 rounded-lg bg-slate-200/50 dark:bg-white/5" />
                    <Skeleton className="h-4 w-48 rounded-lg bg-slate-200/50 dark:bg-white/5" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 rounded-lg bg-slate-200/50 dark:bg-white/5" />
                    <Skeleton className="h-12 w-full rounded-xl bg-slate-200/50 dark:bg-white/5" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 rounded-lg bg-slate-200/50 dark:bg-white/5" />
                    <Skeleton className="h-12 w-full rounded-xl bg-slate-200/50 dark:bg-white/5" />
                  </div>
                </div>
              </div>

              {/* Security Form */}
              <div className="bg-slate-900 dark:bg-[#111115] rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <Skeleton className="w-12 h-12 rounded-2xl bg-white/5" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32 rounded-lg bg-white/5" />
                    <Skeleton className="h-4 w-48 rounded-lg bg-white/5" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded-lg bg-white/5" />
                    <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 rounded-lg bg-white/5" />
                      <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 rounded-lg bg-white/5" />
                      <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-slate-200 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-40 -left-40 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <PageHeader
        icon={User}
        title="My Profile"
        subtitle="Manage your personal information, avatar, and security settings"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 relative z-10">

        {/* ═══════════ Avatar & Info Banner ═══════════ */}
        <div className="group relative bg-white/70 dark:bg-[#111115]/80 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500">
          {/* Banner Gradient */}
          <div className="h-40 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div className="px-8 pb-8 relative flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            {/* Avatar Container with Glow */}
            <div className="relative -mt-16 md:-mt-20">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <div className="relative w-32 h-32 rounded-2xl border-4 border-white dark:border-[#111115] shadow-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 transform group-hover:-translate-y-1 transition duration-500">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-500/10 dark:to-primary-500/5">
                    <span className="text-4xl font-black text-primary-500 uppercase tracking-tighter">
                      {profile?.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                
                {/* Overlay buttons */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
                    title="Upload Photo"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  {profile?.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="w-10 h-10 bg-rose-500/80 hover:bg-rose-500 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-5 h-5" />
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
                <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Name & Meta Info */}
            <div className="text-center md:text-left flex-1 pb-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {profile?.name}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                {profile?.roles?.map((role: any) => (
                  <div key={role.id || role.name || role} className="flex items-center px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 shadow-sm">
                    <Shield className="w-3.5 h-3.5 text-primary-500 mr-1.5" />
                    <span className="text-[11px] font-black uppercase tracking-[0.15em] text-primary-700 dark:text-primary-400">
                      {role.name || role}
                    </span>
                  </div>
                ))}
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full border border-slate-200 dark:border-white/5">
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  Joined {profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* ═══════════ Personal Info Form ═══════════ */}
          <div className="lg:col-span-3 bg-white/70 dark:bg-[#111115]/80 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="mb-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-100 dark:border-primary-500/20 shadow-inner">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Personal Information</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Update your identity details</p>
              </div>
            </div>

            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2 ml-1">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <Input
                    {...profileForm.register('name')}
                    placeholder="E.g. Jane Doe"
                    className="h-12 bg-slate-50/50 dark:bg-[#0a0a0c] border-slate-200 dark:border-white/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-rose-500 font-bold ml-1">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2 ml-1">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <Input
                    {...profileForm.register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="h-12 bg-slate-50/50 dark:bg-[#0a0a0c] border-slate-200 dark:border-white/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-xs text-rose-500 font-bold ml-1">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2 ml-1">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </label>
                  <Input
                    {...profileForm.register('phone')}
                    placeholder="+1 (555) 000-0000"
                    className="h-12 bg-slate-50/50 dark:bg-[#0a0a0c] border-slate-200 dark:border-white/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end">
                <Button
                  type="submit"
                  disabled={updateProfile.isPending || !profileForm.formState.isDirty}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-8 h-12 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5"
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

          {/* ═══════════ Change Password Form ═══════════ */}
          <div className="lg:col-span-2 bg-slate-900 dark:bg-[#111115] border border-slate-800 dark:border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            {/* Dark abstract glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
            
            <div className="mb-8 flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary-400 border border-white/10 shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">Security</h3>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Update your password</p>
              </div>
            </div>

            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5 relative z-10">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    {...passwordForm.register('current_password')}
                    type={showCurrentPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-12 bg-black/40 border-white/10 rounded-xl text-sm font-semibold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 pr-12 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.current_password && (
                  <p className="text-xs text-rose-400 font-bold ml-1">{passwordForm.formState.errors.current_password.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    {...passwordForm.register('new_password')}
                    type={showNewPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-12 bg-black/40 border-white/10 rounded-xl text-sm font-semibold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 pr-12 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordForm.formState.errors.new_password && (
                  <p className="text-xs text-rose-400 font-bold ml-1">{passwordForm.formState.errors.new_password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                  Confirm Password
                </label>
                <Input
                  {...passwordForm.register('new_password_confirmation')}
                  type={showNewPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-12 bg-black/40 border-white/10 rounded-xl text-sm font-semibold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-inner"
                />
                {passwordForm.formState.errors.new_password_confirmation && (
                  <p className="text-xs text-rose-400 font-bold ml-1">{passwordForm.formState.errors.new_password_confirmation.message}</p>
                )}
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="w-full bg-white text-slate-900 hover:bg-slate-200 h-12 text-xs font-black uppercase tracking-[0.15em] rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02]"
                >
                  {changePassword.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
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
