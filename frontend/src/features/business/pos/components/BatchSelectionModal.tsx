import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Layers, Plus, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface BatchSelectionModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onSelectBatch: (product: any, batch: any) => void;
}

export function BatchSelectionModal({ product, isOpen, onClose, onSelectBatch }: BatchSelectionModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product || !mounted) return null;

  const activeBatches = product.batches?.filter((b: any) => b.remaining_quantity > 0) || [];

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0f0f13] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200/50 dark:border-white/10 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Select Batch</h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px]">{product.model_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto custom-scrollbar space-y-2.5 bg-slate-50/30 dark:bg-transparent">
          {activeBatches.map((batch: any) => (
            <button
              key={batch.id}
              onClick={() => {
                onSelectBatch(product, batch);
                onClose();
              }}
              className="w-full text-left group relative bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl p-3 hover:border-primary-400 dark:hover:border-primary-500/50 hover:shadow-sm hover:shadow-primary-500/5 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 transition-colors">
                    <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {batch.batch_number && batch.batch_number !== 'N/A' ? `#${batch.batch_number}` : 'Standard Batch'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Available: <span className="font-bold text-slate-700 dark:text-slate-300">{batch.remaining_quantity}</span> units
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-slate-900 dark:text-white font-display group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {formatCurrency(batch.mrp || product.mrp)}
                  </p>
                  <div className="mt-0.5 flex items-center justify-end gap-1 text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Select</span>
                    <Plus className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
