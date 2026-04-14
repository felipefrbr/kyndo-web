import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/auth/useAuth';
import { isAxiosError } from 'axios';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'creator' | 'promoter'>('creator');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    // Frontend validation
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Nome obrigatorio';
    if (!email.trim()) errors.email = 'Email obrigatorio';
    if (password.length < 8) errors.password = 'Senha deve ter no minimo 8 caracteres';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await signup(email, password, name, role);
      navigate('/login', { state: { message: 'Conta criada com sucesso! Faca login.' } });
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error) {
        const apiError = err.response.data.error;
        if (apiError.details) {
          setFieldErrors(apiError.details);
        } else {
          setError(apiError.message);
        }
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">Kyndo</h1>
          <p className="mt-2 text-gray-500">Crie sua conta</p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Gradient accent strip */}
          <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60" />

          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Tipo de conta</label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`rounded-xl p-4 text-center shadow-sm transition-all ${
                    role === 'creator'
                      ? 'border-2 border-primary bg-primary/5 text-primary shadow-md'
                      : 'border-2 border-transparent bg-gray-50 text-gray-600 hover:shadow-md'
                  }`}
                >
                  <div className="text-2xl">🎬</div>
                  <div className="mt-1 text-sm font-medium">Criador de Conteudo</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('promoter')}
                  className={`rounded-xl p-4 text-center shadow-sm transition-all ${
                    role === 'promoter'
                      ? 'border-2 border-primary bg-primary/5 text-primary shadow-md'
                      : 'border-2 border-transparent bg-gray-50 text-gray-600 hover:shadow-md'
                  }`}
                >
                  <div className="text-2xl">📢</div>
                  <div className="mt-1 text-sm font-medium">Divulgador / Clipador</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                Nome
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
              <p className="mt-1 text-xs text-gray-400">Minimo 8 caracteres</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Ja tem uma conta?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
