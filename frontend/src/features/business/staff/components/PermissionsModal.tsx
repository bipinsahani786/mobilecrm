import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useStaffPermissions, useUpdateStaffPermissions } from '../api/useStaff';
import type { StaffMember } from '../api/useStaff';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard', description: 'Can see overview and statistics' },
  { id: 'manage_sales', label: 'Manage Sales', description: 'Can create and edit invoices' },
  { id: 'manage_inventory', label: 'Manage Inventory', description: 'Can add products and update stock' },
  { id: 'manage_customers', label: 'Manage Customers', description: 'Can add and edit customer details' },
  { id: 'manage_suppliers', label: 'Manage Suppliers', description: 'Can add and edit supplier details' },
  { id: 'manage_expenses', label: 'Manage Expenses', description: 'Can record business expenses' },
  { id: 'manage_staff', label: 'Manage Staff', description: 'Can add staff and manage roles' },
  { id: 'manage_payroll', label: 'Manage Payroll', description: 'Can generate and confirm salary slips' },
  { id: 'view_attendance', label: 'View Attendance', description: 'Can see attendance records of all staff' },
];

export function PermissionsModal({ isOpen, onClose, staff }: PermissionsModalProps) {
  const { data: permissions, isLoading } = useStaffPermissions(staff?.id || 0);
  const updateMutation = useUpdateStaffPermissions(staff?.id || 0);

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (permissions) {
      setSelectedPermissions(permissions);
    }
  }, [permissions]);

  const handleToggle = (permId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permId]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permId));
    }
  };

  const handleSave = () => {
    updateMutation.mutate(selectedPermissions, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!staff) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Permissions: ${staff.name}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Select the features this staff member is allowed to access in the panel.
            Changes will take effect immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {isLoading ? (
            <div className="text-center py-4 text-slate-500 col-span-2">Loading permissions...</div>
          ) : (
            AVAILABLE_PERMISSIONS.map(perm => (
              <div key={perm.id} className="p-3.5 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0c0c0f] hover:border-primary-500/50 dark:hover:border-primary-500/30 transition-all duration-200 shadow-sm flex flex-col justify-center">
                <Toggle
                  label={perm.label}
                  description={perm.description}
                  checked={selectedPermissions.includes(perm.id)}
                  onChange={(checked) => handleToggle(perm.id, checked)}
                />
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="h-10 px-5 text-xs font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-350 rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="h-10 px-5 text-xs font-black uppercase tracking-widest bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-xl shadow-md shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-200 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
