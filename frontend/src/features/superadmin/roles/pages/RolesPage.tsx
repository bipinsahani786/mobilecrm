import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ShieldAlert, Plus, Trash2, Edit2, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoles, useDeleteRole } from '../api/useRoles';
import type { Role } from '../api/useRoles';
import { RoleFormModal } from '../components/RoleFormModal';
import { Skeleton } from '@/components/ui/skeleton';

export default function RolesPage() {
  const { data, isLoading } = useRoles();
  const deleteRole = useDeleteRole();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleCreate = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = (role: Role) => {
    if (role.name === 'Superadmin') return;
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      deleteRole.mutate(role.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none" />
        <div className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 relative z-10">
          <Skeleton className="h-10 w-48 rounded-xl bg-slate-200/50 dark:bg-white/5" />
          <Skeleton className="h-5 w-80 rounded-lg bg-slate-200/50 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  const roles = data?.roles || [];
  const availablePermissions = data?.permissions || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-slate-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-primary-500/5 dark:from-primary-500/10 to-transparent pointer-events-none" />
      
      <PageHeader
        icon={ShieldAlert}
        title="Roles & Permissions"
        subtitle="Manage access levels and permissions for superadmin staff members"
        actions={
          <Button 
            size="sm"
            onClick={handleCreate}
            className="bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Role
          </Button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-primary-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(role)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-primary-500 flex items-center justify-center transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {role.name !== 'Superadmin' && (
                    <button onClick={() => handleDelete(role)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-rose-500 flex items-center justify-center transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">{role.name}</h3>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
                    {role.permissions.length} Permissions
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                {role.permissions.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    <span className="truncate">{p.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={selectedRole}
        availablePermissions={availablePermissions}
      />
    </div>
  );
}
