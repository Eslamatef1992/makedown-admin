import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import StatCard from '../../components/ui/StatCard';
import MiniAreaChart from '../../components/charts/MiniAreaChart';
import RankedBarList from '../../components/charts/RankedBarList';
import { getResource } from '../../api/adminApi';

const CARD_KEYS = [
  'totalUsers', 'specialUsers', 'totalAdmins', 'totalSchools', 'totalQuizzes', 'totalGameCategories',
  'totalProducts', 'totalPackages', 'totalPackagesSold', 'totalOrders', 'guestOrders',
  'pendingOrders', 'revenue', 'activeGameSessions', 'totalFaqs', 'newContactMessages',
];

// Where each stat card leads when clicked -- e.g. "Total users" -> the Users
// list. A few stats (revenue, pending orders) don't have their own page, so
// they route to the closest relevant section (Orders).
const CARD_ROUTES = {
  totalUsers: '/users',
  specialUsers: '/users/special',
  totalAdmins: '/admins',
  totalSchools: '/schools',
  totalQuizzes: '/quizzes',
  totalGameCategories: '/game-categories',
  totalProducts: '/products',
  totalPackages: '/packages',
  totalPackagesSold: '/packages',
  totalOrders: '/orders',
  guestOrders: '/orders/guest',
  pendingOrders: '/orders',
  revenue: '/orders',
  activeGameSessions: '/game-sessions',
  totalFaqs: '/cms/faqs',
  newContactMessages: '/contact-messages',
};

function SectionCard({ title, viewAllTo, viewAllLabel, children }) {
  return (
    <div className="rounded-2xl border border-linen-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-espresso-800">{title}</h2>
        {viewAllTo && (
          <Link to={viewAllTo} className="text-xs font-medium text-carissma-600 hover:text-carissma-700 hover:underline">
            {viewAllLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [topCategories, setTopCategories] = useState(null);
  const [salesSeries, setSalesSeries] = useState(null);
  const [newUsersSeries, setNewUsersSeries] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getResource('/admin/dashboard/stats')
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || t('dashboard.couldNotLoad')));

    getResource('/admin/dashboard/top-products').then(setTopProducts).catch(() => setTopProducts([]));
    getResource('/admin/dashboard/top-categories').then(setTopCategories).catch(() => setTopCategories([]));
    getResource('/admin/dashboard/sales-series').then(setSalesSeries).catch(() => setSalesSeries([]));
    getResource('/admin/dashboard/new-users-series').then(setNewUsersSeries).catch(() => setNewUsersSeries([]));
  }, [t]);

  const locale = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const nameKey = locale === 'ar' ? 'name_ar' : 'name_en';

  const productItems = (topProducts || [])
    .filter((p) => Number(p.qty_sold) > 0)
    .map((p) => ({
      id: p.id,
      label: (p[nameKey] || p.name_en || '').trim() || t('dashboard.unknownProduct'),
      value: Number(p.qty_sold),
      thumbnail: p.thumbnail_url,
    }));

  const categoryItems = (topCategories || [])
    .map((c) => ({
      id: c.id,
      label: (c[nameKey] || c.name_en || '').trim() || t('dashboard.unknownCategory'),
      value: Number(c.quiz_count),
      thumbnail: c.icon_url,
    }));

  return (
    <AdminLayout title={t('dashboard.title')}>
      {error && <p className="mb-4 rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CARD_KEYS.map((key) => (
          <StatCard key={key} label={t(`dashboard.${key}`)} value={stats ? stats[key] : '—'} to={CARD_ROUTES[key]} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title={t('dashboard.salesChart')} viewAllTo="/orders" viewAllLabel={t('dashboard.viewAll')}>
          <MiniAreaChart
            data={salesSeries}
            color="#DE317C"
            locale={locale}
            formatValue={(v) => `${v.toFixed(3)} ${t('dashboard.currency')}`}
            emptyLabel={t('dashboard.noData')}
          />
        </SectionCard>

        <SectionCard title={t('dashboard.newUsersDaily')} viewAllTo="/users" viewAllLabel={t('dashboard.viewAll')}>
          <MiniAreaChart
            data={newUsersSeries}
            color="#BA8B25"
            locale={locale}
            formatValue={(v) => `${v} ${t('dashboard.users')}`}
            emptyLabel={t('dashboard.noData')}
          />
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title={t('dashboard.mostSellingItems')} viewAllTo="/products" viewAllLabel={t('dashboard.viewAll')}>
          <RankedBarList
            items={topProducts === null ? null : productItems}
            color="#DE317C"
            valueSuffix={t('dashboard.sold')}
            emptyLabel={t('dashboard.noSalesYet')}
          />
        </SectionCard>

        <SectionCard title={t('dashboard.topCategories')} viewAllTo="/game-categories" viewAllLabel={t('dashboard.viewAll')}>
          <RankedBarList
            items={topCategories === null ? null : categoryItems}
            color="#BA8B25"
            valueSuffix={t('dashboard.games')}
            emptyLabel={t('dashboard.noCategoriesYet')}
          />
        </SectionCard>
      </div>
    </AdminLayout>
  );
}
