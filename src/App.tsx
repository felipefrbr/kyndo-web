import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/auth/AuthProvider';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { RoleGuard } from '@/auth/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { CreatorDashboard } from '@/features/creator/CreatorDashboard';
import { PromoterDashboard } from '@/features/promoter/PromoterDashboard';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { RoleRedirect } from '@/routes/RoleRedirect';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Placeholder({ text }: { text: string }) {
  return <div className="text-gray-500">{text}</div>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route path="/" element={<RoleRedirect />} />

              {/* Creator */}
              <Route path="/creator" element={<RoleGuard allowedRoles={['creator']}><CreatorDashboard /></RoleGuard>} />
              <Route path="/creator/campaigns" element={<RoleGuard allowedRoles={['creator']}><Placeholder text="Listagem de campanhas (Fase 2)" /></RoleGuard>} />
              <Route path="/creator/campaigns/new" element={<RoleGuard allowedRoles={['creator']}><Placeholder text="Criar campanha (Fase 2)" /></RoleGuard>} />

              {/* Promoter */}
              <Route path="/promoter" element={<RoleGuard allowedRoles={['promoter']}><PromoterDashboard /></RoleGuard>} />
              <Route path="/promoter/browse" element={<RoleGuard allowedRoles={['promoter']}><Placeholder text="Marketplace (Fase 4)" /></RoleGuard>} />
              <Route path="/promoter/posts" element={<RoleGuard allowedRoles={['promoter']}><Placeholder text="Meus posts (Fase 4)" /></RoleGuard>} />
              <Route path="/promoter/wallet" element={<RoleGuard allowedRoles={['promoter']}><Placeholder text="Carteira (Fase 5)" /></RoleGuard>} />

              {/* Admin */}
              <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard>} />
              <Route path="/admin/campaigns" element={<RoleGuard allowedRoles={['admin']}><Placeholder text="Gestao de campanhas (Fase 3)" /></RoleGuard>} />
              <Route path="/admin/users" element={<RoleGuard allowedRoles={['admin']}><Placeholder text="Usuarios (Fase 3)" /></RoleGuard>} />
              <Route path="/admin/withdrawals" element={<RoleGuard allowedRoles={['admin']}><Placeholder text="Saques (Fase 5)" /></RoleGuard>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
