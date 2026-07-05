import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/modal';
import { Mail, MessageSquare, Smartphone, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useCreateTemplate, useUpdateTemplate, type TemplateRecord } from '../api/useTemplates';
import { templateSchema, type TemplateFormData } from '../schemas/templateSchema';
import { TEMPLATE_VARIABLES, CHANNEL_OPTIONS } from '../constants/templateConstants';

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: TemplateRecord | null;
}

export function TemplateFormModal({ isOpen, onClose, template }: TemplateFormModalProps) {
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      type: 'email',
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (template && isOpen) {
      reset({
        name: template.name,
        type: template.type,
        subject: template.subject || '',
        body: template.body,
      });
    } else if (isOpen) {
      reset({
        name: '',
        type: 'email',
        subject: '',
        body: '',
      });
    }
  }, [template, isOpen, reset]);

  const onSubmit = async (data: TemplateFormData) => {
    try {
      if (template) {
        await updateTemplate.mutateAsync({ id: template.id, data });
      } else {
        await createTemplate.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Edit Template' : 'Create Template'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Template Name
              </label>
              <InfoTooltip text="A unique name to identify this message template in campaigns." />
            </div>
            <Input
              {...register('name')}
              placeholder="e.g., Welcome Newsletter"
              error={errors.name?.message}
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Channel Type
              </label>
              <InfoTooltip text="Choose whether to send this template as an Email, WhatsApp, or SMS." />
            </div>
            <Select
              {...register('type')}
              icon={
                selectedType === 'email' ? <Mail className="w-4 h-4 text-slate-400" /> :
                selectedType === 'whatsapp' ? <MessageSquare className="w-4 h-4 text-emerald-500" /> :
                <Smartphone className="w-4 h-4 text-indigo-500" />
              }
            >
              {CHANNEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {selectedType === 'email' && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Subject
              </label>
              <InfoTooltip text="The subject line of the email. You can use dynamic variables like {{name}} here." />
            </div>
            <Input
              {...register('subject')}
              placeholder="e.g., Special Offer for {{name}}"
              error={errors.subject?.message}
            />
          </div>
        )}

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Message Body
            </label>
            <InfoTooltip text="The main message content. Use tags like {{name}} or {{company}} to personalize it." />
          </div>
          <Textarea
            {...register('body')}
            rows={8}
            placeholder={selectedType === 'email' ? "Hi {{name}},\n\nHere is your update..." : "Hi {{name}}, here is your offer."}
          />
          {errors.body && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.body.message}</p>}
        </div>

        {/* Variables Info Alert */}
        <div className="bg-primary-50/50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-primary-500 shrink-0" />
          <div className="text-sm">
            <h4 className="font-semibold text-primary-800 dark:text-primary-400 mb-1">Available Variables</h4>
            <p className="text-primary-600 dark:text-primary-300/80 mb-2">
              You can use variables in your templates which will be replaced with the lead's details when sending.
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_VARIABLES.map(v => (
                <span key={v} className="px-2 py-1 bg-white dark:bg-black/40 rounded-md text-xs font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
          >
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
