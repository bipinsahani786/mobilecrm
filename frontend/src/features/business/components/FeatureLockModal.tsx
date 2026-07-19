import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';

interface FeatureLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export function FeatureLockModal({ isOpen, onClose, featureName }: FeatureLockModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      title="Feature Locked"
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center p-6 pt-8">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Premium Feature
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
          {featureName 
            ? `The ${featureName} module is not available on your current plan. Please upgrade your subscription to unlock this feature.`
            : 'This module is not available on your current plan. Please upgrade your subscription to unlock this feature.'
          }
        </p>

        <div className="w-full space-y-3">
          <Button 
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md"
            onClick={() => {
              onClose();
              // In the future, this can navigate to a billing page
              // window.location.href = '/settings/billing';
            }}
          >
            Upgrade Plan Now
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={onClose}
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </Modal>
  );
}
