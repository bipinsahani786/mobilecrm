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
      maxWidth="md"
    >
      <div className="space-y-6">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Select the features this staff member is allowed to access in the panel.
            Changes will take effect immediately.
          </p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4 text-slate-500">Loading permissions...</div>
          ) : (
            AVAILABLE_PERMISSIONS.map(perm => (
              <div key={perm.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#111115]">
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

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={updateMutation.isPending}>
            Save Permissions
          </Button>
        </div>
      </div>
    </Modal>
  );
}
