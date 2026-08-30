import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linen-50 px-4">
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[620px] w-[620px] rounded-full bg-carissma-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-saffron-100/60 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/logo-mark.png" alt="Make Down" className="mb-4 h-20 w-20 object-contain" />
          <h1 className="text-2xl font-semibold text-espresso-900">Welcome back</h1>
          <p className="mt-1 text-sm text-espresso-500">Sign in to Make Down</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-espresso-800">Email</span>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={form.email}
              onChange={onChange}
              required
              className="w-full rounded-2xl border border-linen-300 px-4 py-3 text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-espresso-800">Password</span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              required
              className="w-full rounded-2xl border border-linen-300 px-4 py-3 text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-espresso-700">
            <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={onChange} className="rounded" />
            Remember me
          </label>

          {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-carissma-600 py-3.5 font-semibold text-white transition hover:bg-carissma-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-espresso-400">
          All Rights Reserved By Teknulugy Company @{new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
