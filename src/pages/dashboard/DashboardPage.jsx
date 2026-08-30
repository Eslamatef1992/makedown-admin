import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { getResource } from '../../api/adminApi';

const CARDS = [
  { key: 'totalUsers', label: 'Total users' },
  { key: 'specialUsers', label: 'Special users' },
  { key: 'totalSchools', label: 'Active schools' },
  { key: 'totalProducts', label: 'Active products' },
  { key: 'totalOrders', label: 'Total orders' },
  { key: 'guestOrders', label: 'Guest orders' },
  { key: 'pendingOrders', label: 'Pending orders' },
  { key: 'revenue', label: 'Revenue (KWD)' },
  { key: 'activeGameSessions', label: 'Active game sessions' },
  { key: 'totalQuizzes', label: 'Active games' },
  { key: 'newContactMessages', label: 'New messages' },
  { key: 'totalPackagesSold', label: 'Packages sold' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getResource('/admin/dashboard/stats')
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || 'Could not load stats'));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {error && <p className="mb-4 rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div key={c.key} className="rounded-2xl border border-linen-200 bg-white p-5">
            <p className="text-sm text-espresso-500">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold text-espresso-900">{stats ? stats[c.key] : '—'}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
