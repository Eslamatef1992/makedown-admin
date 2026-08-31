import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { listResource, updateResource, createResource } from '../../api/adminApi';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  followersCount: 0,
  followingCount: 0,
};

export default function UsersPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isSpecial = pathname.startsWith('/users/special');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      email: row.email || '',
      phone: row.phone || '',
      password: '',
      followersCount: row.followers_count ?? 0,
      followingCount: row.following_count ?? 0,
    });
    setError('');
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!form.firstName || !form.lastName || (!editing && (!form.email || !form.password))) {
      setError(t('common.fillRequired'));
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (editing) {
        await updateResource(`/admin/users/${editing.id}`, {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          followersCount: Number(form.followersCount) || 0,
          followingCount: Number(form.followingCount) || 0,
        });
      } else {
        await createResource('/admin/users', {
          ...form,
          followersCount: Number(form.followersCount) || 0,
          followingCount: Number(form.followingCount) || 0,
        });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
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
  ];

  if (isSpecial) {
    columns.push(
      { key: 'followers_count', label: t('users.followersCount'), render: (r) => r.followers_count ?? 0 },
      { key: 'following_count', label: t('users.followingCount'), render: (r) => r.following_count ?? 0 }
    );
  }

  return (
    <AdminLayout title={isSpecial ? t('users.specialTitle') : t('users.title')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('users.searchPlaceholder')}
          className="w-64 rounded-xl border border-linen-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
        />
        {isSpecial && (
          <button onClick={openCreate} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
            {t('users.addSpecialUser')}
          </button>
        )}
      </div>

      <DataTable loading={loading} rows={rows} columns={columns} onEdit={isSpecial ? openEdit : undefined} />

      <Modal
        open={modalOpen}
        title={editing ? t('users.editSpecialUser') : t('users.addSpecialUser')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-espresso-600 hover:bg-linen-100">
              {t('common.cancel')}
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700 disabled:opacity-60"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </>
        }
      >
        {error && <p className="mb-4 rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('users.firstName')}</span>
            <input
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('users.lastName')}</span>
            <input
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('common.email')}</span>
            <input
              type="email"
              value={form.email}
              disabled={Boolean(editing)}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500 disabled:bg-linen-50 disabled:text-espresso-400"
            />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('common.phone')}</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          </div>
        </div>

        {!editing && (
          <div className="mb-4">
            <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('users.password')}</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('users.followersCount')}</span>
            <input
              type="number"
              min="0"
              value={form.followersCount}
              onChange={(e) => setForm((f) => ({ ...f, followersCount: e.target.value }))}
              className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('users.followingCount')}</span>
            <input
              type="number"
              min="0"
              value={form.followingCount}
              onChange={(e) => setForm((f) => ({ ...f, followingCount: e.target.value }))}
              className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
