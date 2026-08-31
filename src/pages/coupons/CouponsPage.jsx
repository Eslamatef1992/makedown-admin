import { useTranslation } from 'react-i18next';
import CrudPage from '../generic/CrudPage';

const TYPE_OPTIONS = (t) => [
  { value: 'percentage', label: t('coupons.percentage') },
  { value: 'fixed', label: t('coupons.fixed') },
];

export default function CouponsPage() {
  const { t } = useTranslation();
  return (
    <CrudPage
      title={t('coupons.title')}
      basePath="/admin/coupons"
      columns={[
        { key: 'code', label: t('coupons.code') },
        {
          key: 'value',
          label: t('coupons.discount'),
          render: (r) => (r.type === 'percentage' ? `${r.value}%` : `${r.value} KWD`),
        },
        { key: 'used_count', label: t('coupons.used'), render: (r) => `${r.used_count}${r.max_uses ? ` / ${r.max_uses}` : ''}` },
        { key: 'expires_at', label: t('coupons.expiresAt'), render: (r) => (r.expires_at ? new Date(r.expires_at).toLocaleDateString() : '—') },
        { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
      ]}
      fields={[
        { name: 'code', label: t('coupons.code'), required: true, placeholder: 'e.g. WELCOME10' },
        { name: 'type', label: t('coupons.type'), type: 'select', options: TYPE_OPTIONS(t), required: true },
        { name: 'value', label: t('coupons.value'), type: 'number', required: true },
        { name: 'minSubtotal', label: t('coupons.minSubtotal'), type: 'number' },
        { name: 'maxUses', label: t('coupons.maxUses'), type: 'number' },
        { name: 'expiresAt', label: t('coupons.expiresAt'), type: 'datetime-local' },
        { name: 'isActive', label: t('common.active'), type: 'checkbox' },
      ]}
      toForm={(row) => ({
        code: row.code,
        type: row.type,
        value: row.value,
        minSubtotal: row.min_subtotal,
        maxUses: row.max_uses,
        expiresAt: row.expires_at ? String(row.expires_at).slice(0, 16) : '',
        isActive: Boolean(row.is_active),
      })}
    />
  );
}
