import CrudPage from '../generic/CrudPage';

export default function GameCategoriesPage() {
  return (
    <CrudPage
      title="Categories"
      basePath="/admin/game-categories"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        { key: 'sort_order', label: 'Order' },
        { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'slug', label: 'Slug', required: true },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
        { name: 'isActive', label: 'Active', type: 'checkbox' },
      ]}
      toForm={(row) => ({ name: row.name, slug: row.slug, sortOrder: row.sort_order, isActive: Boolean(row.is_active) })}
    />
  );
}
