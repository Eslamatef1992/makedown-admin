import { useTranslation } from 'react-i18next';
import CrudPage from '../generic/CrudPage';

export default function AdminsPage() {
  const { t } = useTranslation();
  return (
    <CrudPage
      title={t('admins.title')}
      basePath="/admin/admins"
      columns={[
        { key: 'name', label: t('common.name') },
        { key: 'email', label: t('common.email') },
        { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
        { key: 'last_login_at', label: t('admins.lastLogin'), render: (r) => r.last_login_at || '—' },
      ]}
      fields={[
        { name: 'name', label: t('common.name'), required: true },
        { name: 'email', label: t('common.email'), type: 'email', required: true },
        { name: 'password', label: t('admins.password'), type: 'password' },
        { name: 'isActive', label: t('common.active'), type: 'checkbox' },
      ]}
      toForm={(row) => ({ name: row.name, email: row.email, isActive: Boolean(row.is_active) })}
    />
  );
}
