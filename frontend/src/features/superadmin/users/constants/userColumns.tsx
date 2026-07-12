import type { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ShieldCheck } from 'lucide-react';
import { StatusSelectCell } from '@/components/ui/table-cells';
import { format } from 'date-fns';
import type { UserRecord } from '../api/useUsers';

// Dynamic color palette — cycles automatically for any role name
const BADGE_COLORS = [
  'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
  'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30',
  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
  'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30',
  'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/30',
  'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/15 dark:text-pink-400 dark:border-pink-500/30',
  'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30',
];

function getRoleBadgeColor(roleName: string): string {
  let hash = 0;
  for (let i = 0; i < roleName.length; i++) {
    hash = roleName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}

interface UserColumnsProps {
  onEdit: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void;
  onStatusChange: (user: UserRecord, newStatus: 'active' | 'suspended') => void;
}

export const getUserColumns = ({
  onEdit,
  onDelete,
  onStatusChange,
}: UserColumnsProps): ColumnDef<UserRecord>[] => [
  {
    header: 'User',
    accessorKey: 'name',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (user) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-500/10 border border-primary-100/50 dark:border-primary-500/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400 uppercase">
            {user.name?.charAt(0) || '?'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-xs font-bold text-slate-800 dark:text-white leading-tight truncate">{user.name}</p>
          {user.email && (
            <p className="text-[10px] text-slate-500 font-bold text-xs tracking-wider mt-0.5 truncate">{user.email}</p>
          )}
        </div>
      </div>
    ),
  },
  {
    header: 'Phone',
    accessorKey: 'phone',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs font-bold text-xs text-slate-600 dark:text-slate-400',
    cell: (user) => user.phone || '—',
  },
  {
    header: 'Role',
    className: '!px-3 !py-1.5 text-xs',
    cell: (user) => {
      const roleName = user.roles?.[0]?.name;
      if (!roleName) {
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10 uppercase tracking-widest">
            No Role
          </span>
        );
      }
      const color = getRoleBadgeColor(roleName);
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${color}`}>
          {roleName}
        </span>
      );
    },
  },
  {
    header: 'Business',
    className: '!px-3 !py-1.5 text-xs',
    cell: (user) => {
      if (!user.businesses || user.businesses.length === 0) {
        return <span className="text-slate-400 text-xs">—</span>;
      }
      return (
        <div className="min-w-0">
          <p className="font-bold text-xs text-slate-700 dark:text-slate-300 truncate text-xs leading-tight">
            {user.businesses[0].name}
          </p>
          {user.businesses.length > 1 && (
            <p className="text-[9px] text-primary-500 font-bold mt-0.5">
              +{user.businesses.length - 1} more
            </p>
          )}
        </div>
      );
    },
  },
  {
    header: 'Status',
    accessorKey: 'status',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (user) => (
      <StatusSelectCell
        value={user.status || 'active'}
        onChange={(val) => onStatusChange(user, val as 'active' | 'suspended')}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'suspended', label: 'Suspended' },
        ]}
        themeMap={{
          active: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
          suspended: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
        }}
      />
    ),
  },
  {
    header: 'Verified',
    className: '!px-3 !py-1.5 text-xs text-center',
    cell: (user) => (
      <div className="flex justify-center">
        {user.email_verified_at ? (
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        ) : (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No</span>
        )}
      </div>
    ),
  },
  {
    header: 'Joined',
    accessorKey: 'created_at',
    sortable: true,
    className: '!px-3 !py-1.5 text-xs',
    cell: (user) => (
      <p className="text-xs font-bold text-xs text-slate-600 dark:text-slate-400">
        {format(new Date(user.created_at), 'dd MMM yyyy')}
      </p>
    ),
  },
  {
    header: 'Actions',
    className: 'text-right !px-3 !py-1.5 text-xs',
    cell: (user) => (
      <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(user)}
          title="Edit User"
          className="w-7 h-7 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(user)}
          title="Delete User"
          className="w-7 h-7 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center rounded-lg p-0 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    ),
  },
];
