import { useTranslation } from 'react-i18next';
import CrudPage from '../generic/CrudPage';

export default function SchoolsPage() {
  const { t } = useTranslation();
  return (
    <CrudPage
      title={t('schools.title')}
      basePath="/admin/schools"
      columns={[
        { key: 'name', label: t('common.name') },
        { key: 'code', label: t('common.code') },
        { key: 'contact_email', label: t('common.contactEmail') },
        { key: 'is_active', label: t('common.active'), render: (r) => (r.is_active ? t('common.yes') : t('common.no')) },
      ]}
      fields={[
        { name: 'name', label: t('common.name'), required: true },
        { name: 'code', label: t('common.code'), required: true },
        { name: 'contactEmail', label: t('common.contactEmail'), type: 'email' },
        { name: 'contactPhone', label: t('common.contactPhone') },
        { name: 'address', label: t('common.address'), type: 'textarea' },
        { name: 'isActive', label: t('common.active'), type: 'checkbox' },
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
