import { useCallback, useEffect, useState } from 'react';
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
  newPassword: '',
};

export default function UsersPage() {
  const { t } = useTranslation();
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
      const result = await listResource('/admin/users', params);
      setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (row) => {
    await updateResource(`/admin/users/${row.id}`, { isActive: !row.is_active });
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
      newPassword: '',
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
          ...(form.newPassword ? { password: form.newPassword } : {}),
        });
      } else {
        await createResource('/admin/users', form);
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
  ];

  return (
    <AdminLayout title={t('users.title')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('users.searchPlaceholder')}
          className="w-64 rounded-xl border border-linen-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
        />
        <button onClick={openCreate} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
          {t('users.addUser')}
        </button>
      </div>

      <DataTable loading={loading} rows={rows} columns={columns} onEdit={openEdit} />

      <Modal
        open={modalOpen}
        title={editing ? t('users.editUser') : t('users.addUser')}
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

        {editing && (
          <div className="mb-4">
            <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('users.newPassword')}</span>
            <input
              type="password"
              value={form.newPassword}
              placeholder={t('users.newPasswordPlaceholder')}
              onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
            />
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
