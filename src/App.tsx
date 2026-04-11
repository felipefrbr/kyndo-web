import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/auth/AuthProvider';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { RoleGuard } from '@/auth/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { CreatorDashboard } from '@/features/creator/CreatorDashboard';
import { MyCampaigns } from '@/features/creator/MyCampaigns';
import { CampaignForm } from '@/features/creator/CampaignForm';
import { CampaignDetail } from '@/features/creator/CampaignDetail';
import { PromoterDashboard } from '@/features/promoter/PromoterDashboard';
import { BrowseCampaigns } from '@/features/promoter/BrowseCampaigns';
import { CampaignContent } from '@/features/promoter/CampaignContent';
import { MyPosts } from '@/features/promoter/MyPosts';
import { AdminDashboard } from '@/features/admin/AdminDashboard';
import { CampaignApproval } from '@/features/admin/CampaignApproval';
import { UserManagement } from '@/features/admin/UserManagement';
import { PostManagement } from '@/features/admin/PostManagement';
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
              <Route path="/creator/campaigns" element={<RoleGuard allowedRoles={['creator']}><MyCampaigns /></RoleGuard>} />
              <Route path="/creator/campaigns/new" element={<RoleGuard allowedRoles={['creator']}><CampaignForm /></RoleGuard>} />
              <Route path="/creator/campaigns/:id" element={<RoleGuard allowedRoles={['creator']}><CampaignDetail /></RoleGuard>} />
              <Route path="/creator/campaigns/:id/edit" element={<RoleGuard allowedRoles={['creator']}><CampaignForm /></RoleGuard>} />

              {/* Promoter */}
              <Route path="/promoter" element={<RoleGuard allowedRoles={['promoter']}><PromoterDashboard /></RoleGuard>} />
              <Route path="/promoter/browse" element={<RoleGuard allowedRoles={['promoter']}><BrowseCampaigns /></RoleGuard>} />
              <Route path="/promoter/campaigns/:id" element={<RoleGuard allowedRoles={['promoter']}><CampaignContent /></RoleGuard>} />
              <Route path="/promoter/posts" element={<RoleGuard allowedRoles={['promoter']}><MyPosts /></RoleGuard>} />
              <Route path="/promoter/wallet" element={<RoleGuard allowedRoles={['promoter']}><Placeholder text="Carteira (Fase 5)" /></RoleGuard>} />

              {/* Admin */}
              <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><AdminDashboard /></RoleGuard>} />
              <Route path="/admin/campaigns" element={<RoleGuard allowedRoles={['admin']}><CampaignApproval /></RoleGuard>} />
              <Route path="/admin/users" element={<RoleGuard allowedRoles={['admin']}><UserManagement /></RoleGuard>} />
              <Route path="/admin/posts" element={<RoleGuard allowedRoles={['admin']}><PostManagement /></RoleGuard>} />
              <Route path="/admin/withdrawals" element={<RoleGuard allowedRoles={['admin']}><Placeholder text="Saques (Fase 5)" /></RoleGuard>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
