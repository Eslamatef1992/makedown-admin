import { useTranslation } from 'react-i18next';
import CrudPage from '../generic/CrudPage';

export default function PackagesPage() {
  const { t } = useTranslation();
  return (
    <CrudPage
      title={t('packages.title')}
      basePath="/admin/packages"
      columns={[
        { key: 'name', label: t('common.name') },
        { key: 'price', label: t('common.price') },
        { key: 'credits', label: t('common.credits') },
        { key: 'validity_days', label: t('common.validityDays') },
        { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
      ]}
      fields={[
        { name: 'name', label: t('common.name'), required: true },
        { name: 'description', label: t('common.description'), type: 'textarea' },
        { name: 'price', label: t('common.price'), type: 'number', required: true },
        { name: 'credits', label: t('common.credits'), type: 'number', required: true },
        { name: 'validityDays', label: t('common.validityDays'), type: 'number' },
        { name: 'sortOrder', label: t('common.sortOrder'), type: 'number' },
        { name: 'isActive', label: t('common.active'), type: 'checkbox' },
      ]}
      toForm={(row) => ({
        name: row.name,
        description: row.description,
        price: row.price,
        credits: row.credits,
        validityDays: row.validity_days,
        sortOrder: row.sort_order,
        isActive: Boolean(row.is_active),
      })}
    />
  );
}
