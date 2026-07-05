import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useTemplates, type TemplateRecord } from '../../templates/api/useTemplates';
import api from '@/lib/api';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface BulkMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds: number[];
  onSuccess: () => void;
}

export function BulkMessageModal({ isOpen, onClose, selectedLeadIds, onSuccess }: BulkMessageModalProps) {
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email');
  const { data: templates = [], isLoading: isLoadingTemplates } = useTemplates(channel);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
  const [isSending, setIsSending] = useState(false);

  const selectedTemplate = templates.find(t => t.id === Number(selectedTemplateId));

  const handleSend = async () => {
    if (!selectedTemplateId) {
      toast.error('Please select a template');
      return;
    }

    try {
      setIsSending(true);
      await api.post('/superadmin/leads/bulk-message', {
        lead_ids: selectedLeadIds,
        template_id: Number(selectedTemplateId),
      });
      toast.success('Bulk message queued successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to queue bulk message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Send Bulk Message (${selectedLeadIds.length} Leads)`}
      maxWidth="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Select Channel
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setChannel('email'); setSelectedTemplateId(''); }}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 border font-semibold transition-all ${
                channel === 'email' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:bg-black/20 dark:text-slate-400'
              }`}
            >
              <Mail className="w-5 h-5" />
              Email
            </button>
            <button
              type="button"
              onClick={() => { setChannel('whatsapp'); setSelectedTemplateId(''); }}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 border font-semibold transition-all ${
                channel === 'whatsapp' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                  : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:bg-black/20 dark:text-slate-400'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              WhatsApp
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Select Template
          </label>
          <Select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
          >
            <option value="">-- Choose a {channel} template --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
          {isLoadingTemplates && <p className="text-xs mt-2 text-slate-400">Loading templates...</p>}
        </div>

        {selectedTemplate && (
          <div className="bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-white/10 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Preview</h4>
            {selectedTemplate.subject && (
              <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
                Sub: {selectedTemplate.subject}
              </p>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {selectedTemplate.body}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!selectedTemplateId}
            isLoading={isSending}
            size="sm"
          >
            <Send className="w-4 h-4" />
            Send Message
          </Button>
        </div>
      </div>
    </Modal>
  );
}
