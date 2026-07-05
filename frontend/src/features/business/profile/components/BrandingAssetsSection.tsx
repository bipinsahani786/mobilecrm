import React from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Image } from '@/components/ui/image';

interface Props {
  logoPreview: string | null;
  sigPreview: string | null;
  isUploadingLogo: boolean;
  isUploadingSig: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => void;
}

export function BrandingAssetsSection({
  logoPreview,
  sigPreview,
  isUploadingLogo,
  isUploadingSig,
  onFileUpload
}: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-white/5 pb-2">Branding Assets</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Logo Upload */}
        <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center text-center">
          {logoPreview ? (
            <div className="relative group w-full h-20 flex items-center justify-center">
              <Image src={logoPreview} alt="Logo" className="max-h-20 w-auto object-contain rounded" fallbackText="Logo Error" />
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded">
                <UploadCloud className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload(e, 'logo')} />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center">
              {isUploadingLogo ? <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" /> : <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />}
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload Logo</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload(e, 'logo')} disabled={isUploadingLogo} />
            </label>
          )}
        </div>

        {/* Signature Upload */}
        <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center text-center">
          {sigPreview ? (
            <div className="relative group w-full h-16 flex items-center justify-center bg-white rounded p-1">
              <Image src={sigPreview} alt="Signature" className="max-h-14 w-auto object-contain" fallbackText="Sig Error" />
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded">
                <UploadCloud className="w-6 h-6 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload(e, 'signature')} />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center">
              {isUploadingSig ? <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" /> : <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />}
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload Signature</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileUpload(e, 'signature')} disabled={isUploadingSig} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
