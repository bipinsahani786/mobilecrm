import React, { useState, useEffect } from 'react';
import { MessageCircle, Save, HelpCircle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WhatsAppSettingsProps {
  settings: any;
  onSave: (settings: any) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_INVOICE_TEMPLATE = "Hello *[Customer Name]*,\n\nThank you for shopping with us! Your invoice *[Invoice Number]* for Rs.*[Amount]* has been generated.\n\nView or download your invoice here:\n[Invoice Link]\n\nRegards,\n*[Business Name]*";

export function WhatsAppSettings({ settings, onSave, isLoading }: WhatsAppSettingsProps) {
  const [invoiceTemplate, setInvoiceTemplate] = useState(DEFAULT_INVOICE_TEMPLATE);

  useEffect(() => {
    if (settings?.whatsapp_invoice_template) {
      setInvoiceTemplate(settings.whatsapp_invoice_template);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await onSave({
        ...settings,
        whatsapp_invoice_template: invoiceTemplate
      });
      toast.success("WhatsApp template saved successfully!");
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const insertVariable = (variable: string) => {
    setInvoiceTemplate(prev => prev + variable);
  };

  // Generate a live preview
  const livePreview = invoiceTemplate
    .replace(/\[Customer Name\]/g, 'John Doe')
    .replace(/\[Invoice Number\]/g, 'INV-2023-001')
    .replace(/\[Amount\]/g, '1,499.00')
    .replace(/\[Invoice Link\]/g, 'https://mobilecrm.com/inv/xyz123')
    .replace(/\[Business Name\]/g, 'SuperMart Mobile Shop');

  return (
    <div className="bg-white dark:bg-[#111118] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden mt-6 mb-6">
      <div className="p-5 border-b border-slate-200 dark:border-white/5 bg-emerald-50/50 dark:bg-emerald-900/10">
        <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-500 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
          WhatsApp Settings
        </h3>
        <p className="text-xs text-emerald-700/70 dark:text-emerald-500/70 mt-1">Configure the default message sent when you share an invoice via WhatsApp.</p>
      </div>
      
      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Editor Side */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2 block">Invoice Message Template</label>
            <textarea 
              value={invoiceTemplate}
              onChange={(e) => setInvoiceTemplate(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none resize-none"
              placeholder="Enter your message template here..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Available Variables
            </label>
            <div className="flex flex-wrap gap-2">
              {['[Customer Name]', '[Invoice Number]', '[Amount]', '[Invoice Link]', '[Business Name]'].map(variable => (
                <button
                  key={variable}
                  onClick={() => insertVariable(variable)}
                  className="px-2 py-1 text-[10px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  {variable}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 italic">Click a variable to insert it at the end of your message.</p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 rounded-xl py-6"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            SAVE TEMPLATE
          </Button>
        </div>

        {/* Preview Side */}
        <div className="space-y-4">
           <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-2 block">Live Preview</label>
           
           {/* WhatsApp Chat Bubble Mockup */}
           <div className="bg-[#e5ddd5] dark:bg-[#0b141a] p-4 rounded-xl h-full border border-slate-200 dark:border-white/5 relative overflow-hidden flex flex-col">
              {/* WhatsApp Header fake */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-[#075e54] dark:bg-[#202c33] flex items-center px-4 shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-slate-200/20 mr-3 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white/50" />
                 </div>
                 <div>
                    <div className="text-white text-sm font-semibold">Customer (Preview)</div>
                 </div>
              </div>

              <div className="mt-16 bg-white dark:bg-[#202c33] rounded-lg p-3 shadow-sm max-w-[85%] self-start relative">
                 <p className="text-sm text-slate-800 dark:text-[#e9edef] whitespace-pre-wrap leading-relaxed font-sans">
                   {livePreview}
                 </p>
                 <div className="text-right mt-1">
                   <span className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center justify-end gap-1">
                     12:00 PM <Check className="w-3 h-3 text-[#53bdeb]" />
                   </span>
                 </div>
                 {/* Chat bubble tail */}
                 <div className="absolute top-0 -left-2 w-0 h-0 border-[8px] border-transparent border-t-white dark:border-t-[#202c33] border-r-white dark:border-r-[#202c33]" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
