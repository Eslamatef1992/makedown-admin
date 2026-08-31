import { useTranslation } from 'react-i18next';
import CrudPage from '../generic/CrudPage';

export default function PackagesPage() {
  const { t } = useTranslation();
  return (
    <CrudPage
      title={t('packages.title')}
      basePath="/admin/packages"
      columns={[
        { key: 'name_en', label: t('common.name') },
        { key: 'price', label: t('common.price') },
        { key: 'credits', label: t('common.credits') },
        { key: 'free_credits', label: 'Free games' },
        { key: 'validity_days', label: t('common.validityDays') },
        { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
      ]}
      fields={[
        { name: 'name', label: t('common.name'), bilingual: true, required: true },
        { name: 'description', label: t('common.description'), bilingual: true, type: 'textarea', required: false },
        { name: 'price', label: t('common.price'), type: 'number', required: true },
        { name: 'credits', label: t('common.credits'), type: 'number', required: true },
        { name: 'freeCredits', label: 'Free games', type: 'number' },
        { name: 'validityDays', label: t('common.validityDays'), type: 'number' },
        { name: 'sortOrder', label: t('common.sortOrder'), type: 'number' },
        { name: 'isActive', label: t('common.active'), type: 'checkbox' },
      ]}
      toForm={(row) => ({
        nameEn: row.name_en,
        nameAr: row.name_ar,
        descriptionEn: row.description_en,
        descriptionAr: row.description_ar,
        price: row.price,
        credits: row.credits,
        freeCredits: row.free_credits,
        validityDays: row.validity_days,
        sortOrder: row.sort_order,
        isActive: Boolean(row.is_active),
      })}
    />
  );
}
