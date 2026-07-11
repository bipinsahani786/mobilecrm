import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      title={
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          Confirm Payout Received
        </div>
      }
      maxWidth="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
            {isLoading ? 'Confirming...' : 'Confirm Received'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please confirm the date when this payout was received in your bank account.
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Received Date
          </label>
          <Input 
            type="date"
            value={payoutDate}
            onChange={(e) => setPayoutDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </Modal>
  );
}
