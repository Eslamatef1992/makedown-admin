import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import { listResource, updateResource } from '../../api/adminApi';

export default function UsersPage() {
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
    <AdminLayout title={isSpecial ? 'Special users' : 'Users'}>
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone…"
          className="w-64 rounded-xl border border-linen-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
        />
      </div>

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'full_name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'email_verified_at', label: 'Verified', render: (r) => (r.email_verified_at ? 'Yes' : 'No') },
          {
            key: 'is_active',
            label: 'Active',
            render: (r) => (
              <button onClick={() => toggleActive(r)} className={r.is_active ? 'text-carissma-600' : 'text-espresso-400'}>
                {r.is_active ? 'Active' : 'Inactive'}
              </button>
            ),
          },
          {
            key: 'is_special',
            label: 'Special',
            render: (r) => (
              <button onClick={() => toggleSpecial(r)} className={r.is_special ? 'text-saffron-600' : 'text-espresso-400'}>
                {r.is_special ? 'Yes' : 'No'}
              </button>
            ),
          },
        ]}
      />
    </AdminLayout>
  );
}
