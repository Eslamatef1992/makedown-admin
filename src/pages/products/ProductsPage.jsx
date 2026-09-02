import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Field from '../../components/ui/Field';
import BilingualField from '../../components/ui/BilingualField';
import ImageField from '../../components/ui/ImageField';
import { listResource, getResource, createResource, updateResource, deleteResource, uploadImage } from '../../api/adminApi';
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
  const [saving, setSaving] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [variantForm, setVariantForm] = useState({ sku: '', price: '', stockQuantity: 0 });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [variantError, setVariantError] = useState('');
  const [pendingImages, setPendingImages] = useState([]); // new-product images picked before the product exists yet
  const [editImages, setEditImages] = useState([]); // existing product's images, shown/added while editing
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [editImageError, setEditImageError] = useState('');

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
    { name: 'offerPrice', label: t('products.offerPrice'), type: 'number', required: false },
    { name: 'quantity', label: t('products.quantity'), type: 'number', required: false },
    { name: 'hasGiftBox', label: t('products.hasGiftBox'), type: 'checkbox' },
    { name: 'giftBoxPrice', label: t('products.giftBoxPrice'), type: 'number', required: false },
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
    setPendingImages([]);
    setModalOpen(true);
  };
  const openEdit = async (row) => {
    setEditing(row);
    setForm({
      nameEn: row.name_en,
      nameAr: row.name_ar,
      slug: row.slug,
      descriptionEn: row.description_en,
      descriptionAr: row.description_ar,
      basePrice: row.base_price,
      offerPrice: row.offer_price ?? '',
      quantity: row.stock_quantity ?? '',
      hasGiftBox: Boolean(row.has_gift_box),
      giftBoxPrice: row.gift_box_price ?? '',
      thumbnailUrl: row.thumbnail_url,
      isActive: Boolean(row.is_active),
    });
    setError('');
    setPendingImages([]);
    setEditImages([]);
    setEditImageError('');
    setModalOpen(true);
    // The row from the table doesn't carry the gallery images — fetch the
    // full product so the edit form can show (and let you add to) them,
    // same as the create form does for a brand-new product.
    try {
      const full = await getResource(`/admin/products/${row.id}`);
      setEditImages(full.images || []);
    } catch {
      setEditImages([]);
    }
  };

  const onAddEditImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !editing) return;
    setUploadingEditImage(true);
    setEditImageError('');
    try {
      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        const url = await uploadImage(file);
        // eslint-disable-next-line no-await-in-loop
        await createResource(`/admin/products/${editing.id}/images`, { imageUrl: url });
      }
      const full = await getResource(`/admin/products/${editing.id}`);
      setEditImages(full.images || []);
    } catch (err) {
      setEditImageError(err.response?.data?.message || t('common.uploadFailed'));
    } finally {
      setUploadingEditImage(false);
      e.target.value = '';
    }
  };

  const removeEditImage = async (imageId) => {
    await deleteResource(`/admin/products/${editing.id}/images/${imageId}`);
    setEditImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const onPickPendingImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPendingImages((prev) => [...prev, ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))]);
    e.target.value = '';
  };

  const removePendingImage = (index) => {
    setPendingImages((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };
  const onSave = async () => {
    if (findMissingField([...bilingualFields, ...productFields], form)) {
      setError(t('common.fillRequired'));
      return;
    }
    setError('');
    setSaving(true);
    try {
      if (editing) {
        await updateResource(`/admin/products/${editing.id}`, form);
        setModalOpen(false);
        load();
        return;
      }
      // New product: create it, then immediately drop into the manage modal
      // (images + variants) so the admin can add the product's gallery
      // images right away instead of having to close this modal and hunt
      // for "Manage".
      const createdProduct = await createResource('/admin/products', form);
      // Upload any images the admin already picked in the create form
      // itself, so they don't have to redo it in the follow-up Manage step.
      for (const pending of pendingImages) {
        // eslint-disable-next-line no-await-in-loop
        const url = await uploadImage(pending.file);
        // eslint-disable-next-line no-await-in-loop
        await createResource(`/admin/products/${createdProduct.id}/images`, { imageUrl: url });
        URL.revokeObjectURL(pending.previewUrl);
      }
      setPendingImages([]);
      setModalOpen(false);
      load();
      setSelectedTypeValues({});
      setGenerateForm({ price: '', compareAtPrice: '', stockQuantity: 0 });
      setGenerateMessage('');
      setVariantError('');
      setImageError('');
      setDetail(pendingImages.length ? await getResource(`/admin/products/${createdProduct.id}`) : { ...createdProduct, variants: [], images: [] });
      setDetailOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || t('common.somethingWentWrong'));
    } finally {
      setSaving(false);
    }
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
    setVariantError('');
    setImageError('');
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
    if (!variantForm.price) {
      setImageError('');
      setVariantError(t('products.priceRequired'));
      return;
    }
    setVariantError('');
    try {
      await createResource(`/admin/products/${detail.id}/variants`, {
        ...variantForm,
        price: Number(variantForm.price),
        stockQuantity: Number(variantForm.stockQuantity),
      });
      setVariantForm({ sku: '', price: '', stockQuantity: 0 });
      setDetail(await getResource(`/admin/products/${detail.id}`));
    } catch (err) {
      setVariantError(err.response?.data?.message || t('common.somethingWentWrong'));
    }
  };

  const deleteVariant = async (variantId) => {
    await deleteResource(`/admin/products/${detail.id}/variants/${variantId}`);
    setDetail(await getResource(`/admin/products/${detail.id}`));
  };

  const onAddImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImage(true);
    setImageError('');
    try {
      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        const url = await uploadImage(file);
        // eslint-disable-next-line no-await-in-loop
        await createResource(`/admin/products/${detail.id}/images`, { imageUrl: url });
      }
      setDetail(await getResource(`/admin/products/${detail.id}`));
    } catch (err) {
      setImageError(err.response?.data?.message || t('common.uploadFailed'));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const deleteImage = async (imageId) => {
    await deleteResource(`/admin/products/${detail.id}/images/${imageId}`);
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
            <button onClick={onSave} disabled={saving} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700 disabled:opacity-60">{saving ? t('common.saving') : t('common.save')}</button>
          </>
        }
      >
        {error && <p className="mb-4 rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{error}</p>}
        {bilingualFields.map((f) => (
          <BilingualField key={f.name} field={f} form={form} onChange={(name, v) => setForm((s) => ({ ...s, [name]: v }))} />
        ))}
        {productFields.map((f) => {
          if (f.name === 'isActive') return null;
          if (f.name === 'giftBoxPrice' && !form.hasGiftBox) return null;
          const change = (name, v) => setForm((s) => ({ ...s, [name]: v }));
          return f.type === 'image' ? (
            <ImageField key={f.name} field={f} value={form[f.name]} onChange={change} />
          ) : (
            <Field key={f.name} field={f} value={form[f.name]} onChange={change} />
          );
        })}

        <div className="mb-4">
          <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('products.images')}</span>
          <div className="flex flex-wrap gap-3">
            {editing
              ? editImages.map((img) => (
                  <div key={img.id} className="group relative h-16 w-16 overflow-hidden rounded-xl border border-linen-200">
                    <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeEditImage(img.id)}
                      className="absolute inset-0 flex items-center justify-center bg-espresso-900/50 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                    >
                      {t('common.remove')}
                    </button>
                  </div>
                ))
              : pendingImages.map((img, i) => (
                  <div key={img.previewUrl} className="group relative h-16 w-16 overflow-hidden rounded-xl border border-linen-200">
                    <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePendingImage(i)}
                      className="absolute inset-0 flex items-center justify-center bg-espresso-900/50 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                    >
                      {t('common.remove')}
                    </button>
                  </div>
                ))}
          </div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            multiple
            onChange={editing ? onAddEditImages : onPickPendingImages}
            disabled={editing && uploadingEditImage}
            className="mt-3 w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm text-espresso-900 file:me-3 file:rounded-lg file:border-0 file:bg-carissma-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-carissma-700 hover:file:bg-carissma-200 focus:outline-none focus:ring-2 focus:ring-carissma-500 disabled:opacity-60"
          />
          {editing && uploadingEditImage && <p className="mt-1.5 text-xs text-espresso-400">{t('common.uploading')}</p>}
          {editing && editImageError && <p className="mt-1.5 text-xs text-carnation-600">{editImageError}</p>}
        </div>

        {productFields.filter((f) => f.name === 'isActive').map((f) => (
          <Field key={f.name} field={f} value={form[f.name]} onChange={(name, v) => setForm((s) => ({ ...s, [name]: v }))} />
        ))}
      </Modal>

      <Modal open={detailOpen} title={detail ? t('products.manageFor', { name: detail.name_en }) : ''} onClose={() => setDetailOpen(false)}>
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

            <div className="rounded-xl border border-linen-200 p-4">
              <p className="text-sm font-semibold text-espresso-900">{t('products.images')}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {(detail.images || []).map((img) => (
                  <div key={img.id} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-linen-200">
                    <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => deleteImage(img.id)}
                      className="absolute inset-0 flex items-center justify-center bg-espresso-900/50 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
                    >
                      {t('common.remove')}
                    </button>
                  </div>
                ))}
                {(detail.images || []).length === 0 && <p className="text-sm text-espresso-400">{t('products.noImages')}</p>}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                multiple
                onChange={onAddImages}
                disabled={uploadingImage}
                className="mt-3 w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm text-espresso-900 file:me-3 file:rounded-lg file:border-0 file:bg-carissma-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-carissma-700 hover:file:bg-carissma-200 focus:outline-none focus:ring-2 focus:ring-carissma-500 disabled:opacity-60"
              />
              {uploadingImage && <p className="mt-1.5 text-xs text-espresso-400">{t('common.uploading')}</p>}
              {imageError && <p className="mt-1.5 text-xs text-carnation-600">{imageError}</p>}
            </div>

            {variantError && <p className="rounded-xl bg-carnation-50 px-3 py-2 text-sm text-carnation-700">{variantError}</p>}
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
