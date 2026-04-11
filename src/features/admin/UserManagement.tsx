import { useEffect, useState } from 'react';
import { adminListUsers, type UserItem } from '@/api/admin.api';
import { formatCurrency, formatDate } from '@/lib/formatters';

const roleBadge: Record<string, { label: string; color: string }> = {
  creator: { label: 'Criador', color: 'bg-blue-100 text-blue-700' },
  promoter: { label: 'Divulgador', color: 'bg-green-100 text-green-700' },
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
};

export function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminListUsers(roleFilter, page, 10)
      .then((data) => {
        setUsers(data.users ?? []);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [page, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(total / 10));

  const roles = [
    { value: '', label: 'Todos' },
    { value: 'creator', label: 'Criadores' },
    { value: 'promoter', label: 'Divulgadores' },
    { value: 'admin', label: 'Admins' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>

      <div className="flex gap-2">
        {roles.map((r) => (
          <button
            key={r.value}
            onClick={() => { setRoleFilter(r.value); setPage(1); }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              roleFilter === r.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Saldo</th>
                <th className="px-4 py-3">Cadastro</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => {
                const badge = roleBadge[u.role] ?? { label: u.role, color: 'bg-gray-100 text-gray-700' };
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(u.balance_cents)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Anterior</button>
          <span className="text-sm text-gray-600">Pagina {page} de {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-md border px-3 py-1 text-sm disabled:opacity-50">Proxima</button>
        </div>
      )}
    </div>
  );
}
