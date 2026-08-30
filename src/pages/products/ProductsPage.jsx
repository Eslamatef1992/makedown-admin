import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Field from '../../components/ui/Field';
import BilingualField from '../../components/ui/BilingualField';
import ImageField from '../../components/ui/ImageField';
import { listResource, getResource, createResource, updateResource, deleteResource } from '../../api/adminApi';
import { findMissingField } from '../../utils/validateFields';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [variantForm, setVariantForm] = useState({ sku: '', price: '', stockQuantity: 0 });

  const [variantTypes, setVariantTypes] = useState([]);
  const [selectedTypeValues, setSelectedTypeValues] = useState({});
  const [generateForm, setGenerateForm] = useState({ price: '', compareAtPrice: '', stockQuantity: 0 });
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState('');

  useEffect(() => {
    getResource('/admin/variant-types/with-values')
      .then((rows) => setVariantTypes((rows || []).filter((r) => r.is_active)))
      .catch(() => setVariantTypes([]));
  }, []);

  const bilingualFields = [
    { name: 'name', label: t('common.name'), bilingual: true, required: true },
    { name: 'description', label: t('common.description'), bilingual: true, type: 'textarea', required: false },
  ];
  const productFields = [
    { name: 'slug', label: t('common.slug'), required: true },
    { name: 'basePrice', label: t('products.basePrice'), type: 'number', required: true },
    { name: 'thumbnailUrl', label: t('products.thumbnailUrl'), type: 'image' },
    { name: 'isActive', label: t('common.active'), type: 'checkbox' },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listResource('/admin/products', search ? { search } : {});
      setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  }, [search]);

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
    setForm({
      nameEn: row.name_en,
      nameAr: row.name_ar,
      slug: row.slug,
      descriptionEn: row.description_en,
      descriptionAr: row.description_ar,
      basePrice: row.base_price,
      thumbnailUrl: row.thumbnail_url,
      isActive: Boolean(row.is_active),
    });
    setError('');
    setModalOpen(true);
  };
  const onSave = async () => {
    if (findMissingField([...bilingualFields, ...productFields], form)) {
      setError(t('common.fillRequired'));
      return;
    }
    setError('');
    if (editing) await updateResource(`/admin/products/${editing.id}`, form);
    else await createResource('/admin/products', form);
    setModalOpen(false);
    load();
  };
  const onDelete = async (row) => {
    if (!confirm(t('products.confirmDelete'))) return;
    await deleteResource(`/admin/products/${row.id}`);
    load();
  };

  const openDetail = async (row) => {
    setDetail(await getResource(`/admin/products/${row.id}`));
    setSelectedTypeValues({});
    setGenerateForm({ price: '', compareAtPrice: '', stockQuantity: 0 });
    setGenerateMessage('');
    setDetailOpen(true);
  };

  const toggleTypeValue = (typeId, valueId) => {
    setSelectedTypeValues((prev) => {
      const current = prev[typeId] || [];
      const next = current.includes(valueId) ? current.filter((v) => v !== valueId) : [...current, valueId];
      return { ...prev, [typeId]: next };
    });
  };

  const generateVariants = async () => {
    const selections = Object.entries(selectedTypeValues)
      .filter(([, valueIds]) => valueIds.length)
      .map(([typeId, valueIds]) => ({ typeId: Number(typeId), valueIds }));
    if (!selections.length || !generateForm.price) return;
    setGenerating(true);
    setGenerateMessage('');
    try {
      const result = await createResource(`/admin/products/${detail.id}/variants/generate`, {
        selections,
        price: Number(generateForm.price),
        compareAtPrice: generateForm.compareAtPrice ? Number(generateForm.compareAtPrice) : undefined,
        stockQuantity: Number(generateForm.stockQuantity) || 0,
      });
      setGenerateMessage(t('products.generatedResult', { created: result.createdCount, skipped: result.skippedCount }));
      setDetail(await getResource(`/admin/products/${detail.id}`));
    } finally {
      setGenerating(false);
    }
  };

  const formatVariantAttrs = (v) => {
    let attrs = v.attributes_json;
    if (typeof attrs === 'string') {
      try {
        attrs = JSON.parse(attrs);
      } catch {
        attrs = {};
      }
    }
    attrs = attrs || {};
    const entries = Object.entries(attrs);
    return entries.length ? entries.map(([k, val]) => `${k}: ${val}`).join(', ') : null;
  };

  const addVariant = async () => {
    await createResource(`/admin/products/${detail.id}/variants`, {
      ...variantForm,
      price: Number(variantForm.price),
      stockQuantity: Number(variantForm.stockQuantity),
    });
    setVariantForm({ sku: '', price: '', stockQuantity: 0 });
    setDetail(await getResource(`/admin/products/${detail.id}`));
  };

  const deleteVariant = async (variantId) => {
    await deleteResource(`/admin/products/${detail.id}/variants/${variantId}`);
    setDetail(await getResource(`/admin/products/${detail.id}`));
  };

  return (
    <AdminLayout title={t('products.title')}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('common.search')}
          className="w-64 rounded-xl border border-linen-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
        />
        <button onClick={openCreate} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
          {t('common.addNew')}
        </button>
      </div>

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'name_en', label: t('common.name') },
          { key: 'base_price', label: t('products.basePrice') },
          {
            key: 'variants',
            label: t('products.variants'),
            render: (r) => (
              <button onClick={() => openDetail(r)} className="font-medium text-carissma-600 hover:underline">
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
        title={editing ? t('products.editProduct') : t('products.addProduct')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-espresso-600 hover:bg-linen-100">{t('common.cancel')}</button>
            <button onClick={onSave} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">{t('common.save')}</button>
          </>
        }
      >
        {error && <p className="mb-4 rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}
        {bilingualFields.map((f) => (
          <BilingualField key={f.name} field={f} form={form} onChange={(name, v) => setForm((s) => ({ ...s, [name]: v }))} />
        ))}
        {productFields.map((f) => {
          const change = (name, v) => setForm((s) => ({ ...s, [name]: v }));
          return f.type === 'image' ? (
            <ImageField key={f.name} field={f} value={form[f.name]} onChange={change} />
          ) : (
            <Field key={f.name} field={f} value={form[f.name]} onChange={change} />
          );
        })}
      </Modal>

      <Modal open={detailOpen} title={detail ? t('products.variantsFor', { name: detail.name_en }) : ''} onClose={() => setDetailOpen(false)}>
        {detail && (
          <div className="space-y-4">
            <div className="rounded-xl border border-linen-200">
              {(detail.variants || []).map((v) => (
                <div key={v.id} className="flex items-center justify-between border-b border-linen-100 px-4 py-2 text-sm last:border-0">
                  <span>
                    {v.sku} — {v.price} KWD — {t('products.stock')} {v.stock_quantity}
                    {formatVariantAttrs(v) && <span className="ms-2 text-espresso-400">({formatVariantAttrs(v)})</span>}
                  </span>
                  <button onClick={() => deleteVariant(v.id)} className="font-medium text-carnation-600 hover:underline">{t('common.delete')}</button>
                </div>
              ))}
              {(detail.variants || []).length === 0 && <p className="p-4 text-sm text-espresso-400">{t('products.noVariants')}</p>}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder={t('products.sku')}
                value={variantForm.sku}
                onChange={(e) => setVariantForm((f) => ({ ...f, sku: e.target.value }))}
                className="rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
              <input
                placeholder={t('common.price')}
                type="number"
                value={variantForm.price}
                onChange={(e) => setVariantForm((f) => ({ ...f, price: e.target.value }))}
                className="rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
              <input
                placeholder={t('products.stock')}
                type="number"
                value={variantForm.stockQuantity}
                onChange={(e) => setVariantForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                className="rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
            </div>
            <button onClick={addVariant} className="w-full rounded-xl bg-carissma-600 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
              {t('products.addVariant')}
            </button>

            <div className="rounded-xl border border-linen-200 p-4">
              <p className="text-sm font-semibold text-espresso-900">{t('products.generateVariants')}</p>
              <p className="mt-1 text-xs text-espresso-500">{t('products.generateVariantsHint')}</p>

              {variantTypes.length === 0 && (
                <p className="mt-3 text-sm text-espresso-400">{t('products.noVariantTypes')}</p>
              )}

              {variantTypes.map((vt) => (
                <div key={vt.id} className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-espresso-500">{vt.name_en}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {(vt.values || []).map((val) => {
                      const active = (selectedTypeValues[vt.id] || []).includes(val.id);
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => toggleTypeValue(vt.id, val.id)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                            active
                              ? 'border-carissma-600 bg-carissma-600 text-white'
                              : 'border-linen-300 text-espresso-700 hover:border-carissma-400'
                          }`}
                        >
                          {val.value_en}
                        </button>
                      );
                    })}
                    {(vt.values || []).length === 0 && <span className="text-xs text-espresso-400">{t('variantTypes.noValues')}</span>}
                  </div>
                </div>
              ))}

              {variantTypes.length > 0 && (
                <>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <input
                      placeholder={t('common.price')}
                      type="number"
                      value={generateForm.price}
                      onChange={(e) => setGenerateForm((f) => ({ ...f, price: e.target.value }))}
                      className="rounded-xl border border-linen-300 px-3 py-2 text-sm"
                    />
                    <input
                      placeholder={t('products.compareAtPrice')}
                      type="number"
                      value={generateForm.compareAtPrice}
                      onChange={(e) => setGenerateForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
                      className="rounded-xl border border-linen-300 px-3 py-2 text-sm"
                    />
                    <input
                      placeholder={t('products.stock')}
                      type="number"
                      value={generateForm.stockQuantity}
                      onChange={(e) => setGenerateForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                      className="rounded-xl border border-linen-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    onClick={generateVariants}
                    disabled={generating || !generateForm.price}
                    className="mt-3 w-full rounded-xl bg-espresso-800 py-2 text-sm font-semibold text-white hover:bg-espresso-900 disabled:opacity-60"
                  >
                    {generating ? t('common.saving') : t('products.generateVariants')}
                  </button>
                  {generateMessage && <p className="mt-2 text-xs font-medium text-carissma-700">{generateMessage}</p>}
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
