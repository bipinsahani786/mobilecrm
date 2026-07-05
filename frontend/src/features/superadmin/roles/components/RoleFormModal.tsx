import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldAlert, Loader2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateRole, useUpdateRole } from '../api/useRoles';
import type { Role, Permission } from '../api/useRoles';
import { useEffect } from 'react';

const roleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  availablePermissions: Permission[];
}

export function RoleFormModal({ isOpen, onClose, role, availablePermissions }: RoleFormModalProps) {
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      permissions: [],
    },
  });

  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        permissions: role.permissions.map(p => p.name),
      });
    } else {
      form.reset({
        name: '',
        permissions: [],
      });
    }
  }, [role, form, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!role;
  const isSuperadmin = role?.name === 'Superadmin';
  const isPending = createRole.isPending || updateRole.isPending;

  const onSubmit = (data: RoleFormValues) => {
    if (isEditing) {
      updateRole.mutate(
        { id: role.id, data },
        { onSuccess: onClose }
      );
    } else {
      createRole.mutate(data, { onSuccess: onClose });
    }
  };

  const togglePermission = (permissionName: string) => {
    if (isSuperadmin) return; // Superadmin has all permissions permanently

    const currentPermissions = form.getValues('permissions');
    if (currentPermissions.includes(permissionName)) {
      form.setValue('permissions', currentPermissions.filter(p => p !== permissionName), { shouldValidate: true });
    } else {
      form.setValue('permissions', [...currentPermissions, permissionName], { shouldValidate: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
                {isEditing ? 'Edit Role' : 'Create New Role'}
              </h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                {isEditing ? 'Modify permissions and name' : 'Define access for staff'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="role-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">
                Role Name
              </label>
              <Input
                {...form.register('name')}
                placeholder="e.g. Support Staff, Sales Manager"
                disabled={isSuperadmin}
                className="h-12 bg-slate-50 dark:bg-[#0a0a0c] border-slate-200 dark:border-white/5 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner disabled:opacity-50"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-rose-500 font-bold ml-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">
                Permissions
              </label>
              {form.formState.errors.permissions && (
                <p className="text-xs text-rose-500 font-bold ml-1">{form.formState.errors.permissions.message}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availablePermissions.map(permission => {
                  const isSelected = form.watch('permissions').includes(permission.name);
                  
                  return (
                    <div 
                      key={permission.id}
                      onClick={() => togglePermission(permission.name)}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none
                        ${isSuperadmin ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500/50'}
                        ${isSelected 
                          ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-500/30 dark:border-primary-500/20 text-primary-700 dark:text-primary-400' 
                          : 'bg-white dark:bg-[#111115] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400'
                        }
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors
                        ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'bg-slate-100 dark:bg-white/5 border-slate-300 dark:border-white/10'}
                      `}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-semibold tracking-wide truncate">
                        {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0c] flex justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="h-9 px-4 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="role-form"
            disabled={isPending || isSuperadmin}
            className="h-9 px-6 bg-primary-600 hover:bg-primary-500 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ShieldAlert className="w-4 h-4 mr-2" />
            )}
            {isEditing ? 'Update Role' : 'Create Role'}
          </Button>
        </div>

      </div>
    </div>
  );
}
