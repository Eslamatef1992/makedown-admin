import CrudPage from '../generic/CrudPage';

export default function SchoolsPage() {
  return (
    <CrudPage
      title="Schools"
      basePath="/admin/schools"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'contact_email', label: 'Contact email' },
        { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'code', label: 'Code', required: true },
        { name: 'contactEmail', label: 'Contact email', type: 'email' },
        { name: 'contactPhone', label: 'Contact phone' },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'isActive', label: 'Active', type: 'checkbox' },
      ]}
      toForm={(row) => ({
        name: row.name,
        code: row.code,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        address: row.address,
        isActive: Boolean(row.is_active),
      })}
    />
  );
}
