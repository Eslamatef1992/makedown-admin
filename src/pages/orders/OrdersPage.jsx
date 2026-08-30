import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { listResource, getResource, updateResource } from '../../api/adminApi';

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function OrdersPage() {
  const { t } = useTranslation();
  const { scope } = useParams(); // 'guest' for /orders/guest
  const isGuest = scope === 'guest';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = isGuest ? { guest: '1' } : {};
      const result = await listResource('/admin/orders', params);
      setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    load();
  }, [load]);

  const view = async (row) => {
    const detail = await getResource(`/admin/orders/${row.id}`);
    setViewing(detail);
    setOpen(true);
  };

  const changeStatus = async (status) => {
    await updateResource(`/admin/orders/${viewing.id}`, { status });
    const detail = await getResource(`/admin/orders/${viewing.id}`);
    setViewing(detail);
    load();
  };

  return (
    <AdminLayout title={isGuest ? t('orders.guestTitle') : t('orders.title')}>
      <DataTable
        loading={loading}
        rows={rows}
        columns={[
          { key: 'order_number', label: t('orders.orderNumber') },
          { key: 'user_name', label: t('orders.customer'), render: (r) => r.user_name || r.guest_name || t('orders.guest') },
          { key: 'status', label: t('common.status') },
          { key: 'payment_status', label: t('orders.payment') },
          { key: 'grand_total', label: t('orders.total') },
          { key: 'created_at', label: t('orders.date') },
        ]}
        onEdit={view}
      />

      <Modal open={open} title={viewing ? t('orders.orderTitle', { number: viewing.order_number }) : ''} onClose={() => setOpen(false)}>
        {viewing && (
          <div className="space-y-4 text-sm">
            <p>
              <span className="font-medium text-espresso-700">{t('orders.customer')}:</span>{' '}
              {viewing.user_name || viewing.guest_name || t('orders.guest')} ({viewing.user_email || viewing.guest_email})
            </p>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-espresso-800">{t('common.status')}</span>
              <select
                value={viewing.status}
                onChange={(e) => changeStatus(e.target.value)}
                className="w-full rounded-xl border border-linen-300 px-3 py-2.5 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <div className="rounded-xl border border-linen-200">
              {(viewing.items || []).map((item) => (
                <div key={item.id} className="flex justify-between border-b border-linen-100 px-4 py-2 last:border-0">
                  <span>{item.product_name_snapshot} × {item.quantity}</span>
                  <span>{item.line_total} KWD</span>
                </div>
              ))}
            </div>
            <p className="text-end font-semibold text-espresso-900">{t('orders.total2', { amount: viewing.grand_total })}</p>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
