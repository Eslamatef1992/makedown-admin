import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { listResource, getResource, updateResource } from '../../api/adminApi';

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUS_OPTIONS = ['unpaid', 'paid', 'failed', 'refunded'];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function formatAddress(shippingAddressJson) {
  if (!shippingAddressJson) return '';
  try {
    const a = typeof shippingAddressJson === 'string' ? JSON.parse(shippingAddressJson) : shippingAddressJson;
    return [a.governorate, a.area, a.block && `Block ${a.block}`, a.street].filter(Boolean).join(', ');
  } catch {
    return '';
  }
}

function printHtml(title, bodyHtml) {
  const win = window.open('', '_blank', 'width=860,height=960');
  if (!win) return;
  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Arial, sans-serif; color: #3b2320; padding: 32px; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  h2 { font-size: 13px; font-weight: 600; color: #8a6a66; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: 0.04em; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { text-align: start; padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #eee; }
  th { background: #faf5f3; color: #6b4a46; }
  .meta { font-size: 13px; color: #6b4a46; margin: 2px 0; }
  .total { text-align: end; font-size: 15px; font-weight: 700; margin-top: 12px; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>${bodyHtml}</body>
</html>`);
  win.document.close();
  win.focus();
  win.print();
}

export default function OrdersPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const isGuest = location.pathname.startsWith('/orders/guest');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { pageSize: 100 };
      if (isGuest) params.guest = '1';
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;
      const result = await listResource('/admin/orders', params);
      setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  }, [isGuest, statusFilter, paymentFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) => {
      const haystack = [
        r.order_number,
        r.user_name,
        r.guest_name,
        r.user_email,
        r.guest_email,
        r.guest_phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [rows, search]);

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

  const printList = () => {
    const rowsHtml = filteredRows
      .map(
        (r) => `<tr>
          <td>${escapeHtml(r.order_number)}</td>
          <td>${escapeHtml(r.user_name || r.guest_name || t('orders.guest'))}</td>
          <td>${escapeHtml(r.status)}</td>
          <td>${escapeHtml(r.payment_status)}</td>
          <td>${escapeHtml(Number(r.grand_total).toFixed(3))} ${escapeHtml(r.currency || 'KWD')}</td>
          <td>${escapeHtml(new Date(r.created_at).toLocaleString())}</td>
        </tr>`
      )
      .join('');
    const body = `
      <h1>${escapeHtml(isGuest ? t('orders.guestTitle') : t('orders.title'))}</h1>
      <p class="meta">${escapeHtml(new Date().toLocaleString())} — ${filteredRows.length} ${escapeHtml(t('orders.orderNumber'))}(s)</p>
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t('orders.orderNumber'))}</th>
            <th>${escapeHtml(t('orders.customer'))}</th>
            <th>${escapeHtml(t('common.status'))}</th>
            <th>${escapeHtml(t('orders.payment'))}</th>
            <th>${escapeHtml(t('orders.total'))}</th>
            <th>${escapeHtml(t('orders.date'))}</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>`;
    printHtml(isGuest ? t('orders.guestTitle') : t('orders.title'), body);
  };

  const printOrder = (order) => {
    const items = order.items || [];
    const itemsHtml = items
      .map(
        (item) => `<tr>
          <td>${escapeHtml(item.product_name_snapshot)}</td>
          <td>${escapeHtml(item.quantity)}</td>
          <td>${escapeHtml(Number(item.line_total).toFixed(3))} ${escapeHtml(order.currency || 'KWD')}</td>
        </tr>`
      )
      .join('');
    const body = `
      <h1>${escapeHtml(t('orders.orderTitle', { number: order.order_number }))}</h1>
      <p class="meta">${escapeHtml(order.user_name || order.guest_name || t('orders.guest'))} — ${escapeHtml(order.user_email || order.guest_email || '')}</p>
      <p class="meta">${escapeHtml(t('common.status'))}: ${escapeHtml(order.status)} · ${escapeHtml(t('orders.payment'))}: ${escapeHtml(order.payment_status)}</p>
      <p class="meta">${escapeHtml(new Date(order.created_at).toLocaleString())}</p>
      <h2>${escapeHtml(t('orders.orderNumber'))}</h2>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p class="total">${escapeHtml(t('orders.total2', { amount: order.grand_total }))}</p>`;
    printHtml(t('orders.orderTitle', { number: order.order_number }), body);
  };

  const printRow = async (row) => {
    const detail = await getResource(`/admin/orders/${row.id}`);
    printOrder(detail);
  };

  return (
    <AdminLayout title={isGuest ? t('orders.guestTitle') : t('orders.title')}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('orders.searchPlaceholder')}
          className="w-full max-w-xs rounded-xl border border-linen-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-linen-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-400"
        >
          <option value="">{t('orders.allStatuses')}</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="rounded-xl border border-linen-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-carissma-400"
        >
          <option value="">{t('orders.allPaymentStatuses')}</option>
          {PAYMENT_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={printList}
          className="ms-auto rounded-xl border border-linen-300 bg-white px-4 py-2.5 text-sm font-semibold text-espresso-800 hover:bg-linen-50"
        >
          {t('orders.print')}
        </button>
      </div>

      <DataTable
        loading={loading}
        rows={filteredRows}
        columns={[
          { key: 'order_number', label: t('orders.orderNumber') },
          { key: 'user_name', label: t('orders.customer'), render: (r) => r.user_name || r.guest_name || t('orders.guest') },
          {
            key: 'address',
            label: t('orders.address'),
            render: (r) => (
              <span className="block max-w-[220px] truncate" title={formatAddress(r.shipping_address_json)}>
                {formatAddress(r.shipping_address_json) || '—'}
              </span>
            ),
          },
          { key: 'status', label: t('common.status') },
          { key: 'payment_status', label: t('orders.payment') },
          { key: 'grand_total', label: t('orders.total'), render: (r) => `${Number(r.grand_total).toFixed(3)} ${r.currency || 'KWD'}` },
          { key: 'created_at', label: t('orders.date'), render: (r) => new Date(r.created_at).toLocaleString() },
        ]}
        onEdit={view}
        onPrint={printRow}
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
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => printOrder(viewing)}
                className="rounded-xl border border-linen-300 bg-white px-4 py-2 text-sm font-semibold text-espresso-800 hover:bg-linen-50"
              >
                {t('orders.print')}
              </button>
              <p className="text-end font-semibold text-espresso-900">{t('orders.total2', { amount: viewing.grand_total })}</p>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
