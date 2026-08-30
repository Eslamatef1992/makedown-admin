import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import { getResource, putResource } from '../../api/adminApi';

export default function ContactInfoPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ companyEmail: '', supportEmail: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getResource('/admin/site-settings/contact-info')
      .then((data) =>
        setForm({
          companyEmail: data?.companyEmail || '',
          supportEmail: data?.supportEmail || '',
          phone: data?.phone || '',
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await putResource('/admin/site-settings/contact-info', form);
      setMessage(t('cms.saved'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={t('nav.contactInfo')}>
      <div className="max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-espresso-800">{t('cms.companyEmail')}</span>
          <input
            value={form.companyEmail}
            onChange={update('companyEmail')}
            placeholder="hello@makedown.online"
            disabled={loading}
            className="w-full rounded-2xl border border-linen-300 px-4 py-3 text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-500"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-espresso-800">{t('cms.supportEmail')}</span>
          <input
            value={form.supportEmail}
            onChange={update('supportEmail')}
            placeholder="support@makedown.online"
            disabled={loading}
            className="w-full rounded-2xl border border-linen-300 px-4 py-3 text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-500"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-medium text-espresso-800">{t('cms.phone')}</span>
          <input
            value={form.phone}
            onChange={update('phone')}
            placeholder="+965 ..."
            disabled={loading}
            className="w-full rounded-2xl border border-linen-300 px-4 py-3 text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-500"
          />
          <span className="mt-2 block text-xs text-espresso-500">{t('cms.contactInfoHint')}</span>
        </label>

        {message && <p className="mt-4 rounded-xl bg-carissma-50 px-3 py-2 text-sm text-carissma-700">{message}</p>}

        <button
          onClick={onSave}
          disabled={saving || loading}
          className="mt-6 rounded-xl bg-carissma-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-carissma-700 disabled:opacity-60"
        >
          {saving ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </AdminLayout>
  );
}
