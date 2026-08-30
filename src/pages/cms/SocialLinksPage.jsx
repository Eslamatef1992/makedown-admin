import { useTranslation } from 'react-i18next';
import CrudPage from '../generic/CrudPage';

export default function SocialLinksPage() {
  const { t } = useTranslation();
  return (
    <CrudPage
      title={t('socialLinks.title')}
      basePath="/admin/cms/social-links"
      searchable={false}
      columns={[
        { key: 'platform', label: t('common.platform') },
        { key: 'url', label: t('common.url') },
        { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
      ]}
      fields={[
        { name: 'platform', label: t('socialLinks.platformHint'), required: true },
        { name: 'url', label: t('common.url'), required: true },
        { name: 'sortOrder', label: t('common.sortOrder'), type: 'number' },
        { name: 'isActive', label: t('common.active'), type: 'checkbox' },
      ]}
      toForm={(row) => ({ platform: row.platform, url: row.url, sortOrder: row.sort_order, isActive: Boolean(row.is_active) })}
    />
  );
}
