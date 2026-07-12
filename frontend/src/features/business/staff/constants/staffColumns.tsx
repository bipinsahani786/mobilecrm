import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Power } from 'lucide-react';
import React from 'react';


import type { ColumnDef } from '@/components/ui/data-table';
import type { StaffMember } from '../api/useStaff';
import { Toggle } from '@/components/ui/toggle';

interface StaffColumnActions {
  handleEdit: (e: React.MouseEvent, staffMember: StaffMember) => void;
  handleToggleStatus: (staffMember: StaffMember) => void;
  handlePermissions: (e: React.MouseEvent, staffMember: StaffMember) => void;
  currentUser?: any;
}

export const getStaffColumns = ({ handleEdit, handleToggleStatus, handlePermissions, currentUser }: StaffColumnActions): ColumnDef<StaffMember>[] => [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: (item: StaffMember) => {
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs text-sm">
            {item.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">{item.email || 'No email'}</div>
          </div>
        </div>
      );
    }
  },
  {
    header: 'Phone',
    accessorKey: 'phone',
  },
  {
    header: 'Role',
    accessorKey: 'role',
    cell: (item: StaffMember) => (
      <Badge variant="outline" className="capitalize">
        {item.role}
      </Badge>
    )
  },
  {
    header: 'Salary',
    accessorKey: 'monthly_salary',
    cell: (item: StaffMember) => `₹${Number(item.monthly_salary).toLocaleString()}`
  },
  {
    header: 'Commission',
    accessorKey: 'commission_rate',
    cell: (item: StaffMember) => `${item.commission_rate}%`
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: (item: StaffMember) => {
      const status = item.status;
      return (
        <Badge variant={status === 'active' ? 'success' : 'secondary'} className="capitalize">
          {status}
        </Badge>
      );
    }
  },
  {
    header: 'Actions',
    cell: (item: StaffMember) => {
      const isSelf = currentUser?.id === item.id;
      const isAdmin = item.role === 'admin';
      const disableToggle = isSelf || isAdmin;

      return (
        <div className="flex items-center gap-3 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            onClick={(e) => handlePermissions(e, item)}
          >
            Permissions
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => handleEdit(e, item)}
          >
            <Pencil className="h-4 w-4 text-slate-500" />
          </Button>

          <div className="flex flex-col items-center justify-center" title={disableToggle ? "Cannot deactivate yourself or an admin" : "Toggle Active/Inactive"}>
            <Toggle
              label=""
              checked={item.status === 'active'}
              onChange={() => {
                if (!disableToggle) {
                  handleToggleStatus(item);
                }
              }}
            />
          </div>
        </div>
      );
    }
  }
];
