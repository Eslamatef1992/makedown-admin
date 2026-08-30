import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Field from '../../components/ui/Field';
import { listResource, createResource, updateResource, deleteResource } from '../../api/adminApi';

/**
 * Generic list + create/edit modal + delete page, driven entirely by config.
 * Used for every simple CRUD module (admins, roles, schools, categories,
 * packages, FAQs, social links, ...). Modules that need nested data
 * (quizzes+questions, products+variants, orders, game sessions, chat,
 * roles+permissions) have their own bespoke pages instead.
 *
 * props:
 *  - title, basePath (e.g. '/admin/schools')
 *  - columns: [{ key, label, render? }]
 *  - fields: [{ name, label, type, required?, options? }]  (form for create/edit)
 *  - toForm(row) -> initial form state when editing (defaults to row itself)
 *  - searchable: boolean (adds a search box, sent as ?search=)
 *  - addLabel / editLabel: optional overrides for the create/edit modal title
 */
export default function CrudPage({ title, basePath, columns, fields, toForm, searchable = true, addLabel, editLabel }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listResource(basePath, search ? { search } : {});
      setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  }, [basePath, search]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({});
    setError('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(toForm ? toForm(row) : row);
    setError('');
    setModalOpen(true);
  };

  const onFieldChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const onSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateResource(`${basePath}/${editing.id}`, form);
      } else {
        await createResource(basePath, form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!confirm(t('common.confirmDelete'))) return;
    await deleteResource(`${basePath}/${row.id}`);
    load();
  };

  return (
    <AdminLayout title={title}>
      <div className="mb-4 flex items-center justify-between gap-3">
        {searchable ? (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search')}
            className="w-64 rounded-xl border border-linen-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
          />
        ) : (
          <div />
        )}
        {fields && (
          <button onClick={openCreate} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
            {t('common.addNew')}
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        onEdit={fields ? openEdit : undefined}
        onDelete={fields ? onDelete : undefined}
      />

      {fields && (
        <Modal
          open={modalOpen}
          title={editing ? (editLabel || t('common.edit')) : (addLabel || t('common.addNew'))}
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
          {fields.map((field) => (
            <Field key={field.name} field={field} value={form[field.name]} onChange={onFieldChange} />
          ))}
        </Modal>
      )}
    </AdminLayout>
  );
}
