import CrudPage from '../generic/CrudPage';

export default function SocialLinksPage() {
  return (
    <CrudPage
      title="Social media"
      basePath="/admin/cms/social-links"
      searchable={false}
      columns={[
        { key: 'platform', label: 'Platform' },
        { key: 'url', label: 'URL' },
        { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
      ]}
      fields={[
        { name: 'platform', label: 'Platform (e.g. Instagram)', required: true },
        { name: 'url', label: 'URL', required: true },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
        { name: 'isActive', label: 'Active', type: 'checkbox' },
      ]}
      toForm={(row) => ({ platform: row.platform, url: row.url, sortOrder: row.sort_order, isActive: Boolean(row.is_active) })}
    />
  );
}
