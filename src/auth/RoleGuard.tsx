import { Navigate } from 'react-router';
import { useAuth } from './useAuth';
import type { UserRole } from '@/types/auth.types';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
