import CrudPage from '../generic/CrudPage';

export default function PackagesPage() {
  return (
    <CrudPage
      title="Packages"
      basePath="/admin/packages"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'price', label: 'Price (KWD)' },
        { key: 'credits', label: 'Credits' },
        { key: 'validity_days', label: 'Validity (days)' },
        { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'price', label: 'Price (KWD)', type: 'number', required: true },
        { name: 'credits', label: 'Credits', type: 'number', required: true },
        { name: 'validityDays', label: 'Validity (days)', type: 'number' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
        { name: 'isActive', label: 'Active', type: 'checkbox' },
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
