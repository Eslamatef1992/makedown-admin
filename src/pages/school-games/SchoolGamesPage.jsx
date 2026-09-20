import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';

// Placeholder — Eslam is going to spec out the exact School Games flow
// (what it manages, how it differs from the regular Make Down Games /
// Schools sections) separately. This just gives the new "Education" nav
// group a real page to land on in the meantime instead of 404ing.
export default function SchoolGamesPage() {
  const { t } = useTranslation();
  return (
    <AdminLayout title={t('schoolGames.title')}>
      <div className="rounded-2xl border border-dashed border-linen-300 bg-white p-8 text-center">
        <p className="text-sm font-medium text-espresso-500">{t('schoolGames.comingSoon')}</p>
      </div>
    </AdminLayout>
  );
}
