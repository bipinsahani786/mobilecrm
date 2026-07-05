import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2, Phone, Mail, MessageCircle, Navigation, PhoneMissed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer } from '@/components/ui/drawer';
import { toast } from 'sonner';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { useLeadContacts, useLogContact, useDeleteContact, type LeadContact } from '../api/useLeadContacts';
import type { Lead } from '../api/useLeads';
import { logSchema, type LogFormValues } from '../schemas/leadSchema';

const OUTCOME_ICON: Record<string, React.ReactNode> = {
  called:     <Phone className="w-3.5 h-3.5" />,
  emailed:    <Mail className="w-3.5 h-3.5" />,
  whatsapp:   <MessageCircle className="w-3.5 h-3.5" />,
  visited:    <Navigation className="w-3.5 h-3.5" />,
  no_answer:  <PhoneMissed className="w-3.5 h-3.5" />,
};

const OUTCOME_COLOR: Record<string, string> = {
  called:    'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  emailed:   'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  whatsapp:  'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  visited:   'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  no_answer: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400',
};


function formatDT(dt: string) {
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface Props {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDetailDrawer({ lead, isOpen, onClose }: Props) {
  const [showForm, setShowForm] = useState(false);
  const { data: contacts, isLoading } = useLeadContacts(lead?.id ?? null);
  const logContact = useLogContact(lead?.id ?? 0);
  const deleteContact = useDeleteContact(lead?.id ?? 0);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      contacted_by: 'Superadmin',
      contacted_at: new Date().toISOString().slice(0, 16),
      outcome: 'called',
      notes: '',
      next_contact_at: '',
    },
  });

  const onSubmit = async (data: LogFormValues) => {
    try {
      await logContact.mutateAsync({
        contacted_by: data.contacted_by ?? '',
        contacted_at: data.contacted_at,
        outcome: data.outcome,
        notes: data.notes ?? null,
        next_contact_at: data.next_contact_at ?? null,
      });
      toast.success('Contact logged');
      reset();
      setShowForm(false);
    } catch {
      toast.error('Failed to log contact');
    }
  };

  const [contactToDelete, setContactToDelete] = useState<LeadContact | null>(null);

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    try {
      await deleteContact.mutateAsync(contactToDelete.id);
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleDelete = (c: LeadContact) => {
    setContactToDelete(c);
  };

  if (!isOpen || !lead) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={lead.business_name}
      subtitle={`${lead.contact_person} · ${lead.partner?.name ?? 'No partner'}`}
    >
      <div className="space-y-6">

          {/* Log Contact Button */}
          {!showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              size="sm"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white"
            >
              + Log New Contact
            </Button>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 space-y-3 border border-slate-200 dark:border-white/10">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Log Contact Entry</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Contacted At *</label>
                  <Input type="datetime-local" {...register('contacted_at')} className="text-sm" />
                  {errors.contacted_at && <p className="text-red-500 text-xs">{errors.contacted_at.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Outcome *</label>
                  <select
                    {...register('outcome')}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/50"
                  >
                    <option value="called">📞 Called</option>
                    <option value="emailed">📧 Emailed</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="visited">🚗 Visited</option>
                    <option value="no_answer">🔇 No Answer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Next Follow-up Date</label>
                <Input type="datetime-local" {...register('next_contact_at')} className="text-sm" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="What was discussed..."
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black/50 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="flex-1 bg-primary-500 hover:bg-primary-600 text-white" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  Save Entry
                </Button>
              </div>
            </form>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Contact History ({contacts?.length ?? 0})
            </h3>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : contacts?.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-6">No contact history yet.</p>
            ) : (
              <div className="relative space-y-0">
                {/* Vertical line */}
                <div className="absolute left-[17px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />

                {contacts?.map((c) => (
                  <div key={c.id} className="relative pl-10 pb-5 group">
                    {/* Dot */}
                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center ${OUTCOME_COLOR[c.outcome]}`}>
                      {OUTCOME_ICON[c.outcome]}
                    </div>

                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${OUTCOME_COLOR[c.outcome]}`}>
                              {OUTCOME_ICON[c.outcome]}
                              {c.outcome.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-500">{formatDT(c.contacted_at)}</span>
                          </div>
                          {c.notes && <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{c.notes}</p>}
                          {c.next_contact_at && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-medium">
                              📅 Next follow-up: {formatDT(c.next_contact_at)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(c)}
                          className="shrink-0 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">By: {c.contacted_by}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      <DeleteConfirmModal
        isOpen={contactToDelete !== null}
        onClose={() => setContactToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Contact Entry"
        description="This action cannot be undone. This logged contact history entry will be permanently removed from the timeline."
        itemName={contactToDelete ? `${contactToDelete.outcome.toUpperCase()} - ${formatDT(contactToDelete.contacted_at)}` : undefined}
        confirmText="DELETE"
      />
    </Drawer>
  );
}
