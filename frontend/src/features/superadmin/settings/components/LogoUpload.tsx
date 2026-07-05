import React, { useRef } from 'react';
import { Image as ImageIcon, Camera, Loader2, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useUploadLogo, useUpdateSettings } from '../api/useSettings';

export function LogoUpload() {
  const { appLogo } = useAppStore();
  const uploadLogo = useUploadLogo();
  const updateSettings = useUpdateSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    uploadLogo.mutate(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    updateSettings.mutate({
      app_logo: '',
    });
  };

  return (
    <div className="lg:col-span-2 bg-slate-900 dark:bg-[#111115] border border-slate-800 dark:border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
      {/* Dark abstract glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="mb-8 flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary-400 border border-white/10 shadow-inner">
          <ImageIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">Platform Logo</h3>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Upload brand logo</p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center py-6">
        <div className="relative group/logo">
          <div className="absolute -inset-1 bg-gradient-to-br from-primary-400/50 to-primary-600/50 rounded-2xl blur opacity-30 group-hover/logo:opacity-60 transition duration-500" />
          <div className="relative w-40 h-40 rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            {appLogo ? (
              <img src={appLogo} alt="Platform Logo" className="max-w-full max-h-full object-contain transition duration-700 group-hover/logo:scale-110" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <ImageIcon className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase tracking-widest">No Logo</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/logo:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
                title="Upload Logo"
              >
                <Camera className="w-5 h-5" />
              </button>
              {appLogo && (
                <button
                  onClick={handleRemoveLogo}
                  className="w-10 h-10 bg-rose-500/80 hover:bg-rose-500 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg"
                  title="Remove Logo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleLogoUpload}
          />

          {uploadLogo.isPending && (
            <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Recommended size: 512x512px
          </p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
            PNG, JPG, WEBP, or SVG
          </p>
        </div>
      </div>
    </div>
  );
}
