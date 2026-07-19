import React from 'react';
import { Upload, X, Loader2, FileText, Image as ImageIcon, Printer } from 'lucide-react';

interface InvoicePrintSettingsProps {
  headerUrl: string | null;
  footerUrl: string | null;
  isUploadingHeader: boolean;
  isUploadingFooter: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'header' | 'footer') => void;
  onRemove: (type: 'header' | 'footer') => void;
}

export function InvoicePrintSettings({
  headerUrl,
  footerUrl,
  isUploadingHeader,
  isUploadingFooter,
  onUpload,
  onRemove
}: InvoicePrintSettingsProps) {
  
  const renderUploader = (type: 'header' | 'footer', url: string | null, isUploading: boolean, title: string, desc: string) => {
    return (
      <div className="flex flex-col md:flex-row gap-6 items-start p-5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {type === 'header' ? <ImageIcon className="w-4 h-4 text-primary-500" /> : <FileText className="w-4 h-4 text-primary-500" />}
            {title}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
        
        <div className="w-full md:w-64 shrink-0">
          {url ? (
            <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 aspect-[3/1] flex items-center justify-center">
              <img src={url} alt={title} className="max-w-full max-h-full object-contain p-2" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => onRemove(type)}
                  className="w-8 h-8 flex items-center justify-center bg-rose-500 text-white rounded-full hover:bg-rose-600 hover:scale-110 transition-all shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[3/1]">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onUpload(e, type)}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg transition-colors ${
                isUploading 
                  ? 'border-primary-500/50 bg-primary-500/5' 
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 group-hover:border-primary-500/50'
              }`}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                    <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400" />
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Upload Image</span>
                      <span className="text-[9px] text-slate-400">JPG, PNG (Max 2MB)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#111118] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden mt-6 mb-6">
      <div className="p-5 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Printer className="w-4 h-4 text-primary-500" />
          Invoice Print Settings
        </h3>
        <p className="text-xs text-slate-500 mt-1">Upload your letterhead graphics to generate professional PDF invoices.</p>
      </div>
      
      <div className="p-5 space-y-4">
        {renderUploader(
          'header',
          headerUrl,
          isUploadingHeader,
          'Invoice Header (Top Banner)',
          'This image will appear at the very top of your PDF invoices. Ideal for full-width letterhead designs. Recommended width: 1000px.'
        )}
        
        {renderUploader(
          'footer',
          footerUrl,
          isUploadingFooter,
          'Invoice Footer (Bottom Banner)',
          'This image will appear at the bottom of the PDF. Ideal for terms, signatures, or company addresses. Recommended width: 1000px.'
        )}
      </div>
    </div>
  );
}
