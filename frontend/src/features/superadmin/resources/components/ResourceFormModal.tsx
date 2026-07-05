import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCreatePartnerResource, useUpdatePartnerResource, type PartnerResource } from '../api/useResources';
import { FileUp, Loader2 } from 'lucide-react';
import { resourceSchema, type ResourceFormValues } from '../schemas/resourceSchema';
import { uploadToR2 } from '@/lib/r2';

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: PartnerResource;
}

export function ResourceFormModal({ isOpen, onClose, resource }: ResourceFormModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useCreatePartnerResource();
  const updateMutation = useUpdatePartnerResource();

  const isEditing = !!resource;
  const isLoading = createMutation.isPending || updateMutation.isPending || isUploading;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: '',
      description: '',
      is_active: true,
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (resource) {
        reset({
          title: resource.title,
          description: resource.description || '',
          is_active: resource.is_active,
        });
        setFile(null);
      } else {
        reset({
          title: '',
          description: '',
          is_active: true,
        });
        setFile(null);
      }
    }
  }, [isOpen, resource, reset]);

  const onSubmit = async (values: ResourceFormValues) => {
    console.log("1. SUBMIT FIRED!", { isEditing, file, values });
    if (!isEditing && !file) {
      toast.error('File is required for new resource');
      return;
    }

    try {
      console.log("2. Setting isUploading to true");
      setIsUploading(true);
      
      let filePath = resource?.file_path;
      let fileType = resource?.file_type;
      let fileSize = resource?.file_size;

      // Upload file to R2 directly if a new file is selected
      if (file) {
        console.log("3. File found, initiating uploadToR2 call...");
        const uploadResult = await uploadToR2(file, 'partner_resources');
        console.log("4. uploadToR2 returned:", uploadResult);
        filePath = uploadResult.path;
        fileType = file.name.split('.').pop();
        fileSize = file.size;
      } else {
        console.log("3. No new file provided, skipping R2 upload");
      }

      const payload = {
        title: values.title,
        description: values.description || '',
        is_active: values.is_active,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
      };

      console.log("5. Calling API mutation with payload:", payload);
      if (isEditing) {
        await updateMutation.mutateAsync({ id: resource!.id, payload });
        console.log("6. Update mutation succeeded");
        toast.success('Resource updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        console.log("6. Create mutation succeeded");
        toast.success('Resource uploaded successfully');
      }
      onClose();
    } catch (error: any) {
      console.error("ERROR IN ONSUBMIT:", error);
      toast.error(error.response?.data?.message || error.message || 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Marketing Asset' : 'Upload Marketing Asset'}>
      <form onSubmit={handleSubmit(onSubmit, (errs) => {
        console.log("Validation Errors:", errs);
        Object.values(errs).forEach(err => toast.error(err?.message as string));
      })} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Title</label>
          <input
            type="text"
            {...register('title')}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Q3 Sales Pitch Deck"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Description (Optional)</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Briefly describe what this asset is for..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            {isEditing ? 'Replace File (Optional)' : 'Upload File'}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              id="resource-file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              accept=".pdf,.ppt,.pptx,.jpg,.png,.jpeg,.docx"
            />
            <label
              htmlFor="resource-file"
              className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors w-full"
            >
              <FileUp className="w-4 h-4 mr-2 text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {file ? file.name : 'Choose a file (Max 10MB)'}
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="is-active"
            {...register('is_active')}
            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="is-active" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Visible to Partners
          </label>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-white/10">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} size="sm" className="bg-primary-500 hover:bg-primary-600 text-white min-w-[120px] rounded-md font-semibold">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Save Changes' : 'Upload'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
