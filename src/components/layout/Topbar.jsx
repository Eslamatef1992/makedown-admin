import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function Topbar({ title }) {
  const { admin, school, role, logout } = useAdminAuth();
  const { t, i18n } = useTranslation();
  const displayName = role === 'school' ? school?.name : admin?.name;
  const displaySub = role === 'school' ? school?.code : admin?.email;

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="flex items-center justify-between border-b border-linen-200 bg-white px-6 py-4">
      <h1 className="text-lg font-semibold text-espresso-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className="rounded-full border border-linen-300 px-4 py-2 text-sm font-medium text-espresso-700 hover:bg-linen-100"
        >
          {t('topbar.language')}
        </button>
        <div className="text-end">
          <p className="text-sm font-medium text-espresso-800">{displayName}</p>
          <p className="text-xs text-espresso-500">{displaySub}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-full bg-carissma-100 px-4 py-2 text-sm font-medium text-carissma-700 hover:bg-carissma-200"
        >
          {t('topbar.logout')}
        </button>
      </div>
    </header>
  );
}
