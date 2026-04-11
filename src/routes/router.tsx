import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { RoleGuard } from '@/auth/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { CreatorDashboard } from '@/features/creator/CreatorDashboard';
import { PromoterDashboard } from '@/features/promoter/PromoterDashboard';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { RoleRedirect } from './RoleRedirect';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <RoleRedirect />,
      },
      // Creator routes
      {
        path: '/creator',
        element: (
          <RoleGuard allowedRoles={['creator']}>
            <CreatorDashboard />
          </RoleGuard>
        ),
      },
      {
        path: '/creator/campaigns',
        element: (
          <RoleGuard allowedRoles={['creator']}>
            <div className="text-gray-500">Listagem de campanhas (Fase 2)</div>
          </RoleGuard>
        ),
      },
      {
        path: '/creator/campaigns/new',
        element: (
          <RoleGuard allowedRoles={['creator']}>
            <div className="text-gray-500">Criar campanha (Fase 2)</div>
          </RoleGuard>
        ),
      },
      // Promoter routes
      {
        path: '/promoter',
        element: (
          <RoleGuard allowedRoles={['promoter']}>
            <PromoterDashboard />
          </RoleGuard>
        ),
      },
      {
        path: '/promoter/browse',
        element: (
          <RoleGuard allowedRoles={['promoter']}>
            <div className="text-gray-500">Marketplace (Fase 4)</div>
          </RoleGuard>
        ),
      },
      {
        path: '/promoter/posts',
        element: (
          <RoleGuard allowedRoles={['promoter']}>
            <div className="text-gray-500">Meus posts (Fase 4)</div>
          </RoleGuard>
        ),
      },
      {
        path: '/promoter/wallet',
        element: (
          <RoleGuard allowedRoles={['promoter']}>
            <div className="text-gray-500">Carteira (Fase 5)</div>
          </RoleGuard>
        ),
      },
      // Admin routes
      {
        path: '/admin',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleGuard>
        ),
      },
      {
        path: '/admin/campaigns',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <div className="text-gray-500">Gestao de campanhas (Fase 3)</div>
          </RoleGuard>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <div className="text-gray-500">Usuarios (Fase 3)</div>
          </RoleGuard>
        ),
      },
      {
        path: '/admin/withdrawals',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <div className="text-gray-500">Saques (Fase 5)</div>
          </RoleGuard>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
