import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';

function EyeIcon({ off }) {
  return off ? (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-carissma-300">
      <path
        d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10.7 10.7 0 0112 5c5 0 9 4 10 7-.4 1.1-1.2 2.4-2.4 3.6M6.2 6.7C4 8.2 2.5 10.3 2 12c.8 2.3 3.1 5.2 6.9 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-carissma-300">
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ identifier: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
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
      const result = await login(form);
      navigate(location.state?.from || (result.role === 'school' ? '/game-sessions' : '/'));
    } catch (err) {
      setError(err.response?.data?.message || t('login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4">
      <div className="pointer-events-none absolute -start-40 bottom-0 h-[620px] w-[620px] rounded-full bg-carissma-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -end-20 top-0 h-[420px] w-[420px] rounded-full bg-carissma-50 blur-3xl" />

      <button
        onClick={toggleLanguage}
        className="absolute end-6 top-6 rounded-full border border-carissma-200 bg-white px-4 py-2 text-sm font-medium text-espresso-700 hover:bg-carissma-50"
      >
        {t('topbar.language')}
      </button>

      <div className="relative w-full max-w-md rounded-[2rem] border-4 border-carissma-300 bg-carissma-50 p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/logo-mark.png" alt="Make Down" className="mb-4 h-24 w-24 object-contain" />
          <h1 className="text-2xl font-bold text-carissma-300">{t('login.welcomeBack')}</h1>
          <p className="mt-1 text-lg font-bold text-espresso-900">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-espresso-900">{t('login.identifier')}</span>
            <div className="relative">
              <input
                type="text"
                name="identifier"
                placeholder={t('login.identifierPlaceholder')}
                value={form.identifier}
                onChange={onChange}
                required
                autoCapitalize="none"
                className="w-full rounded-2xl border border-carissma-200 bg-white px-4 py-3 text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-espresso-900">{t('login.password')}</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••"
                value={form.password}
                onChange={onChange}
                required
                className="w-full rounded-2xl border border-carissma-200 bg-white px-4 py-3 text-espresso-900 placeholder:text-carissma-300 focus:outline-none focus:ring-2 focus:ring-carissma-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 end-4 flex items-center"
                aria-label={showPassword ? t('common.hide') : t('common.show')}
              >
                <EyeIcon off={!showPassword} />
              </button>
            </div>
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-espresso-900">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={onChange}
              className="h-4 w-4 rounded accent-carissma-500"
            />
            {t('login.rememberMe')}
          </label>

          {error && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-carissma-400 py-3.5 font-bold text-white transition hover:bg-carissma-500 disabled:opacity-60"
          >
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>

        <a
          href="https://teknulugy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 block text-center text-xs font-bold text-espresso-900 transition hover:text-carissma-500 hover:underline"
        >
          {t('login.footer', { year: new Date().getFullYear() })}
        </a>
      </div>
    </div>
  );
}
