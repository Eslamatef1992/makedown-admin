import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import { listResource, updateResource } from '../../api/adminApi';

export default function UsersPage() {
  const { t } = useTranslation();
  const { scope } = useParams(); // undefined for /users, 'special' for /users/special
  const isSpecial = scope === 'special';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      if (isSpecial) params.is_special = 1;
      const result = await listResource('/admin/users', params);
      setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  }, [search, isSpecial]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (row) => {
    await updateResource(`/admin/users/${row.id}`, { isActive: !row.is_active });
    load();
  };

  const toggleSpecial = async (row) => {
    await updateResource(`/admin/users/${row.id}`, { isSpecial: !row.is_special });
    load();
  };

  return (
    <AdminLayout title={isSpecial ? t('users.specialTitle') : t('users.title')}>
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('users.searchPlaceholder')}
          className="w-64 rounded-xl border border-linen-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
        />
      </div>

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'full_name', label: t('common.name') },
          { key: 'email', label: t('common.email') },
          { key: 'phone', label: t('common.phone') },
          { key: 'email_verified_at', label: t('users.verified'), render: (r) => (r.email_verified_at ? t('common.yes') : t('common.no')) },
          {
            key: 'is_active',
            label: t('common.active'),
            render: (r) => (
              <button onClick={() => toggleActive(r)} className={r.is_active ? 'text-carissma-600' : 'text-espresso-400'}>
                {r.is_active ? t('common.active') : t('common.inactive')}
              </button>
            ),
          },
          {
            key: 'is_special',
            label: t('users.special'),
            render: (r) => (
              <button onClick={() => toggleSpecial(r)} className={r.is_special ? 'text-saffron-600' : 'text-espresso-400'}>
                {r.is_special ? t('common.yes') : t('common.no')}
              </button>
            ),
          },
        ]}
      />
    </AdminLayout>
  );
}
