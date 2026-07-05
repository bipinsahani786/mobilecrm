import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  children, 
  permission, 
  permissions, 
  requireAll = false,
  fallback 
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let isAllowed = true;

  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    isAllowed = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  if (!isAllowed) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    
    // Default fallback: 403 Forbidden style page or redirect
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">🛡️</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
          Access Denied
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">
          You don't have the required permissions to view this page or perform this action.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
