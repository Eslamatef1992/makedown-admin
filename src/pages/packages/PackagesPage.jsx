import { useTranslation } from 'react-i18next';
import CrudPage from '../generic/CrudPage';

// Purely a display label for the tier column/select — the API only ever
// stores/returns the raw integer (see makedown-api's packages module).
const TIER_LABELS = { 1: 'Standard', 2: 'Premium', 3: 'VIP' };

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
        { key: 'tier', label: 'Tier', render: (r) => TIER_LABELS[r.tier] || r.tier },
        { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
      ]}
      fields={[
        { name: 'name', label: t('common.name'), bilingual: true, required: true },
        { name: 'description', label: t('common.description'), bilingual: true, type: 'textarea', required: false },
        { name: 'price', label: t('common.price'), type: 'number', required: true },
        { name: 'credits', label: t('common.credits'), type: 'number', required: true },
        { name: 'freeCredits', label: 'Free games', type: 'number' },
        { name: 'sortOrder', label: t('common.sortOrder'), type: 'number' },
        {
          name: 'tier',
          label: 'Tier',
          type: 'select',
          required: true,
          options: [
            { value: 1, label: 'Standard (1)' },
            { value: 2, label: 'Premium (2)' },
            { value: 3, label: 'VIP (3)' },
          ],
        },
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
        sortOrder: row.sort_order,
        tier: row.tier ?? 1,
        isActive: Boolean(row.is_active),
      })}
    />
  );
}
