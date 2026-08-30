import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/layout/AdminLayout';
import { getResource, putResource } from '../../api/adminApi';

export default function HomeVideoPage() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getResource('/admin/site-settings/home-video')
      .then((data) => setUrl(data?.url || ''))
      .finally(() => setLoading(false));
  }, []);

  const onSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await putResource('/admin/site-settings/home-video', { url });
      setMessage(t('cms.saved'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={t('nav.homeVideo')}>
      <div className="max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-espresso-800">{t('cms.homeVideoUrl')}</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={loading}
            className="w-full rounded-2xl border border-linen-300 px-4 py-3 text-espresso-900 focus:outline-none focus:ring-2 focus:ring-carissma-500"
          />
          <span className="mt-2 block text-xs text-espresso-500">{t('cms.homeVideoHint')}</span>
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
