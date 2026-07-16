import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/DatePicker';
import { CheckCircle2 } from 'lucide-react';

interface MarkReceivedModalProps {
  isOpen: boolean;
  onClose: () => void;
  payoutDate: string;
  setPayoutDate: (date: string) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function MarkReceivedModal({ 
  isOpen, 
  onClose, 
  payoutDate, 
  setPayoutDate, 
  onConfirm,
  isLoading 
}: MarkReceivedModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Theme-based animated icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">
          Mark as Received
        </h2>
        
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 max-w-[280px] leading-relaxed">
          Confirm the exact date this payout landed in your bank account to keep ledgers accurate.
        </p>

        <div className="w-full text-left bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 p-3 rounded-xl mb-6">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
            Received Date
          </label>
          <DatePicker 
            value={payoutDate}
            onChange={setPayoutDate}
            max={new Date().toISOString().split('T')[0]}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading} 
            className="flex-1 h-9 rounded-lg text-xs font-bold uppercase tracking-wider"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="flex-1 h-9 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            {isLoading ? 'Confirming...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
