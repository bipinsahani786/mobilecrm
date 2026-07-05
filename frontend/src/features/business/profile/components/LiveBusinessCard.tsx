import { useRef } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { Image } from '@/components/ui/image';

interface LiveBusinessCardProps {
  formData: any;
}

export const LiveBusinessCard = ({ formData }: LiveBusinessCardProps) => {
  const getThemeClasses = (themeStr?: string) => {
    switch (themeStr) {
      case 'primary': return 'bg-gradient-to-br from-[#fe7d02] to-orange-700';
      case 'blue': return 'bg-gradient-to-br from-blue-900 to-indigo-900';
      case 'green': return 'bg-gradient-to-br from-emerald-900 to-teal-900';
      case 'purple': return 'bg-gradient-to-br from-purple-900 to-fuchsia-900';
      case 'dark':
      default: return 'bg-gradient-to-br from-slate-900 to-slate-800';
    }
  };

  const themeClasses = getThemeClasses(formData.card_preferences?.theme);
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3, // High quality for printing
      });
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${formData.name || 'Business'}_Card.png`;
      link.click();
      toast.success('Business card downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download card');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      <div 
        ref={cardRef}
        className={`w-full min-h-[220px] sm:min-h-[240px] relative rounded-xl overflow-hidden shadow-xl ${themeClasses} text-white p-5 sm:p-6 flex flex-col border border-white/10 transition-all duration-300`}
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

        {/* TOP SECTION: Name, Desc & Logo */}
        <div className="relative z-10 flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight line-clamp-2 break-words leading-tight">
              {formData.name || 'Your Business Name'}
            </h2>
            {formData.description && (
              <p className="text-[9px] sm:text-[11px] text-slate-300 sm:text-slate-400 mt-1 line-clamp-2 break-words leading-snug">{formData.description}</p>
            )}
          </div>
          {formData.logo_path ? (
            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-white/10 rounded-lg p-1.5 backdrop-blur-sm border border-white/5 flex items-center justify-center overflow-hidden">
               <Image src={formData.logo_path} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-white/5 rounded-lg border border-white/5 flex items-center justify-center text-slate-500 text-[9px] sm:text-xs text-center">
              No Logo
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: Contacts (Left) & Signature (Right) */}
        <div className="relative z-10 flex justify-between items-end gap-2 mt-auto pt-4">
          
          {/* Contacts */}
          <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0 pr-2">
            {formData.card_preferences?.show_phone_2 !== false && (formData.phone || formData.phone_2) && (
               <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-200 min-w-0 w-full">
                 <div className="p-1 rounded-full bg-white/5 shrink-0">
                   <Phone className="w-3 h-3 text-primary-400" />
                 </div>
                 <span className="truncate">
                   {formData.phone || ''}
                   {formData.phone && formData.phone_2 ? ' / ' : ''}
                   {formData.phone_2 || ''}
                 </span>
               </div>
            )}
            
            {formData.card_preferences?.show_email !== false && formData.email && (
               <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-200 min-w-0 w-full">
                 <div className="p-1 rounded-full bg-white/5 shrink-0">
                   <Mail className="w-3 h-3 text-primary-400" />
                 </div>
                 <span className="truncate">{formData.email}</span>
               </div>
            )}

            {formData.card_preferences?.show_address !== false && formData.address && (
               <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-200 min-w-0 w-full">
                 <div className="p-1 rounded-full bg-white/5 shrink-0">
                   <MapPin className="w-3 h-3 text-primary-400" />
                 </div>
                 <span className="line-clamp-2 break-words text-left leading-tight">
                   {formData.address}
                   {formData.state ? `, ${formData.state}` : ''}
                   {formData.pincode ? ` - ${formData.pincode}` : ''}
                 </span>
               </div>
            )}
            
            {formData.card_preferences?.show_gst !== false && formData.gst_number && (
               <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-200 min-w-0 w-full">
                 <div className="p-1 rounded-full bg-white/5 shrink-0">
                   <CheckCircle2 className="w-3 h-3 text-primary-400" />
                 </div>
                 <span className="font-medium tracking-wide truncate">GST: {formData.gst_number.toUpperCase()}</span>
               </div>
            )}
          </div>
          
          {/* Signature */}
          {formData.signature_path && (
            <div className="shrink-0 text-center flex flex-col items-end">
              <div className="bg-white/95 px-1.5 py-0.5 rounded shadow-sm inline-block">
                <Image src={formData.signature_path} alt="Signature" className="h-7 sm:h-10 w-auto object-contain mix-blend-multiply" />
              </div>
              <p className="text-[7px] sm:text-[8px] text-white/50 mt-1 uppercase tracking-[0.2em] font-medium mr-1">Auth. Sign</p>
            </div>
          )}
        </div>
      </div>

      <Button onClick={downloadCard} className="mt-8 w-full shadow-lg shadow-primary-500/25 font-bold tracking-wide">
        <Download className="w-4 h-4 mr-2" />
        Download Digital Card
      </Button>
    </div>
  );
};
