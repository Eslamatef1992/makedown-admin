import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import { getResource } from '../../api/adminApi';

const CARD_KEYS = [
  'totalUsers', 'specialUsers', 'totalSchools', 'totalProducts', 'totalOrders', 'guestOrders',
  'pendingOrders', 'revenue', 'activeGameSessions', 'totalQuizzes', 'newContactMessages', 'totalPackagesSold',
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getResource('/admin/dashboard/stats')
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || t('dashboard.couldNotLoad')));
  }, [t]);

  return (
    <AdminLayout title={t('dashboard.title')}>
      {error && <p className="mb-4 rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CARD_KEYS.map((key) => (
          <div key={key} className="rounded-2xl border border-linen-200 bg-white p-5">
            <p className="text-sm text-espresso-500">{t(`dashboard.${key}`)}</p>
            <p className="mt-2 text-2xl font-semibold text-espresso-900">{stats ? stats[key] : '—'}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
