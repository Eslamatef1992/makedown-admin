import CrudPage from '../generic/CrudPage';

export default function AdminsPage() {
  return (
    <CrudPage
      title="Admins"
      basePath="/admin/admins"
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'is_active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
        { key: 'last_login_at', label: 'Last login', render: (r) => r.last_login_at || '—' },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'password', label: 'Password (leave blank to keep current)', type: 'password' },
        { name: 'isActive', label: 'Active', type: 'checkbox' },
      ]}
      toForm={(row) => ({ name: row.name, email: row.email, isActive: Boolean(row.is_active) })}
    />
  );
}
