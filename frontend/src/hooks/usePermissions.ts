import { useAuthStore } from '@/store/authStore';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  // Superadmins bypass all permission checks globally if they have the root role
  const isSuperadminRole = user?.roles?.some((role) => role.name === 'Superadmin');

  const hasPermission = (permission: string): boolean => {
    if (isSuperadminRole) return true;
    if (!user?.permissions) return false;
    
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (isSuperadminRole) return true;
    if (!user?.permissions) return false;

    return permissions.some((perm) => user.permissions?.includes(perm));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (isSuperadminRole) return true;
    if (!user?.permissions) return false;

    return permissions.every((perm) => user.permissions?.includes(perm));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperadmin: isSuperadminRole || false,
  };
}
