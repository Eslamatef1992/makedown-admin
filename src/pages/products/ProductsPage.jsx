import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Field from '../../components/ui/Field';
import { listResource, getResource, createResource, updateResource, deleteResource } from '../../api/adminApi';

export default function ProductsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [variantForm, setVariantForm] = useState({ sku: '', price: '', stockQuantity: 0 });

  const productFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'slug', label: 'Slug', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'basePrice', label: 'Base price (KWD)', type: 'number', required: true },
    { name: 'thumbnailUrl', label: 'Thumbnail URL' },
    { name: 'isActive', label: 'Active', type: 'checkbox' },
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
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name,
      slug: row.slug,
      description: row.description,
      basePrice: row.base_price,
      thumbnailUrl: row.thumbnail_url,
      isActive: Boolean(row.is_active),
    });
    setModalOpen(true);
  };
  const onSave = async () => {
    if (editing) await updateResource(`/admin/products/${editing.id}`, form);
    else await createResource('/admin/products', form);
    setModalOpen(false);
    load();
  };
  const onDelete = async (row) => {
    if (!confirm('Delete this product (and its variants)?')) return;
    await deleteResource(`/admin/products/${row.id}`);
    load();
  };

  const openDetail = async (row) => {
    setDetail(await getResource(`/admin/products/${row.id}`));
    setDetailOpen(true);
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
    <AdminLayout title="Ecommerce — Products">
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-64 rounded-xl border border-linen-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-500"
        />
        <button onClick={openCreate} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
          + Add new
        </button>
      </div>

      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'base_price', label: 'Base price (KWD)' },
          {
            key: 'variants',
            label: 'Variants',
            render: (r) => (
              <button onClick={() => openDetail(r)} className="font-medium text-carissma-600 hover:underline">
                Manage
              </button>
            ),
          },
          { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
        ]}
        onEdit={openEdit}
        onDelete={onDelete}
      />

      <Modal
        open={modalOpen}
        title={editing ? 'Edit product' : 'Add product'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-espresso-600 hover:bg-linen-100">Cancel</button>
            <button onClick={onSave} className="rounded-xl bg-carissma-600 px-4 py-2 text-sm font-semibold text-white hover:bg-carissma-700">Save</button>
          </>
        }
      >
        {productFields.map((f) => (
          <Field key={f.name} field={f} value={form[f.name]} onChange={(name, v) => setForm((s) => ({ ...s, [name]: v }))} />
        ))}
      </Modal>

      <Modal open={detailOpen} title={detail ? `Variants — ${detail.name}` : ''} onClose={() => setDetailOpen(false)}>
        {detail && (
          <div className="space-y-4">
            <div className="rounded-xl border border-linen-200">
              {(detail.variants || []).map((v) => (
                <div key={v.id} className="flex items-center justify-between border-b border-linen-100 px-4 py-2 text-sm last:border-0">
                  <span>{v.sku} — {v.price} KWD — stock {v.stock_quantity}</span>
                  <button onClick={() => deleteVariant(v.id)} className="font-medium text-carnation-600 hover:underline">Delete</button>
                </div>
              ))}
              {(detail.variants || []).length === 0 && <p className="p-4 text-sm text-espresso-400">No variants yet</p>}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder="SKU"
                value={variantForm.sku}
                onChange={(e) => setVariantForm((f) => ({ ...f, sku: e.target.value }))}
                className="rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Price"
                type="number"
                value={variantForm.price}
                onChange={(e) => setVariantForm((f) => ({ ...f, price: e.target.value }))}
                className="rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
              <input
                placeholder="Stock"
                type="number"
                value={variantForm.stockQuantity}
                onChange={(e) => setVariantForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                className="rounded-xl border border-linen-300 px-3 py-2 text-sm"
              />
            </div>
            <button onClick={addVariant} className="w-full rounded-xl bg-carissma-600 py-2 text-sm font-semibold text-white hover:bg-carissma-700">
              + Add variant
            </button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
