import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Power, Eye } from 'lucide-react';
import React from 'react';


import type { ColumnDef } from '@/components/ui/data-table';
import type { StaffMember } from '../api/useStaff';
import { Toggle } from '@/components/ui/toggle';

interface StaffColumnActions {
  handleEdit: (e: React.MouseEvent, staffMember: StaffMember) => void;
  handleToggleStatus: (staffMember: StaffMember) => void;
  handlePermissions: (e: React.MouseEvent, staffMember: StaffMember) => void;
  handleViewDetails: (e: React.MouseEvent, staffMember: StaffMember) => void;
  currentUser?: any;
}

export const getStaffColumns = ({ handleEdit, handleToggleStatus, handlePermissions, handleViewDetails, currentUser }: StaffColumnActions): ColumnDef<StaffMember>[] => [
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
        {item.is_owner ? 'Owner' : item.role}
      </Badge>
    )
  },
  {
    header: 'Salary',
    accessorKey: 'monthly_salary',
    cell: (item: StaffMember) => {
      const isDaily = (item as any).salary_type === 'daily';
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-zinc-200">
            ₹{Number(isDaily ? (item as any).daily_salary : item.monthly_salary).toLocaleString()}
          </span>
          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
            isDaily 
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
              : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
          }`}>
            {isDaily ? '/day' : '/mo'}
          </span>
        </div>
      );
    }
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
      const isAdmin = item.role === 'admin' || item.is_owner;
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
            onClick={(e) => handleViewDetails(e, item)}
            title="View Details"
          >
            <Eye className="h-4 w-4 text-slate-500 hover:text-slate-700" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => handleEdit(e, item)}
            title="Edit Staff"
          >
            <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
          </Button>

          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center w-[70px]" 
            title={disableToggle ? "Cannot deactivate yourself or an admin" : "Toggle Active/Inactive"}
          >
            {item.is_owner ? (
              <Badge variant="secondary" className="text-[9px] leading-tight whitespace-nowrap bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400 font-bold border-none px-1.5 py-0.5 shadow-none uppercase">
                Sys Admin
              </Badge>
            ) : (
              <Toggle
                label=""
                checked={item.status === 'active'}
                onChange={() => {
                  if (!disableToggle) {
                    handleToggleStatus(item);
                  }
                }}
              />
            )}
          </div>
        </div>
      );
    }
  }
];
