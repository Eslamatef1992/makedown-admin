import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import BilingualField from '../../components/ui/BilingualField';
import Field from '../../components/ui/Field';
import { listResource, getResource, createResource, updateResource, deleteResource } from '../../api/adminApi';
import { findMissingField } from '../../utils/validateFields';

// Manage reusable variant types (e.g. Color, Width, Height) and, per type,
// the fixed list of values (e.g. Red/Blue, Small/Large). Products then pick
// which of these types+values apply when generating their variants — see
// ProductsPage's "Generate Variants" panel.
export default function VariantTypesPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const [valuesOpen, setValuesOpen] = useState(false);
  const [valuesFor, setValuesFor] = useState(null);
  const [valueForm, setValueForm] = useState({ valueEn: '', valueAr: '', hexColor: '' });

  const typeFields = [
    { name: 'name', label: t('common.name'), bilingual: true, required: true },
    { name: 'slug', label: t('common.slug'), required: true },
    { name: 'isActive', label: t('common.active'), type: 'checkbox' },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listResource('/admin/variant-types', {});
      setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ isActive: true });
    setError('');
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({ nameEn: row.name_en, nameAr: row.name_ar, slug: row.slug, isActive: Boolean(row.is_active) });
    setError('');
    setModalOpen(true);
  };
  const onSave = async () => {
    if (findMissingField(typeFields, form)) {
      setError(t('common.fillRequired'));
      return;
    }
    setError('');
    try {
      if (editing) await updateResource(`/admin/variant-types/${editing.id}`, form);
      else await createResource('/admin/variant-types', form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    }
  };
  const onDelete = async (row) => {
    if (!confirm(t('common.confirmDelete'))) return;
    await deleteResource(`/admin/variant-types/${row.id}`);
    load();
  };

  const openValues = async (row) => {
    const list = await getResource('/admin/variant-types/with-values');
    const fresh = (list || []).find((t2) => t2.id === row.id);
    setValuesFor(fresh || { ...row, values: [] });
    setValuesOpen(true);
  };

  const refreshValues = async () => {
    const list = await getResource('/admin/variant-types/with-values');
    const fresh = (list || []).find((t2) => t2.id === valuesFor.id);
    setValuesFor(fresh || null);
  };

  const addValue = async () => {
    if (!valueForm.valueEn.trim() || !valueForm.valueAr.trim()) return;
    await createResource(`/admin/variant-types/${valuesFor.id}/values`, {
      ...valueForm,
      hexColor: valueForm.hexColor || undefined,
    });
    setValueForm({ valueEn: '', valueAr: '', hexColor: '' });
    await refreshValues();
  };

  const deleteValue = async (valueId) => {
    await deleteResource(`/admin/variant-types/${valuesFor.id}/values/${valueId}`);
    await refreshValues();
  };

  return (
    <AdminLayout title={t('variantTypes.title')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-espresso-500">{t('variantTypes.hint')}</p>
        <button onClick={openCreate} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
          {t('common.addNew')}
        </button>
      </div>

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'name_en', label: t('common.name') },
          { key: 'slug', label: t('common.slug') },
          {
            key: 'values',
            label: t('variantTypes.values'),
            render: (r) => (
              <button onClick={() => openValues(r)} className="font-medium text-carissma-600 hover:underline">
                {t('common.manage')}
              </button>
            ),
          },
          { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
        ]}
        onEdit={openEdit}
        onDelete={onDelete}
      />

      <Modal
        open={modalOpen}
        title={editing ? t('common.edit') : t('common.addNew')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-espresso-600 hover:bg-linen-100">
              {t('common.cancel')}
            </button>
            <button onClick={onSave} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
              {t('common.save')}
            </button>
          </>
        }
      >
        {error && <p className="mb-4 rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}
        {typeFields.map((f) => {
          const change = (name, v) => setForm((s) => ({ ...s, [name]: v }));
          return f.bilingual ? (
            <BilingualField key={f.name} field={f} form={form} onChange={change} />
          ) : (
            <Field key={f.name} field={f} value={form[f.name]} onChange={change} />
          );
        })}
      </Modal>

      <Modal
        open={valuesOpen}
        title={valuesFor ? t('variantTypes.valuesFor', { name: valuesFor.name_en }) : ''}
        onClose={() => setValuesOpen(false)}
      >
        {valuesFor && (
          <div className="space-y-4">
            <div className="rounded-xl border border-linen-200">
              {(valuesFor.values || []).map((v) => (
                <div key={v.id} className="flex items-center justify-between border-b border-linen-100 px-4 py-2 text-sm last:border-0">
                  <span className="flex items-center gap-2">
                    {v.hex_color && (
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-linen-300"
                        style={{ backgroundColor: v.hex_color }}
                      />
                    )}
                    {v.value_en} / {v.value_ar}
                  </span>
                  <button onClick={() => deleteValue(v.id)} className="font-medium text-carnation-600 hover:underline">
                    {t('common.delete')}
                  </button>
                </div>
              ))}
              {(valuesFor.values || []).length === 0 && <p className="p-4 text-sm text-espresso-400">{t('variantTypes.noValues')}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder={t('variantTypes.valueEn')}
                value={valueForm.valueEn}
                onChange={(e) => setValueForm((f) => ({ ...f, valueEn: e.target.value }))}
                className="rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
              <input
                placeholder={t('variantTypes.valueAr')}
                value={valueForm.valueAr}
                onChange={(e) => setValueForm((f) => ({ ...f, valueAr: e.target.value }))}
                dir="rtl"
                className="rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="value-hex-color" className="text-sm text-espresso-600">
                {t('variantTypes.hexColor')}
              </label>
              <input
                id="value-hex-color"
                type="color"
                value={valueForm.hexColor || '#ffffff'}
                onChange={(e) => setValueForm((f) => ({ ...f, hexColor: e.target.value }))}
                className="h-9 w-14 cursor-pointer rounded-lg border border-linen-300 p-1"
              />
              {valueForm.hexColor && (
                <button
                  type="button"
                  onClick={() => setValueForm((f) => ({ ...f, hexColor: '' }))}
                  className="text-xs font-medium text-espresso-500 hover:underline"
                >
                  {t('common.remove')}
                </button>
              )}
            </div>
            <button onClick={addValue} className="w-full rounded-xl bg-carissma-600 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
              {t('variantTypes.addValue')}
            </button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
