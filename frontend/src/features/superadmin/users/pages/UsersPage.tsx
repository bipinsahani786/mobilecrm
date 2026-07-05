import { useState, useMemo, useEffect, useCallback } from 'react';
import { useUsers, useDeleteUser, useUpdateUserStatus, useUserStats, useRoles, type UserRecord } from '../api/useUsers';
import { Users, UserCheck, UserX, ShieldCheck, Tag, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  FilterContainer,
  FilterSearch,
  FilterSelect,
  FilterDate,
  FilterReset,
} from '@/components/ui/filter-controls';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { getUserColumns } from '../constants/userColumns';
import { UserFormModal } from '../components/UserEditModal';
import { useDebounce } from '@/hooks/useDebounce';

// Color palette for dynamically generated role cards
const ROLE_COLORS = [
  'bg-rose-50 dark:bg-rose-500/10 text-rose-500',
  'bg-sky-50 dark:bg-sky-500/10 text-sky-500',
  'bg-amber-50 dark:bg-amber-500/10 text-amber-500',
  'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500',
  'bg-violet-50 dark:bg-violet-500/10 text-violet-500',
  'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500',
  'bg-pink-50 dark:bg-pink-500/10 text-pink-500',
  'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500',
];

export default function UsersPage() {
  // ── Pagination ──
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // ── Filters ──
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ── Sorting ──
  const [sortBy, setSortBy] = useState<string | undefined>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>('desc');

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterRole, filterStatus, fromDate, toDate]);

  // ── Data fetching ──
  const { data: usersData, isLoading } = useUsers({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    role: filterRole || undefined,
    status: filterStatus || undefined,
    from_date: fromDate || undefined,
    to_date: toDate || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const { data: statsData } = useUserStats();
  const stats = statsData?.data;

  const { data: rolesData } = useRoles();
  const roles = rolesData?.data ?? [];

  const deleteUser = useDeleteUser();
  const updateStatus = useUpdateUserStatus();

  // ── Modal state ──
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);

  const users = usersData?.data ?? [];
  const totalItems = usersData?.meta?.total ?? 0;

  // ── Handlers ──
  const handleEditClick = useCallback((user: UserRecord) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  }, []);

  const handleDeleteClick = useCallback((user: UserRecord) => {
    setUserToDelete(user);
  }, []);

  const handleStatusChange = useCallback(async (user: UserRecord, newStatus: 'active' | 'suspended') => {
    try {
      await updateStatus.mutateAsync({ id: user.id, status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  }, [updateStatus]);

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser.mutateAsync(userToDelete.id);
      toast.success('User deleted successfully');
      setUserToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // ── Column defs ──
  const columns = useMemo(
    () => getUserColumns({
      onEdit: handleEditClick,
      onDelete: handleDeleteClick,
      onStatusChange: handleStatusChange,
    }),
    [handleEditClick, handleDeleteClick, handleStatusChange]
  );

  // ── Dynamic role filter options ──
  const roleFilterOptions = useMemo(() => {
    const opts = [{ value: '', label: 'All Roles' }];
    roles.forEach((r) => opts.push({ value: r.name, label: r.name }));
    return opts;
  }, [roles]);

  // ── Dynamic role stat cards ──
  const roleCards = useMemo(() => {
    if (!stats) return [];
    const rc = stats.role_counts || {};
    return roles.map((role, i) => ({
      icon: Tag,
      label: role.name,
      value: rc[role.name] || 0,
      color: ROLE_COLORS[i % ROLE_COLORS.length],
    }));
  }, [stats, roles]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader
        icon={Users}
        title="User Management"
        subtitle="View and manage every registered user across the platform"
        actions={
          <Button 
            size="sm"
            onClick={() => {
              setSelectedUser(null);
              setIsEditOpen(true);
            }}
            className="bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create User
          </Button>
        }
      />

      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">

        {/* ── Analytics Cards ── */}
        {stats && (
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-${Math.min(4 + roleCards.length, 8)} gap-3`}>
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.total_users}
              color="bg-primary-50 dark:bg-primary-500/10 text-primary-500"
            />
            <StatCard
              icon={UserCheck}
              label="Active"
              value={stats.active_users}
              color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              icon={UserX}
              label="Suspended"
              value={stats.suspended_users}
              color="bg-rose-50 dark:bg-rose-500/10 text-rose-500"
            />
            <StatCard
              icon={ShieldCheck}
              label="Verified"
              value={stats.verified_users}
              color="bg-violet-50 dark:bg-violet-500/10 text-violet-500"
            />
            {roleCards.map((rc) => (
              <StatCard key={rc.label} icon={rc.icon} label={rc.label} value={rc.value} color={rc.color} />
            ))}
          </div>
        )}

        {/* ── Filters ── */}
        <FilterContainer>
          <FilterSearch
            value={search}
            onChange={setSearch}
            placeholder="Search name, email, phone…"
          />
          <FilterSelect
            value={filterRole}
            onChange={setFilterRole}
            placeholder="All Roles"
            options={roleFilterOptions}
          />
          <FilterSelect
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="All Status"
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />
          <FilterDate label="From" value={fromDate} onChange={setFromDate} />
          <FilterDate label="To" value={toDate} onChange={setToDate} />

          {(search || filterRole || filterStatus || fromDate || toDate) && (
            <FilterReset
              onClick={() => {
                setSearch('');
                setFilterRole('');
                setFilterStatus('');
                setFromDate('');
                setToDate('');
                setPage(1);
              }}
            />
          )}
        </FilterContainer>

        {/* ── Data Table ── */}
        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          loadingSkeleton={<TableSkeleton rows={5} cols={8} />}
          searchable={false}
          emptyIcon={<Users className="w-12 h-12" />}
          emptyMessage="No users found matching your criteria."
          serverSide
          totalItems={totalItems}
          page={page}
          itemsPerPage={perPage}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPerPage(size);
            setPage(1);
          }}
          onSortChange={(key, order) => {
            setSortBy(key ? String(key) : undefined);
            setSortOrder(order ?? undefined);
          }}
        />
      </div>

      {/* ── Modals ── */}
      <UserFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        roles={roles}
      />

      {/* ── Delete Confirm ── */}
      <DeleteConfirmModal
        isOpen={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete "${userToDelete?.name}"? This action will soft-delete the user and they will lose access to the platform.`}
        itemName={userToDelete?.name}
      />
    </div>
  );
}
