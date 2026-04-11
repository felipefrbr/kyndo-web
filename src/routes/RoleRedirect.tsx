import { Navigate } from 'react-router';
import { useAuth } from '@/auth/useAuth';

export function RoleRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'creator':
      return <Navigate to="/creator" replace />;
    case 'promoter':
      return <Navigate to="/promoter" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
