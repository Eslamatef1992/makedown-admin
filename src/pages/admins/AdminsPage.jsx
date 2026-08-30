import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CrudPage from '../generic/CrudPage';
import { listResource } from '../../api/adminApi';

export default function AdminsPage() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    listResource('/admin/roles', { pageSize: 100 })
      .then((result) => setRoles(result.rows || []))
      .catch(() => setRoles([]));
  }, []);

  const roleName = (roleId) => roles.find((r) => String(r.id) === String(roleId))?.name || '—';

  return (
    <CrudPage
      title={t('admins.title')}
      basePath="/admin/admins"
      columns={[
        { key: 'name', label: t('common.name') },
        { key: 'email', label: t('common.email') },
        { key: 'role_id', label: t('admins.role'), render: (r) => roleName(r.role_id) },
        { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
        { key: 'last_login_at', label: t('admins.lastLogin'), render: (r) => r.last_login_at || '—' },
      ]}
      fields={[
        { name: 'name', label: t('common.name'), required: true },
        { name: 'email', label: t('common.email'), type: 'email', required: true },
        { name: 'password', label: t('admins.password'), type: 'password' },
        {
          name: 'roleId',
          label: t('admins.role'),
          type: 'select',
          required: true,
          options: roles.map((r) => ({ value: r.id, label: r.name })),
        },
        { name: 'isActive', label: t('common.active'), type: 'checkbox' },
      ]}
      toForm={(row) => ({ name: row.name, email: row.email, roleId: row.role_id ?? '', isActive: Boolean(row.is_active) })}
    />
  );
}
