import { useTranslation } from 'react-i18next';
import CrudPage from '../generic/CrudPage';

export default function GameCategoriesPage() {
  const { t } = useTranslation();
  return (
    <CrudPage
      title={t('gameCategories.title')}
      basePath="/admin/game-categories"
      columns={[
        { key: 'name_en', label: t('common.name') },
        { key: 'slug', label: t('common.slug') },
        { key: 'sort_order', label: t('common.order') },
        { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
      ]}
      fields={[
        { name: 'name', label: t('common.name'), bilingual: true, required: true },
        { name: 'slug', label: t('common.slug'), required: true },
        { name: 'sortOrder', label: t('common.sortOrder'), type: 'number' },
        { name: 'isActive', label: t('common.active'), type: 'checkbox' },
      ]}
      toForm={(row) => ({ nameEn: row.name_en, nameAr: row.name_ar, slug: row.slug, sortOrder: row.sort_order, isActive: Boolean(row.is_active) })}
    />
  );
}
